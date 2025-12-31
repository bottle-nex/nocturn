import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

export default async function getReviewController(req: Request, res: Response) {
    if (!req.user?.id) {
        res.status(401).json({
            success: false,
            message: 'User authentication required',
        });
        return;
    }

    try {
        const response = await prisma.review.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                rating: true,
                createdAt: true,
                comment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        if (!response) {
            res.status(400).json({ message: 'Failed to fetch review' });
            return;
        }

        res.status(201).json({ response, message: 'Fetched reviews successfully' });
        return;
    } catch (error) {
        console.error('Error in fetching reviews: ', error);
        res.status(500).json({ message: 'Internal server error while fetching reviews' });
        return;
    }
}
