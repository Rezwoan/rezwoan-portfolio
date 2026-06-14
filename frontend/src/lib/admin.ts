import { API_BASE, apiFetch } from './api';

async function j(res: Response) {
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const auth = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(j),
  me: () => apiFetch('/auth/me').then(j),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }).then(j),
};

/** Generic CRUD for admin resources. */
export function resource<T = any>(name: string) {
  return {
    list: (): Promise<T[]> => apiFetch(`/admin/${name}`).then(j),
    get: (id: string): Promise<T> => apiFetch(`/admin/${name}/${id}`).then(j),
    create: (data: Partial<T>): Promise<T> =>
      apiFetch(`/admin/${name}`, { method: 'POST', body: JSON.stringify(data) }).then(j),
    update: (id: string, data: Partial<T>): Promise<T> =>
      apiFetch(`/admin/${name}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(j),
    remove: (id: string) => apiFetch(`/admin/${name}/${id}`, { method: 'DELETE' }).then(j),
  };
}

export const adminApi = {
  projects: resource('projects'),
  blog: resource('blog'),
  skills: resource('skills'),
  experiences: resource('experiences'),
  testimonials: resource('testimonials'),
  tags: resource('tags'),
  settings: {
    get: () => apiFetch('/admin/site-settings').then(j),
    update: (data: any) => apiFetch('/admin/site-settings', { method: 'PATCH', body: JSON.stringify(data) }).then(j),
  },
  contact: {
    list: () => apiFetch('/admin/contact').then(j),
    markRead: (id: string, read = true) =>
      apiFetch(`/admin/contact/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) }).then(j),
    remove: (id: string) => apiFetch(`/admin/contact/${id}`, { method: 'DELETE' }).then(j),
  },
  importGithub: (repoUrl: string) =>
    apiFetch('/admin/import/github', { method: 'POST', body: JSON.stringify({ repoUrl }) }).then(j),
  async upload(file: File): Promise<{ url: string; name: string; width?: number; height?: number }> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/api/admin/uploads`, { method: 'POST', credentials: 'include', body: fd });
    return j(res);
  },
};
