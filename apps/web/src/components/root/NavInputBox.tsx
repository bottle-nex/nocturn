import { motion } from 'framer-motion';
import { Input } from '../ui/input';

export default function NavInputBox() {
    return (
        <motion.div
            className="absolute top-full mt-2.5 right-0"
            initial={{ y: -20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
            <Input
                placeholder="secret code"
                className="h-12 !bg-nlighter text-black border border-black w-40 px-4 rounded-[8px] z-50 relative tracking-wider focus:text-base"
            />
        </motion.div>
    );
}
