'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

export const revealItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const revealContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export const cascadeContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const revealTags = {
  section: motion.section,
  div: motion.div,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  article: motion.article,
} as const;

type RevealTag = keyof typeof revealTags;

interface ScrollRevealProps extends Omit<HTMLMotionProps<'section'>, 'ref'> {
  as?: RevealTag;
  stagger?: number;
  className?: string;
  children: React.ReactNode;
}

export function ScrollReveal({
  as = 'section',
  stagger = 0.06,
  className,
  children,
  ...props
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  const Component = revealTags[as];

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </Tag>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

interface ScrollRevealItemProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  as?: RevealTag;
  className?: string;
  children: React.ReactNode;
}

export function ScrollRevealItem({
  as = 'div',
  className,
  children,
  ...props
}: ScrollRevealItemProps) {
  const reduced = useReducedMotion();
  const Component = revealTags[as];

  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </Tag>
    );
  }

  return (
    <Component className={className} variants={revealItemVariants} {...props}>
      {children}
    </Component>
  );
}

interface StaggerGridProps {
  className?: string;
  stagger?: number;
  style?: React.CSSProperties;
  /** When true, inherits reveal timing from a parent ScrollReveal instead of using its own whileInView. */
  inherit?: boolean;
  children: React.ReactNode;
}

/** Stagger-reveal wrapper for card grids (testimonials, reviews). */
export const StaggerGrid = React.forwardRef<
  HTMLDivElement,
  StaggerGridProps
>(function StaggerGrid({ className, stagger = 0.08, style, inherit = false, children }, ref) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  if (inherit) {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={style}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger } },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
});

export function StaggerGridItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={revealItemVariants}>
      {children}
    </motion.div>
  );
}
