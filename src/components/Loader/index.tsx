import React from "react";
import { cn } from "@/lib/utils";
import {
  LoaderIcon,
  LoaderCircleIcon,
  type LucideProps,
} from "lucide-react";
import { motion } from "framer-motion";

// Types
export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 
    | "default"
    | "circle"
    | "circle-filled"
    | "ellipsis"
    | "ring"
    | "bars"
    | "infinite"
    | "dots"
    | "pulse"
    | "wave";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "white";
}

// Size classes
const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

// Color classes
const colorClasses = {
  primary: "text-primary-500 dark:text-primary-400",
  secondary: "text-secondary-500 dark:text-secondary-400",
  success: "text-success-500 dark:text-success-400",
  warning: "text-warning-500 dark:text-warning-400",
  danger: "text-danger-500 dark:text-danger-400",
  white: "text-white",
};

// Default variant
const Default = ({ className, size = "md", color = "primary", ...props }: Omit<LoaderProps, "variant">) => (
  <LoaderIcon 
    className={cn(
      "animate-spin", 
      sizeClasses[size], 
      colorClasses[color],
      className
    )} 
    aria-label="Loading" 
    {...props} 
  />
);

// Circle variant
const Circle = ({ className, size = "md", color = "primary", ...props }: Omit<LoaderProps, "variant">) => (
  <LoaderCircleIcon 
    className={cn(
      "animate-spin", 
      sizeClasses[size], 
      colorClasses[color],
      className
    )} 
    aria-label="Loading" 
    {...props} 
  />
);

// Circle filled variant
const CircleFilled = ({ className, size = "md", color = "primary", ...props }: Omit<LoaderProps, "variant">) => {
  const sizeValue = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }[size];

  return (
    <div className="relative" style={{ width: sizeValue, height: sizeValue }}>
      <div className="absolute inset-0 rotate-180">
        <LoaderCircleIcon
          className={cn("animate-spin", colorClasses[color], "opacity-20", className)}
          width={sizeValue}
          height={sizeValue}
          aria-label="Loading"
          {...props}
        />
      </div>
      <LoaderCircleIcon
        className={cn("relative animate-spin", colorClasses[color], className)}
        width={sizeValue}
        height={sizeValue}
        aria-label="Loading"
        {...props}
      />
    </div>
  );
};

// Ellipsis variant
const Ellipsis = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  const sizeValue = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      className={cn(colorClasses[color], className)}
      aria-label="Loading"
      {...props}
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="ellipsis1"
          begin="0;ellipsis3.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="ellipsis1.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="ellipsis3"
          begin="ellipsis1.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
};

// Ring variant
const Ring = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  const sizeValue = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 44 44"
      stroke="currentColor"
      className={cn(colorClasses[color], className)}
      aria-label="Loading"
      {...props}
    >
      <g fill="none" fillRule="evenodd" strokeWidth="2">
        <circle cx="22" cy="22" r="1">
          <animate
            attributeName="r"
            begin="0s"
            dur="1.8s"
            values="1; 20"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.165, 0.84, 0.44, 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            begin="0s"
            dur="1.8s"
            values="1; 0"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.3, 0.61, 0.355, 1"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="22" cy="22" r="1">
          <animate
            attributeName="r"
            begin="-0.9s"
            dur="1.8s"
            values="1; 20"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.165, 0.84, 0.44, 1"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            begin="-0.9s"
            dur="1.8s"
            values="1; 0"
            calcMode="spline"
            keyTimes="0; 1"
            keySplines="0.3, 0.61, 0.355, 1"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
};

