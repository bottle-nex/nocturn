import { cn } from "@/lib/utils";
import Explanation from "./Explanation";
import Graph from "./Graph";

export default function Page() {
    return (
        <div className="h-screen w-screen flex justify-end items-center bg-light-alpha p-2">
            <div
                className={cn(
                    "h-full w-210 border border-dark-base rounded-beta bg-light-alpha shadow-md grid grid-cols-4 grid-rows-4 ",
                    'p-2 gap-2 '

                )}
            >
                <div className="col-span-2 row-span-2 border border-dark-base rounded-beta ">
                    {/* top tiers */}
                </div>
                <Explanation
                    className="col-span-2 row-span-1 border border-dark-base rounded-beta "
                    explanation={"this is the question's explanation how this is answer is correct"}
                />
                <Graph
                    className="col-span-2 row-span-1 border border-dark-base rounded-beta"
                    points={[10, 25, 18, 40, 22, 55, 30, 10, 25, 18, 40, 22, 55, 30, 10, 25, 18, 40, 22, 55, 30]}
                />
                <div className="col-span-4 row-span-2 border border-dark-base rounded-beta">
                    {/* rank cards */}
                </div>
            </div>
        </div>
    );
}