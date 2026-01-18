import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './motion';

type AnimatedButtonProps = {
    href?: string;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    ariaLabel?: string;
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    href,
    onClick,
    className,
    children,
    type = 'button',
    disabled = false,
    ariaLabel,
}) => {
    const animationProps = {
        whileHover: { scale: disabled ? 1 : 1.05 },
        whileTap: { scale: disabled ? 1 : 0.95 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
    };

    if (href) {
        return (
            <motion.a
                href={href}
                className={cn(className)}
                aria-label={ariaLabel}
                {...animationProps}
            >
                {children}
            </motion.a>
        );
    }

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(className)}
            aria-label={ariaLabel}
            {...animationProps}
        >
            {children}
        </motion.button>
    );
};
