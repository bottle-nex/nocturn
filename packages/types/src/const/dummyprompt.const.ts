interface DummyPrompt {
    id: number;
    prompt: string;
}

export const dummyPrompts: DummyPrompt[] = [
    {
        id: 1,
        prompt: "Create a quiz about the history of the internet."
    },
    {
        id: 2,
        prompt: "Generate a quiz on world geography."
    },
    {
        id: 3,
        prompt: "Make a quiz about famous scientists and their discoveries."
    },
]