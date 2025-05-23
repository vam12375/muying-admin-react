import * as React from "react";
import {
  HTMLMotionProps,
  motion,
  Variant,
  AnimatePresence,
  Transition,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Animation types
export type AnimationType = 
  | "fade" 
  | "slideUp" 
  | "slideDown" 
  | "slideLeft" 
  | "slideRight" 
  | "scale" 
  | "blur" 
  | "rotate";

// Animation variants
const ANIMATION_VARIANTS: Record<AnimationType, { initial: Variant; animate: Variant; exit?: Variant }> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
  slideDown: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  slideRight: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  blur: {
    initial: { filter: "blur(8px)", opacity: 0 },
    animate: { filter: "blur(0px)", opacity: 1 },
    exit: { filter: "blur(8px)", opacity: 0 },
  },
  rotate: {
    initial: { rotate: -10, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 10, opacity: 0 },
  },
};

// Default transition
const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  duration: 0.3,
};

export interface MotionWrapperProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition"> {
  /**
   * The type of animation to apply
   * @default "fade"
   */
  animation?: AnimationType;
  
  /**
   * Custom transition properties
   */
  customTransition?: Transition;
  
  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;
  
  /**
   * Whether to animate when the component is removed
   * @default true
   */
  animateOnExit?: boolean;
  
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether to animate when in view
   * @default false
   */
  animateWhenInView?: boolean;
  
  /**
   * Amount of element that needs to be in view before animating (0-1)
   * @default 0.1
   */
  viewportAmount?: number;
  
  /**
   * Whether to animate only once when in view
   * @default true
   */
  viewportOnce?: boolean;
  
  /**
   * Children to animate
   */
  children: React.ReactNode;
}

/**
 * 动画包装组件
 * 用于给子组件添加各种入场动画效果
 */
const MotionWrapper = ({
  animation = "fade",
  customTransition,
  animateOnMount = true,
  animateOnExit = true,
  delay = 0,
  animateWhenInView = false,
  viewportAmount = 0.1,
  viewportOnce = true,
  children,
  className,
  ...props
}: MotionWrapperProps) => {
  const [isVisible, setIsVisible] = React.useState(animateOnMount ? false : true);
  const [key, setKey] = React.useState(0);
  
  const variants = ANIMATION_VARIANTS[animation];
  const transition = { ...DEFAULT_TRANSITION, delay, ...customTransition };
  
  React.useEffect(() => {
    if (animateOnMount) {
      setIsVisible(true);
    }
  }, [animateOnMount]);
  
  // Force re-animation when animation type changes
  React.useEffect(() => {
    setKey(prev => prev + 1);
  }, [animation]);
  
  const motionProps = {
    initial: "initial",
    animate: isVisible ? "animate" : "initial",
    exit: "exit",
    variants,
    transition,
  };
  
  if (animateWhenInView) {
    return (
      <motion.div
        key={key}
        className={cn("", className)}
        initial="initial"
        whileInView="animate"
        viewport={{ 
          once: viewportOnce,
          amount: viewportAmount 
        }}
        variants={variants}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  if (animateOnExit) {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={key}
            className={cn("", className)}
            {...motionProps}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
  
  return (
    <motion.div
      key={key}
      className={cn("", className)}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default MotionWrapper; 