import { QuestionType } from '@nocturn/types';
import CanvasAccents from '../utility/CanvasAccents';
import UtilityCard from '../utility/UtilityCard';
import CanvasHeading from './CanvasHeading';
import CanvasOptions from './CanvasOptions';

interface PreviewCanvasProps {
    orderIndex: number;
    question: QuestionType;
    accentType: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
}

export default function PreviewCanvas({
    question,
    accentType,
    accentColor,
    backgroundColor,
    textColor,
}: PreviewCanvasProps) {
    return (
        <UtilityCard
            className="aspect-video max-w-3xl w-full relative flex items-center justify-center rounded-xl"
            style={{
                backgroundColor: backgroundColor,
                color: textColor,
            }}
        >
            <CanvasAccents design={accentType} accentColor={accentColor} />
            <CanvasHeading currentQ={question} />
            <CanvasOptions currentQ={question} />
        </UtilityCard>
    );
}
