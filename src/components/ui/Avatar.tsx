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
  'bg-accent text-accent-foreground',
  'bg-sidebar/10 text-sidebar-foreground',
  'bg-warning/10 text-warning',
  'bg-secondary text-secondary-foreground',
  'bg-destructive/10 text-destructive',
  'bg-info/10 text-info',
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
