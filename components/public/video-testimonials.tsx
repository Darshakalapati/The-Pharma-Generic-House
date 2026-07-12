import { createClient } from '@/lib/supabase/server';
import type { Video } from '@/lib/types';
import { VideoCarousel } from './video-carousel';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';

export async function VideoTestimonials() {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  const videos = (data as Video[] | null) ?? [];

  // Hide the entire section when there are no active videos.
  if (videos.length === 0) return null;

  return (
    <ScrollReveal as="section" className="container-public mt-20 sm:mt-28">
      <ScrollRevealItem as="div" className="max-w-2xl">
        <span className="eyebrow">Videos</span>
        <h2 className="h-section mt-4">Inside our shop.</h2>
        <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
          Short videos from the pharmacy — products, services, and updates.
        </p>
      </ScrollRevealItem>

      <ScrollRevealItem as="div" className="mt-10">
        <VideoCarousel videos={videos} />
      </ScrollRevealItem>
    </ScrollReveal>
  );
}
