import type { FC, ReactNode } from "react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  visual: ReactNode;
}

export interface Stat {
  value: string;
  label: string;
}

export interface RiskTag {
  label: string;
  val: string;
}

const NonCustodialVisual: FC = () => (
  <div className="relative h-20 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
    <div className="absolute inset-0 flex items-center justify-center gap-3 px-8">
      {[38, 62, 44, 74, 52, 68, 46].map((h, i) => (
        <div
          key={i}
          className="rounded-full bg-slate-200"
          style={{ width: 5, height: `${h}%`, opacity: 0.6 + i * 0.05 }}
        />
      ))}
    </div>
    <div className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
      <div className="h-2 w-2 rounded-full bg-slate-300" />
    </div>
  </div>
);

const AlgorithmicRatesVisual: FC = () => (
  <div className="relative h-20 w-full overflow-hidden rounded-xl border border-stone-100 bg-stone-50">
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 300 80"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8a29e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#a8a29e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points="0,60 50,50 100,40 150,28 200,34 250,20 300,14 300,80 0,80"
        fill="url(#areaGrad)"
      />
      <polyline
        points="0,60 50,50 100,40 150,28 200,34 250,20 300,14"
        fill="none"
        stroke="#a8a29e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="250" cy="20" r="3" fill="#78716c" />
    </svg>
  </div>
);

const CrossChainVisual: FC = () => {
  const chains = ["ETH", "ARB", "OP", "POL"] as const;

  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {chains.map((chain, i) => (
            <div key={chain} className="flex items-center gap-2">
              <div className="flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="h-2 w-4 rounded-sm bg-zinc-200" />
                <span className="text-[7px] font-semibold tracking-wide text-zinc-400">
                  {chain}
                </span>
              </div>
              {i < chains.length - 1 && (
                <div className="flex gap-0.5">
                  <div className="h-px w-3 bg-zinc-300" />
                  <div className="h-px w-1 bg-zinc-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GovernanceVisual: FC = () => {
  const bars = [55, 38, 72, 48, 85, 32, 65, 50, 78, 42] as const;

  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
      <div className="absolute inset-0 flex items-end justify-center gap-1.5 px-8 pb-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${h}%`, backgroundColor: h > 65 ? "#a3a3a3" : "#e5e5e5" }}
          />
        ))}
      </div>
      <div className="absolute right-4 top-3 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <div className="h-px w-8 bg-neutral-200" />
        <span className="tabular-nums text-[8px] font-medium text-neutral-400">72% YES</span>
      </div>
    </div>
  );
};

const RiskFrameworkVisual: FC = () => {
  const tags: RiskTag[] = [
    { label: "Liquidity", val: "A+" },
    { label: "Volatility", val: "Low" },
    { label: "Oracle", val: "✓" },
    { label: "Contract", val: "Audited" },
    { label: "Market", val: "Deep" },
    { label: "Depth", val: "High" },
  ];

  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="grid w-full grid-cols-3 gap-1.5">
          {tags.map((tag) => (
            <div
              key={tag.label}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm"
            >
              <span className="text-[8px] font-medium text-gray-400">{tag.label}</span>
              <span className="text-[8px] font-semibold text-gray-600">{tag.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Features data ───────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    id: "01",
    title: "Non-Custodial by Design",
    description:
      "Your assets never leave your wallet. Every position, every yield, every interaction is governed entirely by audited smart contracts — no intermediaries, no counterparty risk, no compromise.",
    visual: <NonCustodialVisual />,
  },
  {
    id: "02",
    title: "Algorithmic Interest Rates",
    description:
      "Borrow and supply rates respond in real time to market utilization. No fixed schedules, no manual adjustments — the protocol continuously optimizes for efficiency across every asset pool.",
    visual: <AlgorithmicRatesVisual />,
  },
  {
    id: "03",
    title: "Cross-Chain Liquidity",
    description:
      "Capital flows freely across networks. Supply on Ethereum, borrow on Arbitrum, repay on Polygon — all within a unified liquidity layer that treats chains as execution environments, not boundaries.",
    visual: <CrossChainVisual />,
  },
  {
    id: "04",
    title: "Governance Without Gatekeepers",
    description:
      "Protocol parameters, asset listings, risk configurations — every consequential decision is made on-chain by token holders. Proposals live and die by community consensus alone.",
    visual: <GovernanceVisual />,
  },
  {
    id: "05",
    title: "Institutional Risk Framework",
    description:
      "Every supported asset is evaluated across liquidity depth, smart contract risk, market volatility, and oracle reliability. Risk parameters update dynamically as market conditions evolve.",
    visual: <RiskFrameworkVisual />,
  },
];

// ─── Feature card ────────────────────────────────────────────────────────────

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: FC<FeatureCardProps> = ({ feature }) => (
  <div className="group rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-black/[0.09] hover:shadow-md">
    <div className="mb-4">{feature.visual}</div>
    <div className="flex items-start gap-3">
      <span className="shrink-0 select-none pt-0.5 font-mono text-[10px] font-medium tracking-widest text-gray-300">
        {feature.id}
      </span>
      <div>
        <h3 className="mb-1 text-[14px] font-semibold leading-snug tracking-tight text-gray-900">
          {feature.title}
        </h3>
        <p className="text-[12.5px] leading-relaxed text-gray-500">{feature.description}</p>
      </div>
    </div>
  </div>
);

// ─── Right panel ─────────────────────────────────────────────────────────────

const RightFeatureComponent: FC = () => (
  <div className="min-w-0 flex-1 px-6 py-4">
    {/* Feature cards */}
    <div className="flex flex-col gap-3.5">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>

    {/* Footer CTA */}
    <div className="mt-5 rounded-2xl border border-black/[0.05] bg-gradient-to-br from-gray-50 to-white p-7">
      <p className="max-w-sm text-[13px] leading-relaxed text-gray-400">
        Every component of this protocol has been independently audited, formally verified, and
        battle-tested across market cycles. Security is not a feature — it is the foundation.
      </p>
      <button
        type="button"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-[12.5px] font-medium text-white transition-all duration-200 hover:bg-gray-700 active:scale-95"
      >
        Read the docs
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M1.5 6h9M7 2.5L10.5 6 7 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
);

export default RightFeatureComponent;