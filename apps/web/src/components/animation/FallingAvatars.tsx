'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Matter from 'matter-js';
import { ParticipantType } from '@/types/prisma-types';

interface FallingAvatarsProps {
    participants: ParticipantType[];
    ballRadius?: number;
    isExiting?: boolean;
}

export default function FallingAvatars({
    participants = [],
    ballRadius = 28,
    isExiting = false,
}: FallingAvatarsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesRef = useRef<Matter.Body[]>([]);
    const bottomWallRef = useRef<Matter.Body | null>(null);
    const rafRef = useRef<number>(0);
    const [positions, setPositions] = useState<{ x: number; y: number; angle: number }[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { width, height } = container.getBoundingClientRect();

        const engine = Matter.Engine.create({
            gravity: { x: 0, y: 1, scale: 0.001 },
        });
        engineRef.current = engine;

        const wallThickness = 50;
        const bottomWall = Matter.Bodies.rectangle(
            width / 2,
            height + wallThickness / 2,
            width,
            wallThickness,
            {
                isStatic: true,
            },
        );
        bottomWallRef.current = bottomWall;
        const walls = [
            bottomWall,
            Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
                isStatic: true,
            }),
            Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
                isStatic: true,
            }),
        ];
        Matter.Composite.add(engine.world, walls);

        const balls = participants.map((_, i) => {
            const x = ballRadius + Math.random() * (width - ballRadius * 2);
            const y = -(i * 60) - ballRadius;
            return Matter.Bodies.circle(x, y, ballRadius, {
                restitution: 0.5,
                friction: 0.3,
                frictionAir: 0.01,
                density: 0.002,
            });
        });
        Matter.Composite.add(engine.world, balls);
        bodiesRef.current = balls;

        let lastTime = performance.now();

        function loop(time: number) {
            const delta = time - lastTime;
            lastTime = time;
            Matter.Engine.update(engine, delta);

            const newPositions = bodiesRef.current.map((body) => ({
                x: body.position.x,
                y: body.position.y,
                angle: body.angle,
            }));
            setPositions(newPositions);

            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafRef.current);
            Matter.Engine.clear(engine);
            Matter.Composite.clear(engine.world, false);
        };
    }, [participants, ballRadius]);

    useEffect(() => {
        if (isExiting && engineRef.current && bottomWallRef.current) {
            Matter.Composite.remove(engineRef.current.world, bottomWallRef.current);
            bottomWallRef.current = null;
        }
    }, [isExiting]);

    const diameter = ballRadius * 2;

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            {participants.map((participant, i) => {
                const pos = positions[i];
                if (!pos) return null;
                return (
                    <div
                        key={i}
                        className="absolute rounded-full overflow-hidden border-2 border-white/30"
                        style={{
                            width: diameter,
                            height: diameter,
                            left: pos.x - ballRadius,
                            top: pos.y - ballRadius,
                            transform: `rotate(${pos.angle}rad)`,
                            willChange: 'transform, left, top',
                        }}
                    >
                        <Image
                            src={participant.avatar!}
                            alt="avatar"
                            fill
                            className="object-cover"
                            draggable={false}
                            unoptimized
                        />
                    </div>
                );
            })}
        </div>
    );
}
