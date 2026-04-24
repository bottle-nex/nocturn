import { useEffect, useState } from "react";

export function useSeenOnce(key: string) {
    const [unseen, setUnseen] = useState(false);

    useEffect(() => {
        setUnseen(localStorage.getItem(key) !== '1');
    }, [key])

    const markSeen = () => {
        localStorage.setItem(key, '1');
        setUnseen(false);
    }

    return [unseen, markSeen] as const;
}