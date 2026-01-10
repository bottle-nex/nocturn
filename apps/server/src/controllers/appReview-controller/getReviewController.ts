import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { ReviewDTO } from '@nocturn/types';

export default async function getReviewController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const response: ReviewDTO[] = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                createdAt: true,
                comment: true,
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (!response) {
            ResponseWriter.not_found(res, 'Failed to fetch reviews');
            return;
        }

        ResponseWriter.success(res, response, 'Reviews fetched successfully', 201);
        return;
    } catch (error) {
        console.error('Error in fetching reviews: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
