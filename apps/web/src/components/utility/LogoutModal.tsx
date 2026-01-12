'use client';
import OpacityBackground from './OpacityBackground';
import { Button } from '../ui/button';
import { X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function LogoutModal() {
    const { openLogoutModal, setOpenLogoutModal } = useUserSessionStore();

    if (!openLogoutModal) return null;

    function handleLogout() {
        signOut({ callbackUrl: '/' });
    }

    return (
        <OpacityBackground onBackgroundClick={() => setOpenLogoutModal(false)}>
            <section className="relative bg-white border-2 border-black w-105 max-w-[90vw]">
                <div className="bg-[#FF3F7F] border-b-2 border-black px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-wide">Sign out</h1>
                    <button
                        type="button"
                        title="Close"
                        aria-label="Close modal"
                        onClick={() => setOpenLogoutModal(false)}
                        className="text-white hover:text-tprime transition-colors cursor-pointer"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="mb-2">
                        <span className={cn('text-tprime font-bold text-2xl')}>Nocturn</span>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-neutral-50 border-2 border-black">
                        <div className="w-12 h-12 bg-[#FFC400] border-2 border-black flex items-center justify-center">
                            <LogOut size={24} className="text-tprime" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-tprime">Leaving so soon?</h2>
                            <p className="text-neutral-600 text-sm">
                                Your progress is saved. Come back anytime!
                            </p>
                        </div>
                    </div>

                    <p className="text-neutral-500 text-sm text-center">
                        Are you sure you want to sign out of your account?
                    </p>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 rounded-none shadow-custom border-2 border-black bg-white hover:bg-neutral-50 text-tprime py-6 font-medium"
                            onClick={() => setOpenLogoutModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="flex-1 rounded-none shadow-custom border-2 border-black bg-[#FF3F7F] hover:bg-[#ff2a6d] text-white py-6 font-medium"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} className="mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </section>
        </OpacityBackground>
    );
}
