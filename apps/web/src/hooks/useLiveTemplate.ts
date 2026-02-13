import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

export default function useLiveTemplate() {
    const { quiz } = useLiveQuizStore();
    return quiz.theme.theme;
}
