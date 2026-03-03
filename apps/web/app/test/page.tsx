'use client';
import AppLogo from '@/components/app/AppLogo';
import { Button } from '@/components/ui/button';
import { IoPeopleOutline } from 'react-icons/io5';

export default function Test() {
    return (
        <div className="h-screen w-screen bg-dark-alpha flex justify-center items-center">
            <section className="max-w-7xl mx-auto h-[80dvh] w-full rounded-xl relative overflow-hidden bg-white z-10 flex flex-col items-center p-18 gap-y-15">
                <div className="absolute bottom-0 h-5 bg-blue-400 w-full"></div>
                <div className="absolute top-2 left-3">
                    <AppLogo withText size={100} textColor="-right-6" />
                </div>
                <div className="text-dark-base text-3xl">Q. This is the question</div>

                <div className="flex-1 h-full w-full flex flex-col items-center gap-y-5 text-[18px]">
                    <div className="h-18 w-104 ring-1 ring-dark-base/20 rounded-xl flex text-dark-base items-center overflow-hidden">
                        <div className="h-15 w-[18%] flex justify-center items-center font-semibold">
                            A
                        </div>

                        <div className="h-full w-[82%] flex justify-start items-center overflow-x-hidden overflow-y-auto">
                            This is the first option lorem
                        </div>
                    </div>
                    <div className="h-18 w-104 ring-1 ring-dark-base/20 rounded-xl flex text-dark-base items-center overflow-hidden">
                        <div className="h-15 w-[18%] flex justify-center items-center font-semibold">
                            A
                        </div>

                        <div className="h-full w-[82%] flex justify-start items-center overflow-x-hidden overflow-y-auto">
                            This is the first option lorem
                        </div>
                    </div>
                    <div className="h-18 w-104 ring-1 ring-dark-base/20 rounded-xl flex text-dark-base items-center overflow-hidden">
                        <div className="h-15 w-[18%] flex justify-center items-center font-semibold">
                            A
                        </div>

                        <div className="h-full w-[82%] flex justify-start items-center overflow-x-hidden overflow-y-auto">
                            This is the first option lorem
                        </div>
                    </div>
                    <div className="h-18 w-104 ring-1 ring-dark-base/20 rounded-xl flex text-dark-base items-center overflow-hidden">
                        <div className="h-15 w-[18%] flex justify-center items-center font-semibold">
                            A
                        </div>

                        <div className="h-full w-[82%] flex justify-start items-center overflow-x-hidden overflow-y-auto">
                            This is the first option lorem
                        </div>
                    </div>

                    <Button className="bg-alpha hover:bg-[#423ae2] text-light-base flex items-center h-12 w-39 text-[14px] rounded-[8px]! transition-colors transform duration-200 gap-x-2">
                        <IoPeopleOutline className="size-4.5" />
                        Ask spectators
                    </Button>
                </div>
            </section>
        </div>
    );
}
