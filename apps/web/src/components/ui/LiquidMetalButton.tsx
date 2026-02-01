import React, { useState } from 'react';

interface LiquidMetalButtonProps {
    children?: React.ReactNode;
    icon?: React.ReactNode;
    size?: number;
    onClick?: () => void;
    className?: string;
}

export default function LiquidMetalButton({
    children,
    icon,
    size = 56,
    onClick,
    className = '',
}: LiquidMetalButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <style>{`
  .liquid-metal-btn {
    position: relative;
    border: none;
    border-radius: 30px;
    background: #0a0b0e;
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.3s ease;
    will-change: transform;
  }

  .liquid-metal-btn:active {
    transform: scale(0.96);
  }

  /* ================================
     LIQUID METAL BORDER (CORE)
     ================================ */
  .liquid-metal-border {
    position: absolute;
    inset: -35%;
    background:
      conic-gradient(
        from 0deg,
        #0b0e14,
        #6f8fd6,
        #e8f0ff,
        #ffffff,
        #9bbcff,
        #5a6fa8,
        #0b0e14
      );
    background-size: 200% 200%;
    animation: metal-drift 16s linear infinite;
    filter: blur(1.2px) contrast(1.35) saturate(1.15);
    will-change: transform, background-position;
  }

  .liquid-metal-btn.hovered .liquid-metal-border {
    animation-duration: 10s;
    filter: blur(1.4px) contrast(1.45) saturate(1.2);
  }

  /* 🔥 Fake randomness via multi-point drift */
  @keyframes metal-drift {
    0% {
      transform: translate(0%, 0%) rotate(0deg);
      background-position: 0% 50%;
    }
    25% {
      transform: translate(-6%, 4%) rotate(90deg);
      background-position: 40% 60%;
    }
    50% {
      transform: translate(5%, -5%) rotate(180deg);
      background-position: 80% 40%;
    }
    75% {
      transform: translate(-4%, -6%) rotate(270deg);
      background-position: 60% 20%;
    }
    100% {
      transform: translate(0%, 0%) rotate(360deg);
      background-position: 0% 50%;
    }
  }

  /* ================================
     INNER CONTENT (WEIGHT & DEPTH)
     ================================ */
  .liquid-metal-content {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 2px;
    border-radius: 14px;
    background: #0a0b0e;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow:
      inset 0 1px 2px rgba(255,255,255,0.08),
      inset 0 -4px 8px rgba(0,0,0,0.7);
  }

  /* ================================
     STATIC 3D LIGHT (IMPORTANT)
     ================================ */
  .liquid-metal-shine {
    position: absolute;
    inset: 2px;
    border-radius: 14px;
    background:
      radial-gradient(
        circle at 30% 20%,
        rgba(160,200,255,0.22),
        rgba(160,200,255,0.08) 30%,
        transparent 60%
      );
    z-index: 3;
    pointer-events: none;
    opacity: 0.6;
  }

  .liquid-metal-btn.hovered .liquid-metal-shine {
    opacity: 0.85;
  }

  /* ================================
     AURA / GLOW
     ================================ */
  .liquid-metal-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    background: radial-gradient(
      circle,
      rgba(120,160,255,0.25),
      transparent 65%
    );
    filter: blur(18px);
    opacity: 0.35;
    z-index: -1;
    transition: opacity 0.3s ease;
  }

  .liquid-metal-btn.hovered::after {
    opacity: 0.6;
  }

  .liquid-metal-btn {
    box-shadow:
      0 2px 10px rgba(0,0,0,0.5),
      0 12px 30px rgba(0,0,0,0.4),
      inset 0 0 0 1px rgba(255,255,255,0.05);
  }

  .liquid-metal-btn.hovered {
    box-shadow:
      0 2px 14px rgba(0,0,0,0.6),
      0 16px 40px rgba(0,0,0,0.5),
      0 0 40px rgba(120,160,255,0.18),
      inset 0 0 0 1px rgba(255,255,255,0.08);
  }
`}</style>

            <button
                className={`liquid-metal-btn ${isHovered ? 'hovered' : ''} ${className}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                <div className="liquid-metal-border"></div>
                <div className="liquid-metal-content">{icon || children}</div>
                <div className="liquid-metal-shine"></div>
            </button>
        </>
    );
}

// Example usage with different icons
function IconGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                }}
            />
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '2px',
                }}
            />
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '2px',
                }}
            />
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                }}
            />
        </div>
    );
}

// Demo component showing different variations
export function LiquidMetalButtonDemo() {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '60px',
                    alignItems: 'center',
                }}
            >
                <div>
                    <h1
                        style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '24px',
                            fontWeight: 600,
                            textAlign: 'center',
                            marginBottom: '10px',
                        }}
                    >
                        Liquid Metal Buttons
                    </h1>
                    <p
                        style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            textAlign: 'center',
                            fontSize: '14px',
                        }}
                    >
                        Hover to see the metallic effect speed up • Click to interact
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '30px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    <LiquidMetalButton
                        size={40}
                        icon={
                            <span
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 300,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                }}
                            >
                                +
                            </span>
                        }
                        onClick={() => alert('Small button clicked!')}
                    />

                    <LiquidMetalButton
                        size={56}
                        icon={<IconGrid />}
                        onClick={() => alert('Medium button clicked!')}
                    />

                    <LiquidMetalButton
                        size={80}
                        icon={
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '16px',
                                }}
                            >
                                AI
                            </div>
                        }
                        onClick={() => alert('Large button clicked!')}
                    />

                    <LiquidMetalButton
                        size={120}
                        icon={
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '10px solid rgba(255, 255, 255, 0.9)',
                                    borderTop: '10px solid transparent',
                                    borderBottom: '10px solid transparent',
                                    marginLeft: '4px',
                                }}
                            />
                        }
                        onClick={() => alert('Extra large button clicked!')}
                    />
                </div>
            </div>
        </div>
    );
}
