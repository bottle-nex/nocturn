import AppLogo from '../app/AppLogo';
import PerspectiveCard from '../utility/PerspectiveCard';
import { motion } from 'framer-motion';

export default function LandingFaqFloatingBubbleComponent() {
    return (
        <PerspectiveCard
            className="w-full bg-light-base/70 rounded-xl p-6 space-y-4 h-full relative overflow-hidden"
            shadowColor="0,0,0"
            sticky
            stickyTop={10}
        >
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
                <AppLogo size={220} />
            </div>

            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="h-22 w-22 rounded-full bg-alpha/50 absolute -top-7 left-20"
            />
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.3,
                }}
                className="h-6 w-6 rounded-full bg-alpha/60 absolute top-24 left-12"
            />
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6,
                }}
                className="h-4 w-4 rounded-full bg-alpha/80 absolute top-38 left-28"
            />
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6,
                }}
                className="h-4 w-4 rounded-full bg-alpha/80 absolute bottom-22 right-38"
            />
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.2,
                }}
                className="h-12 w-12 rounded-full bg-alpha/80 absolute top-48 left-5"
            />
            <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.8,
                }}
                className="h-25 w-25 rounded-full bg-alpha/20 absolute bottom-0 -left-20"
            />
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.0,
                }}
                className="h-2 w-2 rounded-full bg-alpha/90 absolute top-1/2 left-37 mt-2"
            />
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 2.7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                }}
                className="h-4 w-4 rounded-full bg-alpha/90 absolute top-1/2 left-32 mt-15"
            />
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.2,
                }}
                className="h-2 w-2 rounded-full bg-alpha/90 absolute top-1/2 right-42 mt-8"
            />
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                    duration: 2.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.4,
                }}
                className="h-2 w-2 rounded-full bg-alpha/90 absolute top-27 right-44 mt-8"
            />
            <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.7,
                }}
                className="h-15 w-15 rounded-full bg-alpha/80 absolute -bottom-6 left-45 mt-8"
            />
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 3.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.9,
                }}
                className="h-12 w-12 rounded-full bg-alpha/80 absolute bottom-8 right-5 mt-8"
            />
            <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.1,
                }}
                className="h-12 w-12 rounded-full bg-alpha/80 absolute top-10 right-10 mt-8"
            />
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 3.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.1,
                }}
                className="h-4 w-4 rounded-full bg-alpha/80 absolute top-42 right-28"
            />
        </PerspectiveCard>
    );
}
