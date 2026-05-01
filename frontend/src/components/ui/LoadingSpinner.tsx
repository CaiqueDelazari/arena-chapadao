import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin', sizes[size])} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse">
      <div className="h-12 w-12 bg-slate-200 rounded-xl shimmer" />
      <div className="h-5 bg-slate-200 rounded w-3/4 shimmer" />
      <div className="h-4 bg-slate-200 rounded w-1/2 shimmer" />
    </div>
  );
}
