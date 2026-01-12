import { Template } from '@/lib/templates';
import { cn } from '@/lib/utils';
import CanvasAccents from '../utility/CanvasAccents';

interface EmptyCanvasProps {
    template: Template;
    className?: string;
    onClick?: () => void;
}

export default function EmptyCanvas({ template, className, onClick }: EmptyCanvasProps) {
    return (
        <div
            onClick={onClick}
            className={cn('w-full rounded-md p-0.5 cursor-pointer relative ', className)}
            style={{ boxSizing: 'border-box' }}
        >
            <div
                style={{
                    backgroundColor: template?.background_color,
                    color: template?.text_color,
                }}
                className="w-full h-full rounded-[14px] flex justify-center items-center relative group"
            >
                <CanvasAccents
                    design={template?.accent_type}
                    accentColor={template?.accent_color}
                />
            </div>
        </div>
    );
}
