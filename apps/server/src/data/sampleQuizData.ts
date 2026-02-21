interface SampleQuiz {
    title: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

const sampleQuizzes: SampleQuiz[] = [
    {
        title: 'Solar System Trivia',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
    },
    {
        title: 'MathMania',
        question: 'What is the square root of 144?',
        options: ['10', '11', '12', '14'],
        correctAnswer: 2,
    },
    {
        title: 'English Grammar Quiz',
        question: 'Which word is a synonym of "benevolent"?',
        options: ['Cruel', 'Kind', 'Angry', 'Lazy'],
        correctAnswer: 1,
    },
    {
        title: 'World Geography',
        question: 'What is the longest river in the world?',
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correctAnswer: 1,
    },
    {
        title: 'History Highlights',
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2,
    },
    {
        title: 'Animal Kingdom',
        question: 'Which animal is the fastest on land?',
        options: ['Lion', 'Cheetah', 'Horse', 'Greyhound'],
        correctAnswer: 1,
    },
    {
        title: 'Science Showdown',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
    },
    {
        title: 'Pop Culture Picks',
        question: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        correctAnswer: 1,
    },
    {
        title: 'Tech Talk',
        question: 'What does "HTTP" stand for?',
        options: [
            'HyperText Transfer Protocol',
            'High Tech Transfer Process',
            'HyperText Transmission Platform',
            'High Transfer Text Protocol',
        ],
        correctAnswer: 0,
    },
    {
        title: 'Ocean Explorers',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctAnswer: 3,
    },
    {
        title: 'Space Odyssey',
        question: 'How many moons does Jupiter have?',
        options: ['16', '53', '79', '95'],
        correctAnswer: 3,
    },
    {
        title: 'Music Trivia',
        question: 'Which instrument has 88 keys?',
        options: ['Guitar', 'Violin', 'Piano', 'Drums'],
        correctAnswer: 2,
    },
    {
        title: 'Human Body Quiz',
        question: 'How many bones are in the adult human body?',
        options: ['186', '206', '226', '256'],
        correctAnswer: 1,
    },
    {
        title: 'Vocabulary Challenge',
        question: 'What does "ephemeral" mean?',
        options: ['Eternal', 'Short-lived', 'Mysterious', 'Beautiful'],
        correctAnswer: 1,
    },
    {
        title: 'World Capitals',
        question: 'What is the capital of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 2,
    },
    {
        title: 'Sports Arena',
        question: 'How many players are on a soccer team?',
        options: ['9', '10', '11', '12'],
        correctAnswer: 2,
    },
    {
        title: 'Coding Corner',
        question: 'What does "CSS" stand for?',
        options: [
            'Computer Style Sheets',
            'Cascading Style Sheets',
            'Creative Style System',
            'Coded Style Syntax',
        ],
        correctAnswer: 1,
    },
    {
        title: 'Physics Fundamentals',
        question: 'What is the speed of light in km/s?',
        options: ['150,000', '200,000', '300,000', '400,000'],
        correctAnswer: 2,
    },
];

export function getRandomSampleQuiz(): SampleQuiz {
    const index = Math.floor(Math.random() * sampleQuizzes.length);
    return sampleQuizzes[index]!;
}
