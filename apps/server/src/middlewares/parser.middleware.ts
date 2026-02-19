import type { NextFunction, Request, Response } from 'express';
import express from 'express';

export default function parser_middleware(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/api/v1/webhooks/')) {
        next();
    } else {
        express.json()(req, res, next);
    }
}
