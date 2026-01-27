import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export function formatChatTime(date: Date) {
    if (isToday(date)) return format(date, 'hh:mm a');

    if (isYesterday(date)) return 'Yesterday';

    if (isThisWeek(date)) return format(date, 'EEE');

    return format(date, 'MMM d');
}
