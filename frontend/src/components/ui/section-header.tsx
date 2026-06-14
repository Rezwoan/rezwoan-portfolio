import { FadeUp } from '@/components/animations';

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <FadeUp className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
        <span className="h-px w-6 bg-accent" /> {eyebrow}
      </p>
      <h2 className="text-display font-bold">{title}</h2>
      {description && <p className="mt-3 text-text-secondary">{description}</p>}
    </FadeUp>
  );
}
