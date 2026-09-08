import { cn, initials } from '@/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

const colors = [
  'bg-brand-100 text-brand-700',
  'bg-inplaz-100 text-inplaz-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

function colorFor(name: string): string {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('flex items-center justify-center rounded-full font-semibold shrink-0', sizes[size], colorFor(name), className)}>
      {initials(name)}
    </div>
  );
}
