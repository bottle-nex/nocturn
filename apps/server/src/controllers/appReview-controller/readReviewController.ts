import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function readReviewController(req: Request, res: Response) {
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'desc' } = req.query;

    try {
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const whereClause: any = {};
        if (rating) {
            whereClause.rating = parseInt(rating as string);
        }

        const orderByClause: any = {};
        orderByClause[sortBy as string] = order === 'desc' ? 'desc' : 'asc';

        const reviews = await prisma.review.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip: skip,
            take: limitNum,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });

        const totalReviews = await prisma.review.count({
            where: whereClause,
        });

        const avgRating = await prisma.review.aggregate({
            where: whereClause,
            _avg: {
                rating: true,
            },
        });

        const ratingDistribution = await prisma.review.groupBy({
            by: ['rating'],
            where: whereClause,
            _count: {
                rating: true,
            },
            orderBy: {
                rating: 'asc',
            },
        });

        const totalPages = Math.ceil(totalReviews / limitNum);

        const response = {
            reviews,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalReviews,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum,
            },
            stats: {
                averageRating: avgRating._avg.rating || 0,
                totalReviews,
                ratingDistribution: ratingDistribution.map((item) => ({
                    rating: item.rating,
                    count: item._count.rating,
                })),
            },
        }

        ResponseWriter.success(res, response, 'Reviews fetched successfully', 200);
        return;

    } catch (error: any) {
        console.error('Error in readReviewController:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
