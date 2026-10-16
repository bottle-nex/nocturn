interface LandingCardHeaderProps {
    title: string;
    description: string;
}

export default function LandingCardHeader({ title, description }: LandingCardHeaderProps) {
    return (
        <>
            <div className="text-light-base/90 text-[17px] font-semibold">{title}</div>
            <div className="text-light-base/50 text-[14px] leading-[1.2]">{description}</div>
        </>
    );
}
