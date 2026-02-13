// export const TEMPLATE_THEMES: Record<TemplateEnum, TemplateTheme> = {
//     [TemplateEnum.CLASSIC]: {
//         background_color: '#F6F5F2',
//         text_color: '#1A1A1A',
//         border_color: '#D4D4D4',
//         accent_type: 'solid',
//         accent_color: '#4A90E2',
//         bars: ['#4A90E2', '#5FA3E8', '#74B6EE'],
//         src: '/templates/classic.svg',
//     },
//     [TemplateEnum.MODERN]: {
//         background_color: '#FFFFFF',
//         text_color: '#000000',
//         border_color: '#E5E5E5',
//         accent_type: 'gradient',
//         accent_color: '#6366F1',
//         bars: ['#6366F1', '#8B5CF6', '#A855F7'],
//         src: '/templates/modern.svg',
//     },
//     [TemplateEnum.NEON]: {
//         background_color: '#0A0A0A',
//         text_color: '#FFFFFF',
//         border_color: '#00FF88',
//         accent_type: 'neon',
//         accent_color: '#00FF88',
//         bars: ['#00FF88', '#00FFFF', '#FF00FF'],
//         src: '/templates/neon.svg',
//     },
//     [TemplateEnum.YELLOW]: {
//         background_color: '#FFF9E6',
//         text_color: '#1A1A1A',
//         border_color: '#FFD700',
//         accent_type: 'solid',
//         accent_color: '#FFA500',
//         bars: ['#FFD700', '#FFA500', '#FF8C00'],
//         src: '/templates/yellow.svg',
//     },
//     [TemplateEnum.GREEN]: {
//         background_color: '#E8F5E9',
//         text_color: '#1B5E20',
//         border_color: '#4CAF50',
//         accent_type: 'solid',
//         accent_color: '#2E7D32',
//         bars: ['#4CAF50', '#66BB6A', '#81C784'],
//         src: '/templates/green.svg',
//     },
//     [TemplateEnum.PASTEL]: {
//         background_color: '#FFF0F5',
//         text_color: '#4A4A4A',
//         border_color: '#FFB6C1',
//         accent_type: 'soft',
//         accent_color: '#DDA0DD',
//         bars: ['#FFB6C1', '#DDA0DD', '#B0E0E6'],
//         src: '/templates/pastel.svg',
//     },
//     [TemplateEnum.BLUE]: {
//         background_color: '#E3F2FD',
//         text_color: '#0D47A1',
//         border_color: '#2196F3',
//         accent_type: 'solid',
//         accent_color: '#1976D2',
//         bars: ['#2196F3', '#42A5F5', '#64B5F6'],
//         src: '/templates/blue.svg',
//     },
// };

// // Helper function to get theme by template ID
// export function getTemplateTheme(templateId: string): TemplateTheme | null {
//     if (templateId in TEMPLATE_THEMES) {
//         return TEMPLATE_THEMES[templateId as TemplateEnum];
//     }
//     return null;
// }

// // Helper function to get theme for a quiz (prioritizes quiz.theme over template.theme)
// export function getQuizTheme(quiz: { theme?: TemplateTheme | null; template?: { theme: TemplateTheme } }): TemplateTheme | null {
//     // If quiz has custom theme, use it
//     if (quiz.theme) {
//         return quiz.theme;
//     }
//     // Otherwise use template theme
//     if (quiz.template?.theme) {
//         return quiz.template.theme;
//     }
//     return null;
// }
