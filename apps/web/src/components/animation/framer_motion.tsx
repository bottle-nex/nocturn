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

export const motionButtonVariants: Variants = {
    rest: {
        backgroundColor: '#3C315B',
    },
    hover: {
        backgroundColor: '#F5F2FF',
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
};

export const frontText: Variants = {
    rest: {
        rotateX: 0,
        y: 0,
        opacity: 1,
        color: '#F5F2FF',
    },
    hover: {
        rotateX: -90,
        y: '-50%',
        opacity: 0,
        color: '#3C315B',
        transition: {
            duration: 0.25,
            ease: 'easeIn',
        },
    },
};

export const backText: Variants = {
    rest: {
        rotateX: 90,
        y: '50%',
        opacity: 0,
        color: '#3C315B',
    },
    hover: {
        rotateX: 0,
        y: 0,
        opacity: 1,
        color: '#3C315B',
        transition: {
            duration: 0.25,
            delay: 0.2,
            ease: 'easeOut',
        },
    },
};
