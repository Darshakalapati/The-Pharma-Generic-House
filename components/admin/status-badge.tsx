import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';

const MAP: Record<string, BadgeProps['variant']> = {
  pending: 'warning',
  new: 'warning',
  confirmed: 'info',
  contacted: 'info',
  read: 'info',
  completed: 'success',
  replied: 'success',
  cancelled: 'destructive',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={MAP[status] ?? 'muted'}>{status}</Badge>;
}
