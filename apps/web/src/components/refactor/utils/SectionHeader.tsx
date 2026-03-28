interface LandingHeaderComponentProps {
    label?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}

export default function SectionHeader({
    label,
    title,
    description,
    align = 'center',
}: LandingHeaderComponentProps) {
    return (
        <div
            className={`w-full max-w-[640px] flex flex-col ${
                align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'
            }`}
        >
            {/* 🔹 Label */}
            {label && <div className="text-[13px] text-dark-base/40 font-medium mb-2">{label}</div>}

            {/* 🔹 Title */}
            <h2 className="text-[34px] sm:text-[40px] font-semibold leading-[1.15] text-dark-base">
                {title}
            </h2>

            {/* 🔹 Description */}
            {description && (
                <p className="mt-3 text-[15px] sm:text-[16px] text-dark-base/60 leading-[1.6]">
                    {description}
                </p>
            )}
        </div>
    );
}
