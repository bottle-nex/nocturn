import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function JoinQuizBar() {
    return (
        <div className="dark:bg-prime/30 bg-prime/80 py-2 flex items-center justify-center">
            <div className="flex w-fit items-center justify-center gap-x-3">
                <span className="text-md font-normal tracking-wide">Enter code to join Quiz</span>
                <Input
                    placeholder="1234 5678"
                    className={cn(
                        'max-w-[10rem] h-10',
                        'placeholder:tracking-wider placeholder:text-center placeholder:text-gray-400',
                        'text-center font-mono text-sm',
                        'border-prime dark:border-prime',
                        'focus:ring-2 focus:ring-prime focus:border-prime',
                        'bg-light-base dark:bg-dark-base',
                        'transition-all duration-200',
                        'shadow-sm hover:shadow-md',
                    )}
                />
                <Button className="bg-prime border border-prime hover:bg-prime hover:border-prime/70 dark:hover:border-prime/70 text-dark-prime">
                    Join
                </Button>
            </div>
        </div>
    );
}
