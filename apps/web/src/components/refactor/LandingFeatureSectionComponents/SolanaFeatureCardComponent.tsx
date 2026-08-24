import SolanaIphoneComponent from './SolanaIphoneComponent';

export default function SolanaFeatureCardComponent() {
    return (
        <div className="flex flex-col ring-1 ring-black/10 h-auto sm:h-75 w-full max-w-[440px] rounded-xl overflow-hidden">
            <div className="h-55 bg-gradient-to-br from-delta to-dark-alpha relative flex justify-center pt-7 shrink-0 overflow-hidden group">
                <SolanaIphoneComponent />
            </div>
            <div className="h-fit sm:h-20 shrink-0 flex flex-col justify-center px-4 py-2 gap-y-1">
                <div className="text-dark-base/80 text-base">Prize Pool</div>
                <div className="text-dark-base/50 text-[13px] leading-[1.1]">
                    Stop making quizzes that is worth nothing, rewards your kids with crypto, cause
                    applause alone doesnt help them grow.
                </div>
            </div>
        </div>
    );
}
