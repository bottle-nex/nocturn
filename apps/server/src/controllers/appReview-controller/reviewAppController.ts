import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

export default async function reviewAppController(req: Request, res: Response) {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
        res.status(400).json({
            message: 'Invalid input',
        });
        return;
    }

    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: 'Unauthorized user',
        });
    }

    try {
        const existingReview = await prisma.review.findUnique({
            where: {
                userId: String(user?.id),
            },
        });
        let review;
        if (existingReview) {
            review = await prisma.review.update({
                where: {
                    userId: String(user?.id),
                },
                data: { rating, comment },
            });
        } else {
            review = await prisma.review.create({
                data: {
                    userId: String(user?.id),
                    rating,
                    comment,
                },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review submitted successfully',
            review,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error submitting review',
        });
        console.error('Error in Review file controller', error);
    }
}
