'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFoundFeaturesSection() {
    return (
        <div className="w-full max-w-270 mx-auto flex flex-col items-center pt-52 pb-28 px-6">
            {/* Pill badge */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-dark-base/[0.07] bg-light-base px-4 py-1.5 shadow-sm"
            >
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-red-400" />
                </span>
                <span className="text-xs font-medium text-dark-base/50 tracking-wide">
                    Page not found
                </span>
            </motion.div>

            {/* 404 Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                className="text-[120px] font-bold leading-none tracking-tighter text-dark-base/90 select-none"
            >
                404
            </motion.div>

            {/* Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
                className="text-4xl font-semibold text-dark-base text-center mt-4"
            >
                Lost in the unknown
            </motion.h1>

            {/* Subtext */}
            <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
                className="text-lg text-dark-base/50 text-center mt-4 max-w-md"
            >
                The page you&apos;re looking for doesn&apos;t exist or has been moved to a new
                location.
            </motion.p>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.45 }}
                className="mt-10"
            >
                <Link
                    href="/"
                    className="bg-dark-base text-light-base text-[15px] h-11 px-8 flex items-center justify-center rounded-full shadow-xs cursor-pointer transition-all transform duration-200 ease-in-out hover:scale-105 active:scale-95 inset-shadow-xs inset-shadow-white/30"
                >
                    Back to Home
                </Link>
            </motion.div>
        </div>
    );
}
