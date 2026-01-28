declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }

    interface SpeechRecognitionConstructor {
        new (): SpeechRecognition;
    }

    interface SpeechRecognition extends EventTarget {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;

        start(): void;
        stop(): void;
        abort(): void;

        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        onend: (() => void) | null;
        onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    }

    interface SpeechRecognitionEvent extends Event {
        resultIndex: number;
        results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        error:
            | 'no-speech'
            | 'aborted'
            | 'audio-capture'
            | 'network'
            | 'not-allowed'
            | 'service-not-allowed'
            | 'bad-grammar'
            | 'language-not-supported';
        message: string;
    }
}

export {};
