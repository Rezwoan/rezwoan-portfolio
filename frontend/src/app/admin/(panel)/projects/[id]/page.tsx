'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ProjectEditor } from '@/components/admin/project-editor';

export default function EditProject() {
  const params = useParams();
  const id = String(params.id);
  return (
    <Suspense fallback={null}>
      <ProjectEditor id={id} />
    </Suspense>
  );
}
