import { JSX } from "react";
import UnclickableTicker from "../tickers/UnClickableTicker";

interface SectionHeadingProps {
    title?: string;
    description?: string;
    ticker?: string;
    icon?: JSX.Element;
}

export default function SectionHeading({ title, description, ticker, icon }: SectionHeadingProps): JSX.Element {
    return (
        <section className="w-full flex flex-col items-center gap-y-2 max-w-3xl">
            <UnclickableTicker>
                {icon && <span>{icon}</span>}
                <span>{ticker}</span>
            </UnclickableTicker>
            <h1 className="text-6xl font-semibold text-dark-base text-center mt-4">{title}</h1>
            <p className="text-base text-dark-base/80 text-center mt-2">{description}</p>
        </section>
    )
}