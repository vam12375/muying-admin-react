import type { Variants } from 'framer-motion'

/**
 * 预设动画变体集合
 * 提供统一的动画效果，确保整个应用的动画一致性
 */

// 淡入淡出动画
export const fadeAnimation: Variants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 从底部滑入
export const slideUpAnimation: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1]  // 自定义曲线，更自然的弹性效果
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 从上方滑入
export const slideDownAnimation: Variants = {
  initial: { 
    opacity: 0, 
    y: -20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 从左侧滑入
export const slideRightAnimation: Variants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 从右侧滑入
export const slideLeftAnimation: Variants = {
  initial: { 
    opacity: 0, 
    x: 20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 缩放动画
export const scaleAnimation: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 弹性放大动画
export const bounceAnimation: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.8 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

// 卡片悬浮效果
export const hoverCardAnimation = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: { 
    scale: 1.02,
    y: -5,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: { 
    scale: 0.98,
    transition: { 
      duration: 0.15,
      ease: 'easeIn'
    }
  }
}

// 按钮悬浮效果
export const hoverButtonAnimation = {
  rest: { 
    scale: 1,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      duration: 0.1,
      ease: 'easeIn'
    }
  }
}

// 列表子项动画
export const listItemAnimation: Variants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      delay: index * 0.05, // 错开子项的动画开始时间
      ease: 'easeOut'
    }
  }),
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

// 磨砂玻璃卡片进入动画
export const glassCardAnimation: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    backdropFilter: 'blur(0px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    backdropFilter: 'blur(10px)',
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    backdropFilter: 'blur(0px)',
    transition: { 
      duration: 0.4,
      ease: 'easeIn'
    }
  }
}

// 页面过渡动画
export const pageTransitionAnimation: Variants = {
  initial: { 
    opacity: 0,
    x: -10 
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: { 
    opacity: 0,
    x: 10,
    transition: { 
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1]
    }
  }
}

// 容器内子项编排动画（用于列表、网格等）
export const staggerContainerAnimation: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
} 