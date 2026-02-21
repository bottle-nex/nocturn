'use client';

import { Toaster } from '@/components/ui/sonner';
import GoeyToasterWrapper from '@/components/ui/goey-toaster';
import { features } from '@/config/features';

export default function ToasterProvider() {
    if (features.goeyToast) {
        return <GoeyToasterWrapper position="top-center" />;
    }

    return <Toaster position="top-center" />;
}
