import React from 'react';
import { motion } from 'framer-motion';

interface FloatingIcon {
  id: number;
  icon: React.ReactNode;
  x: string;
  y: string;
  delay: number;
  duration: number;
  scale: number;
}

interface FloatingIconsProps {
  className?: string;
}

const FloatingIcons: React.FC<FloatingIconsProps> = ({ className = '' }) => {
  // 母婴主题图标
  const icons: FloatingIcon[] = [
    {
      id: 1,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5C15.8 11.5 16.5 12.2 16.5 13S15.8 14.5 15 14.5 13.5 13.8 13.5 13 14.2 11.5 15 11.5M9 13.5C9.8 13.5 10.5 14.2 10.5 15S9.8 16.5 9 16.5 7.5 15.8 7.5 15 8.2 13.5 9 13.5M4.5 10.5V9L3 9V7L9 7.5V9H7.5V10.5H9V12H7.5V13.5H9V15H7.5V16.5H9V18H7.5V19.5H9V21H4.5V19.5H6V18H4.5V16.5H6V15H4.5V13.5H6V12H4.5V10.5M15 16.5H13.5V18H15V16.5M15 19.5H13.5V21H15V19.5Z"/>
        </svg>
      ),
      x: '10%',
      y: '20%',
      delay: 0,
      duration: 6,
      scale: 0.8
    },
    {
      id: 2,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
        </svg>
      ),
      x: '85%',
      y: '15%',
      delay: 1,
      duration: 8,
      scale: 0.6
    },
    {
      id: 3,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
      ),
      x: '15%',
      y: '70%',
      delay: 2,
      duration: 7,
      scale: 0.7
    },
    {
      id: 4,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
        </svg>
      ),
      x: '80%',
      y: '75%',
      delay: 3,
      duration: 9,
      scale: 0.5
    },
    {
      id: 5,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M9,11H15L13.5,7.5L12,10.5L10.5,7.5L9,11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
        </svg>
      ),
      x: '5%',
      y: '50%',
      delay: 4,
      duration: 10,
      scale: 0.9
    },
    {
      id: 6,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
        </svg>
      ),
      x: '90%',
      y: '45%',
      delay: 5,
      duration: 8,
      scale: 0.4
    }
  ];

  // 浮动动画变体
  const floatingVariants = {
    animate: (custom: FloatingIcon) => ({
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 5, -5, 0],
      scale: [custom.scale, custom.scale * 1.1, custom.scale],
      transition: {
        duration: custom.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: custom.delay
      }
    })
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {icons.map((iconData) => (
        <motion.div
          key={iconData.id}
          className="absolute w-8 h-8 text-pink-300/30"
          style={{
            left: iconData.x,
            top: iconData.y,
          }}
          variants={floatingVariants}
          animate="animate"
          custom={iconData}
        >
          {iconData.icon}
        </motion.div>
      ))}
      
      {/* 额外的装饰性元素 */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-pink-400/10 to-blue-400/10 blur-xl"
        style={{ left: '20%', top: '30%' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-xl"
        style={{ right: '15%', bottom: '25%' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
};

export default FloatingIcons;
