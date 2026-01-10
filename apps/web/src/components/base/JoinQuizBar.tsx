import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function JoinQuizBar() {
    return (
        <div className="dark:bg-alpha/30 bg-alpha/80 py-2 flex items-center justify-center">
            <div className="flex w-fit items-center justify-center gap-x-3">
                <span className="text-md font-normal tracking-wide">Enter code to join Quiz</span>
                <Input
                    placeholder="1234 5678"
                    className={cn(
                        'max-w-[10rem] h-10',
                        'placeholder:tracking-wider placeholder:text-center placeholder:text-gray-400',
                        'text-center font-mono text-sm',
                        'border-alpha dark:border-alpha',
                        'focus:ring-2 focus:ring-alpha focus:border-alpha',
                        'bg-light-base dark:bg-dark-base',
                        'transition-all duration-200',
                        'shadow-sm hover:shadow-md',
                    )}
                />
                <Button className="bg-alpha border border-alpha hover:bg-alpha hover:border-alpha/70 dark:hover:border-alpha/70 text-dark-alpha">
                    Join
                </Button>
            </div>
        </div>
    );
}
