import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { PiMagnifyingGlass } from "react-icons/pi";
import ToolTipComponent from "../utility/TooltipComponent";
import UploadPDFButton from "../ui/UploadPDFButton";
import AnimatedFolderIcon from "../ui/animated-icons/AnimatedFolderIcon";
import { Button } from "../ui/button";
import { FiPlus } from "react-icons/fi";
import { TbLayoutGridFilled } from "react-icons/tb";
import { FaAlignJustify } from "react-icons/fa6";
import { useState } from "react";

enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST'
}

export default function QuizzesUpperSection() {
    const [activeLayout, setActiveLayout] = useState<Layouts>(Layouts.GRID);

    return (
        <div className="flex gap-x-3 relative justify-between items-center mt-10">
            <Button
                // onClick={handleCreateNewQuiz}
                className="rounded-sm h-11 w-32 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white active:scale-98"
            >
                <FiPlus />
                <span>New Quiz</span>
            </Button>


            <div className="flex items-center gap-x-4">
                <div
                    // ref={containerRef}
                    className={cn(
                        'relative w-md h-11 rounded-[6px]',
                        'border-neutral-800 dark:border-neutral-700 dark:bg-zinc-800 dark:text-white',
                    )}
                >
                    <Input
                        // ref={inputRef}
                        // value={prompt}
                        // onChange={(e) => setPrompt(e.target.value)}
                        placeholder="search quizzes"
                        // onFocus={() => setCommonPanel(true)}
                        // onKeyDown={handleInputKeyDown}
                        className={cn(
                            'h-full w-full pl-10 rounded-[6px]',
                            'placeholder:text-gamma/40 dark:placeholder:text-neutral-500',
                            '!bg-dark-base border-neutral-800'
                        )}
                    />

                    <PiMagnifyingGlass
                        size={20}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />

                    <ToolTipComponent content="upload pdf" className="cursor-pointer">
                        <UploadPDFButton onPdfSelect={() => { }}>
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 p-1">
                                <AnimatedFolderIcon
                                    strokeWidth={1.5}
                                    stroke="#737373"
                                    className="size-5 text-neutral-500 dark:text-neutral-400 "
                                />
                            </div>
                        </UploadPDFButton>
                    </ToolTipComponent>

                </div>

                <div className="flex items-center gap-x-1 text-light-base">
                    <Button
                        onClick={() => setActiveLayout(Layouts.GRID)}
                        className={cn(
                            "h-9 w-9 flex justify-center items-center rounded-sm border transition-all transform duration-200",
                            activeLayout === Layouts.GRID
                                ? "bg-indigo-600/20 border-1 border-indigo-800/70 hover:bg-indigo-600/30"
                                : "border-transparent hover:bg-indigo-600/20 bg-transparent"
                        )}
                    >
                        <TbLayoutGridFilled
                            className={cn(
                                "size-6 transition-transform",
                                activeLayout === Layouts.GRID
                                    ? "text-white scale-105"
                                    : "text-light-base/90"
                            )}
                        />
                    </Button>

                    <Button
                        onClick={() => setActiveLayout(Layouts.LIST)}
                        className={cn(
                            "h-9 w-9 flex justify-center items-center rounded-sm border transition-all transform duration-200",
                            activeLayout === Layouts.LIST
                                ? "bg-indigo-600/20 border-1 border-indigo-800/70 hover:bg-indigo-600/30"
                                : "border-transparent hover:bg-indigo-600/20 bg-transparent"
                        )}
                    >
                        <FaAlignJustify
                            className={cn(
                                "size-4 transition-transform",
                                activeLayout === Layouts.LIST
                                    ? "text-white scale-105"
                                    : "text-light-base/90"
                            )}
                        />
                    </Button>
                </div>

            </div>
        </div>
    )
}