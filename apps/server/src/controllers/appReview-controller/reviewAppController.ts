import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function reviewAppController(req: Request, res: Response) {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
        ResponseWriter.invalid_data(res);
        return;
    }

    const user = req.user;
    if (!user) {
        ResponseWriter.not_authorized(res);
        return;
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

        ResponseWriter.success(res, review, 'Review submitted successfully', 200);
        return;
    } catch (error) {
        console.error('Error in Review file controller', error);
        ResponseWriter.system_error(res);
        return;
    }
}
