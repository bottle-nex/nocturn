"use client"
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '../ui/button';
import { IoArrowForwardOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { container, fadeUp, imageReveal } from '../animation/framer_motion';

interface NocturnFeaturesSectionCardData {
    imgUrl: string;
    heading1: string;
    heading2: string;
    description: string;
    buttonText: string;
    invert?: boolean;
}

export default function NocturnFeaturesSectionCard({
    imgUrl,
    heading1,
    heading2,
    description,
    buttonText,
    invert,
}: NocturnFeaturesSectionCardData) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-120px' }}
            className={cn(
                'w-full flex justify-around pt-10 text-ndarkest',
                invert && 'flex-row-reverse',
            )}
        >
            <motion.div
                variants={imageReveal}
                className="h-140 w-125 border-3 border-black relative rounded-3xl overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]"
            >
                <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
            </motion.div>

            <div className="h-auto w-130 flex flex-col gap-y-10 py-10 justify-between">
                <div className="flex flex-col gap-y-6">
                    <motion.div variants={fadeUp} className="text-6xl font-bold uppercase">
                        {heading1}
                        <br />
                        {heading2}
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="text-xl leading-relaxed text-nprime-darker"
                    >
                        {description}
                    </motion.div>
                </div>

                <motion.div variants={fadeUp}>
                    <Button className="bg-ndarkest text-nlighter border-2 border-ndarkest text-xl h-13 hover:bg-transparent hover:text-ndarkest flex items-center gap-2 rounded-[8px] !px-6">
                        {buttonText}
                        <IoArrowForwardOutline className="size-5" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