// Bars variant
const Bars = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  const sizeValue = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      className={cn(colorClasses[color], className)}
      aria-label="Loading"
      {...props}
    >
      <style>{`
        .spinner-bar {
          animation: spinner-bars-animation .8s linear infinite;
          animation-delay: -.8s;
        }
        .spinner-bars-2 {
          animation-delay: -.65s;
        }
        .spinner-bars-3 {
          animation-delay: -0.5s;
        }
        @keyframes spinner-bars-animation {
          0% {
            y: 1px;
            height: 22px;
          }
          93.75% {
            y: 5px;
            height: 14px;
            opacity: 0.2;
          }
        }
      `}</style>
      <rect
        className="spinner-bar"
        x="1"
        y="1"
        width="6"
        height="22"
        fill="currentColor"
      />
      <rect
        className="spinner-bar spinner-bars-2"
        x="9"
        y="1"
        width="6"
        height="22"
        fill="currentColor"
      />
      <rect
        className="spinner-bar spinner-bars-3"
        x="17"
        y="1"
        width="6"
        height="22"
        fill="currentColor"
      />
    </svg>
  );
};

// Infinite variant
const Infinite = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  const sizeValue = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      className={cn(colorClasses[color], className)}
      aria-label="Loading"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray="205.271142578125 51.317785644531256"
        d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
        strokeLinecap="round"
        style={{
          transform: 'scale(0.8)',
          transformOrigin: '50px 50px',
        }}
      >
        <animate
          attributeName="stroke-dashoffset"
          repeatCount="indefinite"
          dur="2s"
          keyTimes="0;1"
          values="0;256.58892822265625"
        />
      </path>
    </svg>
  );
};

// Dots variant
const Dots = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)} aria-label="Loading" {...props}>
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-full bg-current",
            {
              "w-2 h-2": size === "xs",
              "w-2.5 h-2.5": size === "sm",
              "w-3 h-3": size === "md",
              "w-3.5 h-3.5": size === "lg",
              "w-4 h-4": size === "xl",
            },
            colorClasses[color]
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.1,
            ease: "easeInOut",
            repeat: Infinity,
            delay: index * 0.3,
          }}
        />
      ))}
    </div>
  );
};

// Pulse variant
const Pulse = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  return (
    <div 
      className={cn("relative", className)} 
      aria-label="Loading" 
      {...props}
    >
      <div 
        className={cn(
          "absolute inset-0 animate-pulse rounded-full border-2 border-current",
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
    </div>
  );
};

// Wave variant
const Wave = ({ size = "md", color = "primary", className, ...props }: Omit<LoaderProps, "variant">) => {
  const barWidth = {
    xs: "w-0.5",
    sm: "w-0.5",
    md: "w-0.5",
    lg: "w-1",
    xl: "w-1",
  }[size];

  const containerHeight = {
    xs: "h-4",
    sm: "h-5",
    md: "h-6",
    lg: "h-8",
    xl: "h-10",
  }[size];

  const heights = {
    xs: ["6px", "9px", "12px", "9px", "6px"],
    sm: ["7px", "10px", "13px", "10px", "7px"],
    md: ["8px", "12px", "16px", "12px", "8px"],
    lg: ["10px", "15px", "20px", "15px", "10px"],
    xl: ["12px", "18px", "24px", "18px", "12px"],
  }[size];

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        containerHeight,
        className
      )}
      aria-label="Loading"
      {...props}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-[wave_1s_ease-in-out_infinite] rounded-full",
            barWidth,
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            height: heights[i],
            backgroundColor: "currentColor",
          }}
        />
      ))}
    </div>
  );
};

// Main Loader component
const Loader = ({ 
  variant = "default", 
  size = "md", 
  color = "primary",
  className,
  ...props 
}: LoaderProps) => {
  switch (variant) {
    case "circle":
      return <Circle size={size} color={color} className={className} {...props} />;
    case "circle-filled":
      return <CircleFilled size={size} color={color} className={className} {...props} />;
    case "ellipsis":
      return <Ellipsis size={size} color={color} className={className} {...props} />;
    case "ring":
      return <Ring size={size} color={color} className={className} {...props} />;
    case "bars":
      return <Bars size={size} color={color} className={className} {...props} />;
    case "infinite":
      return <Infinite size={size} color={color} className={className} {...props} />;
    case "dots":
      return <Dots size={size} color={color} className={className} {...props} />;
    case "pulse":
      return <Pulse size={size} color={color} className={className} {...props} />;
    case "wave":
      return <Wave size={size} color={color} className={className} {...props} />;
    default:
      return <Default size={size} color={color} className={className} {...props} />;
  }
};

export default Loader; 