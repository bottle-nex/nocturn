import { cn } from '@/lib/utils';
import TimeDisplay from './TimeDisplay';
import Image from 'next/image';
interface UserMessageProps {
    content: string;
    image: string;
    createdAt: Date;
}

export default function UserMessage({ content, image, createdAt }: UserMessageProps) {
    return (
        <div className="flex justify-end items-start w-full">
            <div className="flex items-start gap-x-2 max-w-[70%]">
                <section className="flex items-center justify-start gap-x-2">
                    <div
                        className={cn(
                            'pl-4 pr-2 py-2 rounded-b-xl rounded-tl-xl text-sm font-normal border',
                            'text-dark-base dark:text-light-alpha',
                            'bg-light-base dark:bg-dark-base',
                            'flex flex-col items-end gap-y-1 min-w-0',
                            'max-w-full break-normal ',
                        )}
                    >
                        <div className={cn('w-full min-w-0 wrap-break-word whitespace-pre-wrap')}>
                            {content}
                        </div>

                        <TimeDisplay date={createdAt} />
                    </div>
                    <Image
                        src={image}
                        width={32}
                        height={32}
                        alt="User Avatar"
                        className="rounded-full object-cover -translate-y-5"
                    />
                </section>
            </div>
        </div>
    );
}
