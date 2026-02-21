'use client';

import { useTheme } from 'next-themes';
import { GoeyToaster as Toaster, type GoeyToasterProps } from 'goey-toast';

export default function GoeyToasterWrapper(props: Partial<GoeyToasterProps>) {
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

    return <Toaster theme={theme} {...props} />;
}
