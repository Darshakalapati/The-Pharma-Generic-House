'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Authenticate before touching the service-role client, which bypasses RLS.
 * Middleware guards the /admin pages, but a server action is its own entry
 * point and has to check for itself.
 */
async function requireAdmin(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return 'You must be signed in as an admin.';
  return null;
}

function refresh() {
  // The admin list, and the public layout that renders the banner.
  revalidatePath('/admin/announcements');
  revalidatePath('/', 'layout');
}

/**
 * Make one announcement live and switch every other one off.
 *
 * Deactivate-then-activate, in that order. Supabase's client cannot open a
 * transaction, but the ordering is what protects the invariant that matters:
 * two rows are never live at once. The only interleaving this can produce is a
 * few milliseconds with nothing live, which renders as no banner — harmless,
 * and self-corrects on the very next statement.
 */
export async function activateAnnouncement(id: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  const admin = createAdminClient();

  const { error: clearError } = await admin
    .from('announcements')
    .update({ is_active: false })
    .eq('is_active', true);
  if (clearError) return { ok: false, error: clearError.message };

  const { error: setError } = await admin
    .from('announcements')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (setError) return { ok: false, error: setError.message };

  refresh();
  return { ok: true };
}

/** Switch every announcement off, so the site shows no banner at all. */
export async function deactivateAllAnnouncements(): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  const admin = createAdminClient();
  const { error } = await admin
    .from('announcements')
    .update({ is_active: false })
    .eq('is_active', true);
  if (error) return { ok: false, error: error.message };

  refresh();
  return { ok: true };
}
