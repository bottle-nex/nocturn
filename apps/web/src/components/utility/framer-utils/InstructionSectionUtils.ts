import { Variants } from 'framer-motion';

export const pill: Variants = {
    hidden: {
        width: 60,
        opacity: 0,
        scale: 0.85,
    },
    show: {
        width: 1020,
        opacity: 1,
        scale: 1,
        transition: {
            delay: 0.4,
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export const pillContent: Variants = {
    hidden: { opacity: 0, y: 8, filter: 'blur(6px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            delay: 1.2,
            duration: 0.6,
        },
    },
};

export const cards: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(6px)' },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            delay: 1.8 + i * 0.12,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};
