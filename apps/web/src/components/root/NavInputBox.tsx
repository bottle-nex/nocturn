import { motion } from 'framer-motion';
import { Input } from '../ui/input';

interface NavInputBoxProps {
    value: string;
    onChange: (value: string) => void;
    onEnter: () => void;
}

export default function NavInputBox({ value, onChange, onEnter }: NavInputBoxProps) {
    return (
        <motion.div
            className="absolute top-full mt-2.5 right-0"
            initial={{ y: -20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onEnter();
                }}
                placeholder="secret code"
                className="h-12 !bg-white text-black border border-black w-40 px-4 rounded-[8px] z-50 relative tracking-wider focus:text-base"
            />
        </motion.div>
    );
}
