import { toast as sonnerToast } from 'sonner';
import { goeyToast } from 'goey-toast';
import { features } from '@/config/features';

function isDark() {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
}

function withThemeColors(options?: Record<string, unknown>): Record<string, unknown> {
    if (options?.fillColor) return options;
    const dark = isDark();
    return {
        fillColor: dark ? '#1a1a1a' : '#ffffff',
        borderColor: dark ? '#333333' : '#e0e0e0',
        borderWidth: 1.5,
        ...options,
    };
}

function createToast(message: string, options?: Record<string, unknown>) {
    if (features.goeyToast) {
        return goeyToast(message, withThemeColors(options));
    }
    return sonnerToast(message, options);
}

createToast.success = (message: string, options?: Record<string, unknown>) => {
    if (features.goeyToast) {
        return goeyToast.success(message, withThemeColors(options));
    }
    return sonnerToast.success(message, options);
};

createToast.error = (message: string, options?: Record<string, unknown>) => {
    if (features.goeyToast) {
        return goeyToast.error(message, withThemeColors(options));
    }
    return sonnerToast.error(message, options);
};

createToast.warning = (message: string, options?: Record<string, unknown>) => {
    if (features.goeyToast) {
        return goeyToast.warning(message, withThemeColors(options));
    }
    return sonnerToast.warning(message, options);
};

createToast.info = (message: string, options?: Record<string, unknown>) => {
    if (features.goeyToast) {
        return goeyToast.info(message, withThemeColors(options));
    }
    return sonnerToast.info(message, options);
};

createToast.dismiss = (toastId?: string | number) => {
    if (features.goeyToast) {
        return goeyToast.dismiss(toastId);
    }
    return sonnerToast.dismiss(toastId);
};

export { createToast as toast };
