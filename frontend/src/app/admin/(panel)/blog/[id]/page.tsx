'use client';

import { useParams } from 'next/navigation';
import { BlogEditor } from '@/components/admin/blog-editor';

export default function EditPost() {
  const params = useParams();
  return <BlogEditor id={String(params.id)} />;
}
