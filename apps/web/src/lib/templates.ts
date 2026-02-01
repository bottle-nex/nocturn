export interface Template {
    id: string;
    name: string;
    background_color: string;
    text_color: string;
    border_color: string;
    accent_type: string;
    accent_color: string;
    bars: string[];
    src: string;
}

export const templates: Template[] = [
    {
        id: 'CLASSIC',
        name: 'Classic',
        background_color: '#F6F5F2',
        text_color: '#000000',
        border_color: '#000000',
        accent_type: 'mountains',
        accent_color: '#00000010',
        bars: ['#E2C275', '#6886C5', '#CD5656', '#AEDADD', '#BCBAB8'],
        src: 'classic-template',
    },
    {
        id: 'MODERN',
        name: 'Modern',
        background_color: '#ff80ab',
        text_color: '#000000',
        border_color: '#D1D5DB',
        accent_type: 'wave',
        accent_color: '#EEEEEE',
        bars: ['#196cff', '#ffd439', '#FF2929', '#0e6b45', '#1A73E8'],
        src: 'red-template',
    },
    {
        id: 'NEON',
        name: 'Neon',
        background_color: '#000000',
        text_color: '#EEEEEE',
        border_color: '#000000',
        accent_type: 'staircase',
        accent_color: '#EEEEEE',
        bars: ['#FF6500', '#0A5EB0', '#FFE5CF', '#FFE700', '#7A1CAC'],
        src: 'neon-template',
    },
    {
        id: 'YELLOW',
        name: 'Yellow',
        background_color: '#FFCC00',
        text_color: '#000000',
        border_color: '#000000',
        accent_type: 'circle',
        accent_color: '#000000',
        bars: ['#EB5B00', '#347433', '#C5172E', '#547792', '#F7CFD8'],
        src: 'yellow-template',
    },
    {
        id: 'GREEN',
        name: 'Green',
        background_color: '#0c6c45',
        text_color: '#EEEEEE',
        border_color: '#000000',
        accent_type: 'staircase',
        accent_color: '#000000',
        bars: ['#feb9d0', '#ff403d', '#196cff', '#ffc739', 'C886E5'],
        src: 'green-template',
    },
    {
        id: 'PASTEL',
        name: 'Pastel',
        background_color: '#DDDAD0',
        text_color: '#000000',
        border_color: '#000000',
        accent_type: 'donut',
        accent_color: '#000000',
        bars: ['#DA6C6C', '#687FE5', '#A7C1A8', '#9B7EBD', '#E6B2BA'],
        src: 'pastel-template',
    },
    {
        id: 'BLUE',
        name: 'Blue',
        background_color: '#196aff',
        text_color: '#EEEEEE',
        border_color: '#EEEEEE',
        accent_type: 'slash',
        accent_color: '#EEEEEE',
        bars: ['#C5172E', '#FDFAF6', '#FFCC00', '#1DCD9F', '#000000'],
        src: 'blue-template',
    },
];
