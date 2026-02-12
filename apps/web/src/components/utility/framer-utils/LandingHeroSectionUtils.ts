export const container = {
    closed: {
        width: 135,
        transition: {
            when: 'afterChildren',
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
    open: {
        width: 288,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.12,
        },
    },
};

export const text = {
    closed: { opacity: 1, x: 0 },
    open: { opacity: 0, x: -10 },
};

export const input = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
};

export const closeBtn = {
    closed: { opacity: 0, scale: 0.7 },
    open: { opacity: 1, scale: 1 },
};
