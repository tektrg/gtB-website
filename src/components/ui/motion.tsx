import React from 'react';
import { motion, type HTMLMotionProps, type Variants, useScroll, useTransform, useSpring, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hook to detect reduced motion preference
export function useReducedMotion() {
  return useFramerReducedMotion();
}

type MotionComponentProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string };
};

// --- Variants ---
const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number; duration: number; shouldReduce: boolean }) => ({
    opacity: 1,
    transition: { delay: custom.shouldReduce ? 0 : custom.delay, duration: custom.shouldReduce ? 0 : custom.duration, ease: "easeOut" },
  }),
};

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: { delay: number; duration: number; shouldReduce: boolean }) => ({
    opacity: 1,
    y: custom.shouldReduce ? 0 : 0,
    transition: { delay: custom.shouldReduce ? 0 : custom.delay, duration: custom.shouldReduce ? 0 : custom.duration, ease: "easeOut" },
  }),
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom: { delay: number; duration: number; shouldReduce: boolean }) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: custom.shouldReduce ? 0 : custom.delay, duration: custom.shouldReduce ? 0 : custom.duration, ease: "easeOut" },
  }),
};

// --- Components ---

export const FadeIn: React.FC<MotionComponentProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewport = { once: true, margin: "-50px" },
  ...props
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInVariants}
      custom={{ delay, duration, shouldReduce }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp: React.FC<MotionComponentProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
  viewport = { once: true, margin: "-50px" },
  ...props
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={slideUpVariants}
      custom={{ delay, duration, shouldReduce }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn: React.FC<MotionComponentProps> = ({
  children,
  delay = 0,
  duration = 0.4,
  className,
  viewport = { once: true, margin: "-50px" },
  ...props
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={scaleInVariants}
      custom={{ delay, duration, shouldReduce }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Stagger ---
type StaggerContainerProps = HTMLMotionProps<"div"> & {
  staggerDelay?: number;
  delayChildren?: number;
};

const staggerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
};

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  className,
  viewport = { once: true, margin: "-50px" },
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerVariants}
      custom={{ staggerDelay, delayChildren }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Helper for Staggered items (must be direct children of StaggerContainer or use variants manually)
export const StaggerItem: React.FC<MotionComponentProps> = ({
  children,
  className,
  variants = slideUpVariants,
  // Note: StaggerItem typically relies on parent's orchestration,
  // but if we pass variants here, they must match the parent's "hidden"/"visible" keys.
  ...props
}) => {
  return (
    <motion.div
      variants={variants}
      className={cn(className)}
      // custom isn't usually needed for children in orchestrated stagger, but can be passed if variants need it
      custom={{ delay: 0, duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Parallax ---
type ParallaxScrollProps = HTMLMotionProps<"div"> & {
  offset?: number;
  sensitivity?: number;
};

export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  className,
  offset = 50,
  sensitivity = 0.5, // 0 to 1, higher means more movement
  ...props
}) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 300, damping: 30, restDelta: 0.001 };

  // Create a spring-based value for smoother movement
  const springScroll = useSpring(scrollYProgress, springConfig);

  // Map scroll progress (0 to 1) to transform range
  // e.g., move from y = offset to y = -offset
  const y = useTransform(springScroll, [0, 1], [offset, -offset]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <motion.div style={{ y }} {...props}>
        {children}
      </motion.div>
    </div>
  );
};

// --- Text Animations ---
export const WordReveal: React.FC<MotionComponentProps & { text: string; wrapperClassName?: string }> = ({
  text,
  className,
  wrapperClassName,
  delay = 0,
  duration = 0.5,
  viewport = { once: true, margin: "-10%" }, // Trigger a bit later
  ...props
}) => {
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (custom: { delay: number }) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Slower stagger for more visibility
        delayChildren: custom.delay,
      }
    })
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10, // Reduce distance
      transition: { type: "spring", damping: 12, stiffness: 100 }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration
      }
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }} // Eager trigger
      variants={containerVariants}
      custom={{ delay }}
      className={cn("inline-block", wrapperClassName)}
      {...props}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          className={cn("inline-block mr-[0.25em] last:mr-0", className)} // inline-block to allow transform
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

