'use client';
import OpacityBackground from './OpacityBackground';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { RxCross2 } from 'react-icons/rx';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useState } from 'react';
import axios from 'axios';
import { SEND_OTP_URL } from 'routes/api_routes';
import { useRouter } from 'next/navigation';

interface SigninOptions {
    type: 'github' | 'google' | 'facebook';
    image: string;
}

const signin_options: SigninOptions[] = [
    { type: 'google', image: '/images/google.png' },
    { type: 'github', image: '/images/github.png' },
    { type: 'facebook', image: '/images/facebook.png' },
];

export default function SigninModal() {
    const { openSigninModal, setOpenSigninModal } = useUserSessionStore();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    if (!openSigninModal) return null;

    function singinHandler(type: 'github' | 'google' | 'facebook') {
        signIn(type, { callbackUrl: '/' });
    }

    async function handleSendOtp() {
        if (!email) return;
        setLoading(true);
        setError('');
        try {
            await axios.post(SEND_OTP_URL, { email });
            setStep('otp');
        } catch {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (!otp) return;
        setLoading(true);
        setError('');
        const result = await signIn('email-otp', {
            email,
            otp,
            redirect: false,
        });
        setLoading(false);
        if (result?.ok) {
            setOpenSigninModal(false);
            router.refresh();

        } else {
            setError('Invalid or expired OTP. Please try again.');
        }
    }

    return (
        <OpacityBackground className='bg-neutral-900/20' onBackgroundClick={() => setOpenSigninModal(false)}>
            <motion.section
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative bg-white border-2 border-black w-100 max-w-[90vw] rounded-md overflow-hidden shadow-sm"
            >
                <div className="bg-ndarkest border-b-2 border-black flex items-center justify-between h-full w-full">
                    <div className="relative h-40 w-full">
                        <Image
                            src={'/images/landing/buttonPress.jpg'}
                            alt="sign-in image"
                            className="object-cover"
                            fill
                            unoptimized
                        />
                    </div>
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        onClick={() => setOpenSigninModal(false)}
                        className="text-ndarkest cursor-pointer absolute right-3 top-3 bg-nlighter rounded-full p-1 hover:bg-ndarkest hover:text-nlighter shadow-xs transition-colors duration-250"
                    >
                        <RxCross2 size={15} strokeWidth={0.8} />
                    </motion.button>
                </div>

                <section className="p-6 flex flex-col items-center tracking-wide rounded-t-xl">
                    <div className="font-semibold text-ndarkest px-2 py-px text-sm rounded-alpha mb-1">
                        NOCTURN
                    </div>
                    <div className="text-ndarkest text-2xl font-bold mb-1">
                        Your next question awaits
                    </div>
                    <p className="text-ndarker text-[14px] mb-5 text-center">
                        Choose your preferred sign in method
                    </p>

                    <section className="flex items-center justify-center gap-x-2 tracking-wider">
                        {signin_options.map(option => (
                            <motion.button
                                key={option.type}
                                whileTap={{ scale: 0.98 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 18,
                                }}
                                className="h-8 px-2 rounded-sm bg-neutral-200 text-dark-base font-normal text-base flex items-center justify-center gap-x-2 cursor-pointer capitalize"
                                onClick={() => singinHandler(option.type)}
                            >
                                <Image
                                    src={option.image}
                                    alt={option.type}
                                    width={20}
                                    height={20}
                                    className="shrink-0"
                                />
                                <span className='text-sm'>{option.type}</span>
                            </motion.button>
                        ))}
                    </section>

                    <span className='block text-neutral-500 text-xs mt-4'>or sign in with</span>

                    {step === 'email' ? (
                        <>
                            <div className="w-full flex flex-col gap-y-1 mt-4">
                                <Label className='font-semibold ml-0.5 text-sm' htmlFor="email">Work email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder='youremail@example.com'
                                    className='bg-light-base border-none p-5 mt-1.5'
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                                />
                            </div>
                            <Button
                                className='bg-dark-alpha hover:bg-dark-base w-full mt-6 p-5 disabled:bg-neutral-700! disabled:opacity-100!'
                                onClick={handleSendOtp}
                                disabled={loading || !email}
                            >
                                {loading ? 'Sending...' : 'Get OTP'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className='text-neutral-500 text-xs mt-4 text-center'>
                                OTP sent to <span className='font-semibold text-neutral-700'>{email}</span>.{' '}
                                <button
                                    type="button"
                                    className='underline cursor-pointer'
                                    onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                                >
                                    Change
                                </button>
                            </p>
                            <div className="w-full flex flex-col items-center gap-y-3 mt-4">
                                <Label className='font-semibold ml-0.5 text-sm self-start'>Enter OTP</Label>
                                <InputOTP
                                    maxLength={6}
                                    containerClassName='w-full'
                                    value={otp}
                                    onChange={setOtp}
                                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                                >
                                    <InputOTPGroup className='w-full justify-between gap-x-2'>
                                        <InputOTPSlot index={0} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                        <InputOTPSlot index={1} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                        <InputOTPSlot index={2} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                        <InputOTPSlot index={3} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                        <InputOTPSlot index={4} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                        <InputOTPSlot index={5} className='flex-1 h-13 aspect-square text-base rounded-sm shadow-none' />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button
                                className='bg-dark-alpha hover:bg-dark-base w-full mt-6 p-5 disabled:bg-neutral-700! disabled:opacity-100!'
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Sign In'}
                            </Button>
                        </>
                    )}

                    {error && (
                        <p className='text-red-500 text-xs mt-3 text-center'>{error}</p>
                    )}
                </section>
            </motion.section>
        </OpacityBackground>
    );
}
