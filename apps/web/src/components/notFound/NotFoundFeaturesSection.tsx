import type { FC } from "react";

const STATS = [
  { value: "0", label: "Pages Found" },
  { value: "404", label: "Error Code" },
  { value: "1", label: "Lost Explorer" },
];

export default function NotFoundFeaturesSection() {
  return (
    <div className="mx-auto w-full max-w-270 bg-light-base pb-32 pt-25 ring-1 ring-black/10">
      <div className="flex w-full items-start">
        {/* Left Side */}
        <div className="w-[38%] shrink-0 px-10 py-4 sticky top-15 self-start">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-red-400" />
            </span>
            <span className="text-[11px] font-medium text-gray-500">System Status: Broken Link</span>
          </div>

          <h2 className="mb-4 text-[36px] font-bold leading-[1.1] tracking-tight text-gray-900">
            You've ventured
            <br />
            <span style={{ color: "#b0b7c3" }}>into the unknown</span>
            <br />
            territory.
          </h2>

          <p className="max-w-[250px] text-[13.5px] leading-relaxed text-gray-400">
            The link you clicked might be broken, or the page you're trying to reach has been retired from our servers.
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

        {/* Right Side */}
        <div className="flex-1 px-10">
            <div className="w-full h-[500px] border border-black/5 rounded-2xl bg-white/50 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
                <div className="text-[180px] font-black tracking-tighter text-black/60 z-10 select-none flex ">
                    404
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
