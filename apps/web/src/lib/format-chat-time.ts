import { format, formatDistanceToNowStrict, isToday, isYesterday, isThisWeek } from 'date-fns';

export function formatChatTime(date: Date) {
    return isToday(date)
        ? formatDistanceToNowStrict(date, { addSuffix: true })
        : isYesterday(date)
          ? 'Yesterday'
          : isThisWeek(date)
            ? format(date, 'EEE')
            : format(date, 'MMM d');
}