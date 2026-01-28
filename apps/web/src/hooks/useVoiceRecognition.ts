import { useCallback, useEffect, useRef, useState } from 'react';

interface useVoiceRecognitionOptions {
    lang?: string;
    onFinalTranscript: (text: string) => void;
}

export default function useVoiceRecognition({
    lang = 'en-US',
    onFinalTranscript,
}: useVoiceRecognitionOptions) {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [listening, setListening] = useState<boolean>(false);
    const [interimTranscript, setInterimTranscript] = useState<string>('');

    const initRecognition = useCallback(() => {
        if (recognitionRef.current) return;

        const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

        if (!Recognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        const recognition: SpeechRecognition = new Recognition();

        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }

            if (final) {
                onFinalTranscript?.(final.trim());
                setInterimTranscript('');
            } else {
                setInterimTranscript(interim);
            }
        };

        recognition.onend = () => {
            setListening(false);
            setInterimTranscript('');
        };

        recognition.onerror = () => {
            setListening(false);
            setInterimTranscript('');
        };

        recognitionRef.current = recognition;
    }, [lang, onFinalTranscript]);

    const start = useCallback(() => {
        initRecognition();
        recognitionRef.current?.start();
        setListening(true);
    }, [initRecognition]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
        setInterimTranscript('');
    }, []);

    const toggle = useCallback(() => {
        if (listening) {
            stop();
        } else {
            start();
        }
    }, [listening, start, stop]);

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            recognitionRef.current = null;
        };
    }, []);

    return {
        listening,
        interimTranscript,
        start,
        stop,
        toggle,
        supported:
            typeof window !== 'undefined' &&
            !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    };
}
