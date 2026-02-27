import { Request, Response, NextFunction } from 'express';
import ResponseWriter from '../class/response_writer';
import { planManager } from '@nocturn/premium';
import { SubscriptionEnum } from '@nocturn/types';
import { prisma } from '@nocturn/database';

export default class Subscirption {
    static async spectators_limit(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const userData = await prisma.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    subscriptions: {
                        select: {
                            tier: true,
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1,
                    },
                },
            });

            if (!userData) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const limit = planManager.getLimit(
                (userData.subscriptions[0].tier.name as SubscriptionEnum) || SubscriptionEnum.FREE,
                'maxSpectatorPerSession',
            );

            // try is enabled instead of calling getLimit

        } catch (error) {
            console.error('error in spectators limit: ', error);
            ResponseWriter.system_error(res);
            return;
        }
    }
}
