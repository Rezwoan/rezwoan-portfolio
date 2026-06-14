import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { slugify } from '../common/slug';

interface ImportDraft {
  title: string;
  slug: string;
  shortDescription: string;
  body: string;
  category: string;
  liveUrl: string;
  githubUrl: string;
  coverImageUrl: string;
  repoStars: number;
  repoForks: number;
  repoLanguage: string | null;
  importedFrom: string;
  tagNames: string[];
  highlights: string[];
}

@Injectable()
export class GithubImportService {
  private readonly logger = new Logger(GithubImportService.name);

  constructor(private readonly gemini: GeminiService) {}

  async importFromUrl(repoUrl: string): Promise<ImportDraft> {
    const parsed = this.parse(repoUrl);
    if (!parsed) throw new BadRequestException('Not a valid GitHub repository URL');
    const { owner, repo } = parsed;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'rezwoan-portfolio-importer',
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const base = `https://api.github.com/repos/${owner}/${repo}`;
    const meta = await this.gh(base, headers);
    if (!meta) throw new NotFoundException('Repository not found or is private');

    const [languages, readme] = await Promise.all([
      this.gh(`${base}/languages`, headers).catch(() => ({})),
      this.fetchReadme(base, headers),
    ]);

    const langNames = Object.keys(languages || {});
    const topics: string[] = meta.topics || [];
    const baseTags = Array.from(new Set([...topics, ...langNames])).slice(0, 12);

    // Ask Gemini to write portfolio copy from the README + metadata.
    const ai = await this.gemini.json<{
      title: string;
      shortDescription: string;
      body: string;
      category: string;
      suggestedTags: string[];
      highlights: string[];
    }>(SYSTEM_PROMPT, buildUserPrompt(meta, langNames, readme));

    const title = ai?.title || meta.name || repo;
    const tagNames = Array.from(new Set([...(ai?.suggestedTags || []), ...baseTags]))
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    return {
      title,
      slug: slugify(title),
      shortDescription: (ai?.shortDescription || meta.description || '').slice(0, 200),
      body: ai?.body || fallbackBody(meta, readme),
      category: normalizeCategory(ai?.category, topics, langNames),
      liveUrl: meta.homepage || '',
      githubUrl: meta.html_url || repoUrl,
      coverImageUrl: '',
      repoStars: meta.stargazers_count ?? 0,
      repoForks: meta.forks_count ?? 0,
      repoLanguage: meta.language ?? null,
      importedFrom: repoUrl,
      tagNames,
      highlights: ai?.highlights || [],
    };
  }

  private parse(url: string): { owner: string; repo: string } | null {
    try {
      const u = new URL(url.trim());
      if (!/github\.com$/i.test(u.hostname)) return null;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    } catch {
      return null;
    }
  }

  private async gh(url: string, headers: Record<string, string>): Promise<any | null> {
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (res.status === 403) throw new BadRequestException('GitHub rate limit hit — add a GITHUB_TOKEN');
    if (!res.ok) throw new BadRequestException(`GitHub API error (${res.status})`);
    return res.json();
  }

  private async fetchReadme(base: string, headers: Record<string, string>): Promise<string> {
    try {
      const res = await fetch(`${base}/readme`, { headers: { ...headers, Accept: 'application/vnd.github.raw' } });
      if (!res.ok) return '';
      const text = await res.text();
      return cleanReadme(text).slice(0, 12000);
    } catch {
      return '';
    }
  }
}

const SYSTEM_PROMPT = `You are a senior technical writer building a developer's portfolio. Given a GitHub repo's metadata and README, write concise, honest, recruiter- and client-friendly copy. Never invent features, metrics, or outcomes not supported by the README. Output STRICT JSON only with keys: title, shortDescription, body, category, suggestedTags, highlights.
- shortDescription: <=160 chars, a punchy hook, no fluff.
- body: Markdown case study with sections "## Overview", "## Key Features", "## Tech & Approach", "## Links / Status". Use only real info.
- category: one of web, mobile, tool, open-source, ai.
- suggestedTags: array of normalized tech names (e.g. "Next.js","NestJS","Prisma").
- highlights: 3-6 short bullet strings.`;

function buildUserPrompt(meta: any, langs: string[], readme: string): string {
  const m = {
    name: meta.name,
    description: meta.description,
    topics: meta.topics,
    homepage: meta.homepage,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    primaryLanguage: meta.language,
    languages: langs,
    license: meta.license?.name,
    createdAt: meta.created_at,
  };
  return `REPO METADATA:\n${JSON.stringify(m, null, 2)}\n\nREADME:\n${readme || '(no readme)'}\n`;
}

function fallbackBody(meta: any, readme: string): string {
  const head = `## Overview\n\n${meta.description || meta.name}\n\n`;
  return readme ? `${head}${readme}` : head;
}

function normalizeCategory(cat: string | undefined, topics: string[], langs: string[]): string {
  const allowed = ['web', 'mobile', 'tool', 'open-source', 'ai'];
  if (cat && allowed.includes(cat)) return cat;
  const hay = [...topics, ...langs].join(' ').toLowerCase();
  if (/(android|ios|flutter|react-native|swift|kotlin)/.test(hay)) return 'mobile';
  if (/(ai|ml|llm|gpt|tensorflow|pytorch)/.test(hay)) return 'ai';
  if (/(cli|script|automation|tool)/.test(hay)) return 'tool';
  return 'web';
}

function cleanReadme(md: string): string {
  return md
    .replace(/<img[^>]*>/gi, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '') // badge links
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/<[^>]+>/g, '')
    .trim();
}
