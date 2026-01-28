import { useEffect, useState } from 'react';

export function useTypewriterPlaceholder(
    texts: string[],
    typingSpeed = 60,
    deletingSpeed = 40,
    delayBetween = 2000,
) {
    const [textIndex, setTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[textIndex];
        let timeout: NodeJS.Timeout;

        if (!isDeleting) {
            // typing
            if (displayText.length < currentText.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                }, typingSpeed);
            } else {
                // pause before deleting
                timeout = setTimeout(() => setIsDeleting(true), delayBetween);
            }
        } else {
            // deleting
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, deletingSpeed);
            } else {
                setIsDeleting(false);
                setTextIndex((prev) => (prev + 1) % texts.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBetween]);

    return displayText;
}
