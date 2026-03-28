import type { FC } from "react";
import { Stat } from "./RightFeatureComponent";

const STATS: Stat[] = [
  { value: "$12.4B", label: "Total Value Locked" },
  { value: "47", label: "Supported Assets" },
  { value: "8", label: "Active Networks" },
];

const LeftFeatureComponent: FC = () => {
  return (
    <div className="w-[38%] shrink-0 px-10 py-4 sticky top-15 self-start">

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1 shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      </div>

      <h2 className="mb-4 text-[36px] font-bold leading-[1.1] tracking-tight text-gray-900">
        Built for the
        <br />
        <span style={{ color: "#b0b7c3" }}>next generation</span>
        <br />
        of finance.
      </h2>

      <p className="max-w-[250px] text-[13.5px] leading-relaxed text-gray-400">
        A permissionless liquidity protocol designed with institutional rigor and
        open-source transparency at every layer.
      </p>

      <div className="my-8 h-px w-full bg-gradient-to-r from-gray-200 to-transparent" />

      <div className="flex flex-col gap-3.5">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2.5">
            <span className="text-[16px] font-bold tracking-tight text-gray-800">
              {stat.value}
            </span>
            <span className="text-[11px] text-gray-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftFeatureComponent;