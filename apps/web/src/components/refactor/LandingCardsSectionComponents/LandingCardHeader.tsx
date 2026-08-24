interface LandingCardHeaderProps {
    title: string;
    description: string;
    light?: boolean;
}

export default function LandingCardHeader({ title, description, light }: LandingCardHeaderProps) {
    return (
        <>
            <div
                className={
                    light
                        ? 'text-light-alpha text-[17px] font-semibold'
                        : 'text-dark-base/90 text-[17px] font-semibold'
                }
            >
                {title}
            </div>
            <div
                className={
                    light
                        ? 'text-light-alpha/60 text-[14px] leading-[1.2]'
                        : 'text-dark-base/50 text-[14px] leading-[1.2]'
                }
            >
                {description}
            </div>
        </>
    );
}
