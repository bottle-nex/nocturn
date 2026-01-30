import { formatChatTime } from '@/lib/format-chat-time';

export default function TimeDisplay({ date }: { date: Date }) {
    return (
        <div className="flex items-center gap-1 text-[10px] text-neutral-100 ">
            <span>{formatChatTime(new Date(date))}</span>
        </div>
    );
}
