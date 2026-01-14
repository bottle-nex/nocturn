import { Variants } from 'framer-motion';

export const imageReveal: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

export const container: Variants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.25,
            staggerChildren: 0.12,
        },
    },
};

export const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 48,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
};
