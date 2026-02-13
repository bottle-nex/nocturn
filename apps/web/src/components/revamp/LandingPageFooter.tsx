export default function LandingPageFooter() {
    return (
        <div className="h-screen w-screen grid grid-cols-12 gap-4 p-4 bg-dark-alpha">
            <div className="col-span-3 grid grid-rows-10 gap-4">
                <div className="row-span-4 bg-alpha rounded-3xl"></div>

                <div className="row-span-6 bg-dark-alpha rounded-3xl flex flex-col items-between p-5 ring-1 ring-light-base">
                    <div className="text-[3.2rem] font-bold bg-light-base text-dark-faded flex justify-center items-center py-2 rounded-2xl tracking-normal">
                        NOCTURN
                    </div>
                </div>
            </div>

            <div className="col-span-3"></div>

            <div className="col-span-6"></div>
        </div>
    );
}
