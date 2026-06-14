import { Suspense } from 'react';
import { ProjectEditor } from '@/components/admin/project-editor';

export default function NewProject() {
  return (
    <Suspense fallback={null}>
      <ProjectEditor />
    </Suspense>
  );
}
