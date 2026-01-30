'use client';

import ToolTipComponent from '@/components/utility/TooltipComponent';
import { useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaMountainSun, FaSquare } from 'react-icons/fa6';
import { TfiLayoutListPost } from 'react-icons/tfi';
import DragImageBackground from '@/components/utility/DragImageBackground';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { Loader } from 'lucide-react';
import S3 from '@/lib/s3-uploads';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';

export default function UploadQuizImage() {
    const [enableLeftView, setEnableLeftView] = useState(false);
    const [enableRightView, setEnableRightView] = useState(false);
    const { currentQuestionIndex, setLoading, loading } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();

    const handleImageSelect = async (file: File) => {
        setLoading(true);
        try {
            const imageUrl = await S3.handleUploadImage(file);
            editQuestionAndBroadcast(currentQuestionIndex, { imageUrl: imageUrl });
        } catch (err) {
            console.error('Error in uploading image', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full px-2 mt-6">
                <DragImageBackground onDropFile={handleImageSelect} />
                <div className="flex items-center gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Add Image
                    </span>
                    <ToolTipComponent content="This image is particularly relevant to this question">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>

                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 block">
                    Add a relevant image to this question
                </span>

                <div className="flex items-center justify-between gap-x-8 mt-4">
                    <div className="relative flex-1 border border-neutral-300 dark:border-neutral-600 hover:border-alpha dark:hover:border-alpha transition-colors duration-200 bg-light-base dark:bg-dark-base rounded-md flex items-center justify-center cursor-pointer px-3 py-2">
                        <FaMountainSun size={32} />
                        <span className="ml-3 text-xs text-neutral-500 dark:text-neutral-400">
                            Click to upload or drag an image here
                        </span>
                    </div>
                    {loading && <Loader className="animate-spin text-alpha" size={20} />}
                </div>

                <div className="flex items-center gap-x-3 mt-5 dark:text-neutral-300 text-neutral-700">
                    <div
                        onClick={() => {
                            setEnableLeftView(!enableLeftView);
                            setEnableRightView(false);
                        }}
                        className={`flex items-center justify-center w-16 h-12 rounded-md gap-x-1.5 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer ${enableLeftView
                            ? 'border-2 border-neutral-600 dark:border-neutral-500'
                            : 'border border-neutral-300 dark:border-neutral-600'
                            }`}
                    >
                        <ToolTipComponent content="Shift image to left side">
                            <div className="flex justify-center gap-x-1 items-center">
                                <FaSquare size={20} className="rotate-90" />
                                <TfiLayoutListPost />
                            </div>
                        </ToolTipComponent>
                    </div>
                    <div
                        onClick={() => {
                            setEnableRightView(!enableRightView);
                            setEnableLeftView(false);
                        }}
                        className={`flex items-center justify-center w-16 h-12 rounded-md gap-x-1.5 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer ${enableRightView
                            ? 'border-2 border-neutral-600 dark:border-neutral-500'
                            : 'border border-neutral-300 dark:border-neutral-600'
                            }`}
                    >
                        <ToolTipComponent content="Shift image to right side">
                            <div className="flex justify-center gap-x-1 items-center">
                                <TfiLayoutListPost className="scale-x-[-1]" />
                                <FaSquare size={20} />
                            </div>
                        </ToolTipComponent>
                    </div>
                </div>
            </div>
        </>
    );
}
