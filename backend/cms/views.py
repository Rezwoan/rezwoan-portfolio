"""
cms/views.py — All DRF API views + utility views.
Phase 4 fix: RSS feed uses django.utils.timezone (no extra pytz import needed).
"""
from django.contrib.syndication.views import Feed
from django.http import HttpResponse
from django.utils import timezone
from django.utils.feedgenerator import Rss201rev2Feed
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from wagtail.models import Site

from .models import (
    Project, Experience, Skill, BlogPost,
    Testimonial, ContactSubmission, SiteSettings,
)
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer,
    ExperienceSerializer, SkillSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer,
    TestimonialSerializer, ContactSubmissionSerializer,
    SiteSettingsSerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_site_settings(request):
    try:
        site = Site.find_for_request(request)
        return SiteSettings.for_site(site)
    except Exception:
        return SiteSettings.objects.first()


# ---------------------------------------------------------------------------
# robots.txt & llms.txt
# ---------------------------------------------------------------------------   

@require_GET
@cache_page(60 * 60 * 24)
def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /cms/",
        "Disallow: /django-admin/",
        "Disallow: /api/",
        "",
        f"Sitemap: {request.scheme}://{request.get_host()}/sitemap.xml",        
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")

@require_GET
@cache_page(60 * 60 * 24)
def llms_txt(request):
    site_settings = _get_site_settings(request)
    
    # Safe defaults if SiteSettings is not yet created in Wagtail Admin
    full_name = getattr(site_settings, 'full_name', 'Din Muhammad Rezwoan')
    bio = getattr(site_settings, 'bio_long', '') or getattr(site_settings, 'bio_short', 'Backend & Frontend Developer')
    github_url = getattr(site_settings, 'github_url', 'https://github.com/Rezwoan')
    linkedin_url = getattr(site_settings, 'linkedin_url', '')
    email = getattr(site_settings, 'email', '')

    # Base Info
    content = f"# {full_name} - Portfolio Context\n\n"
    content += f"## Bio\n{bio}\n\n"
    
    # Skills
    skills = Skill.objects.all()
    if skills.exists():
        content += "## Skills\n"
        for s in skills:
            content += f"- {s.name} ({s.category})\n"
        content += "\n"

    # Experiences
    experiences = Experience.objects.all().order_by('-start_date')
    if experiences.exists():
        content += "## Professional Experience\n"
        for exp in experiences:
            start = exp.start_date.strftime("%b %Y") if exp.start_date else ""
            if exp.is_current or not exp.end_date:
                dr = f"{start} - Present"
            else:
                dr = f"{start} - {exp.end_date.strftime('%b %Y')}"
            content += f"- {exp.role} at {exp.company_name} ({dr})\n"
        content += "\n"

    # Projects
    projects = Project.objects.filter(published=True)
    if projects.exists():
        content += "## Notable Projects\n"
        for p in projects:
            # Fixing field name to short_description
            content += f"- {p.title}: {getattr(p, 'short_description', '')}\n"
        content += "\n"
        
    # Links
    content += "## Contact & Links\n"
    if github_url:
        content += f"- GitHub: {github_url}\n"
    if linkedin_url:
        content += f"- LinkedIn: {linkedin_url}\n"
    if email:
        content += f"- Email: {email}\n"

    return HttpResponse(content, content_type="text/plain; charset=utf-8")

# ---------------------------------------------------------------------------
# RSS Feed
# ---------------------------------------------------------------------------

class BlogRssFeed(Feed):
    feed_type = Rss201rev2Feed
    title = "Rezwoan's Blog"
    description = "Articles on web development, Django, Next.js, and building things."

    def link(self):
        return "/"

    def items(self):
        return BlogPost.objects.live().order_by("-published_date")[:20]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt

    def item_pubdate(self, item):
        # Combine date with midnight time, make timezone-aware
        from datetime import datetime, time
        dt = datetime.combine(item.published_date, time.min)
        return timezone.make_aware(dt)

    def item_link(self, item):
        return f"/blog/{item.slug}/"


rss_feed = BlogRssFeed()


# ---------------------------------------------------------------------------
# Site Settings  GET /api/site-settings/
# ---------------------------------------------------------------------------

@api_view(["GET"])
def site_settings_api(request):
    settings_obj = _get_site_settings(request)

    if settings_obj:
        serializer = SiteSettingsSerializer(settings_obj, context={"request": request})
        return Response(serializer.data)

    # Defaults before CMS is seeded
    return Response({
        "full_name": "Din Muhammad Rezwoan",
        "short_name": "Rezwoan",
        "tagline": "Full Stack Developer · CSE Student · Freelancer",
        "bio_short": "Building web products with Next.js, Django, and a lot of coffee.",
        "bio_long": "",
        "available_for_work": True,
        "email": "",
        "github_url": "https://github.com/Rezwoan",
        "linkedin_url": "https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a",
        "twitter_url": "https://twitter.com/XRezwoan",
        "fiverr_url": "",
        "resume_pdf_url": None,
        "og_image": None,
        "google_analytics_id": "",
        "meta_title_suffix": " — Rezwoan",
    })


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

@api_view(["GET"])
def projects_list(request):
    qs = Project.objects.filter(published=True)
    if request.query_params.get("featured") == "true":
        qs = qs.filter(featured=True)
    if cat := request.query_params.get("category"):
        qs = qs.filter(category=cat)
    return Response(ProjectListSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
def project_detail(request, slug):
    try:
        project = Project.objects.get(slug=slug, published=True)
    except Project.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(ProjectDetailSerializer(project, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Experiences
# ---------------------------------------------------------------------------

@api_view(["GET"])
def experiences_list(request):
    qs = Experience.objects.all()
    return Response(ExperienceSerializer(qs, many=True, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

@api_view(["GET"])
def skills_list(request):
    qs = Skill.objects.all()
    if request.query_params.get("show_on_hero") == "true":
        qs = qs.filter(show_on_hero=True)
    if cat := request.query_params.get("category"):
        qs = qs.filter(category=cat)
    return Response(SkillSerializer(qs, many=True).data)


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------

class BlogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


@api_view(["GET"])
def blog_list(request):
    qs = BlogPost.objects.live().order_by("-published_date")
    if tag := request.query_params.get("tag"):
        qs = qs.filter(tags__name=tag)
    paginator = BlogPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = BlogPostListSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def blog_detail(request, slug):
    try:
        post = BlogPost.objects.live().get(slug=slug)
    except BlogPost.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(BlogPostDetailSerializer(post, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------

@api_view(["GET"])
def testimonials_list(request):
    qs = Testimonial.objects.all()
    if request.query_params.get("featured") == "true":
        qs = qs.filter(featured=True)
    return Response(TestimonialSerializer(qs, many=True, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Contact  POST /api/contact/
# ---------------------------------------------------------------------------

@api_view(["POST"])
def contact_submit(request):
    serializer = ContactSubmissionSerializer(data=request.data)
    if serializer.is_valid():
        x_fwd = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = x_fwd.split(",")[0].strip() if x_fwd else request.META.get("REMOTE_ADDR")
        serializer.save(ip_address=ip)
        return Response({"success": True}, status=status.HTTP_201_CREATED)
    return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
