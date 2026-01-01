'use client';
import WaitingLobbyAvatar from '@/components/waitingRoom/Avatar';
import { ParticipantType } from '@nocturn/types';
import { useState, useEffect, useCallback } from 'react';

interface Position {
    x: number;
    y: number;
}

interface WaitingLobbyAvatarsProps {
    participants: ParticipantType[];
}

export default function WaitingLobbyAvatars({ participants = [] }: WaitingLobbyAvatarsProps) {
    const avatarSize = 100;
    const minDistance = avatarSize + 20;

    const generatePositions = useCallback(
        (total: number): Position[] => {
            const positions: Position[] = [];

            if (total > 0) {
                positions.push({ x: 0, y: 0 });
            }

            const hexRadius = minDistance;
            let layer = 1;
            let avatarsPlaced = 1;

            while (avatarsPlaced < total && layer < 10) {
                const layerPositions: Position[] = [];
                const positionsInLayer = 6 * layer;

                for (let i = 0; i < positionsInLayer; i++) {
                    const angle = (i / positionsInLayer) * 2 * Math.PI;
                    const radius = layer * hexRadius;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    layerPositions.push({ x, y });
                }

                for (const pos of layerPositions) {
                    if (avatarsPlaced >= total) break;

                    let validPosition = true;
                    for (const existingPos of positions) {
                        const distance = Math.sqrt(
                            Math.pow(pos.x - existingPos.x, 2) + Math.pow(pos.y - existingPos.y, 2),
                        );
                        if (distance < minDistance - 1) {
                            validPosition = false;
                            break;
                        }
                    }

                    if (validPosition) {
                        positions.push(pos);
                        avatarsPlaced++;
                    }
                }

                layer++;
            }

            while (avatarsPlaced < total) {
                const gridSize = Math.ceil(Math.sqrt(total));
                const gridSpacing = minDistance;
                const index = avatarsPlaced - 1;
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;

                const offsetX = ((gridSize - 1) * gridSpacing) / 2;
                const offsetY = ((gridSize - 1) * gridSpacing) / 2;

                const x = col * gridSpacing - offsetX;
                const y = row * gridSpacing - offsetY;

                let validPosition = true;
                for (const existingPos of positions) {
                    const distance = Math.sqrt(
                        Math.pow(x - existingPos.x, 2) + Math.pow(y - existingPos.y, 2),
                    );
                    if (distance < minDistance - 1) {
                        validPosition = false;
                        break;
                    }
                }

                if (validPosition) {
                    positions.push({ x, y });
                    avatarsPlaced++;
                } else {
                    const offset = avatarsPlaced * 10;
                    positions.push({ x: x + offset, y: y + offset });
                    avatarsPlaced++;
                }
            }

            return positions;
        },
        [minDistance],
    );

    const safeParticipants = participants || [];
    const [positions, setPositions] = useState<Position[]>(() =>
        generatePositions(safeParticipants.length),
    );

    useEffect(() => {
        setPositions(generatePositions(safeParticipants.length));
    }, [generatePositions, safeParticipants.length]);

    return (
        <div className="w-full  flex-1 max-h-[900px] flex items-center justify-center relative z-[20]">
            {safeParticipants.length === 0 && (
                <div className="text-3xl font-extralight tracking-wider text-wrap">
                    Getting ready to start when the team&apos;s all here!!
                </div>
            )}
            {safeParticipants.slice(0, 20).map((p, index) => {
                const position = positions[index];
                if (!position) {
                    return null;
                }

                return (
                    <WaitingLobbyAvatar
                        key={index}
                        avatar={p.avatar!}
                        name={p.nickname}
                        position={position}
                        index={index}
                        size={avatarSize}
                        showOnlineIndicator={true}
                        showNameTooltip={true}
                    />
                );
            })}
        </div>
    );
}
