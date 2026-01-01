import { CustomResponse } from '@nocturn/types';
import { Response } from 'express';

export default class ResponseWriter {
    static success<T>(
        res: Response,
        data: T,
        message: string = 'Request successful',
        status_code: number = 200,
    ) {
        const response: CustomResponse<T> = {
            success: true,
            data,
            message,
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static error(
        res: Response,
        code: string,
        message: string = 'An error occurred',
        details?: string,
        status_code: number = 500,
    ) {
        const response: CustomResponse = {
            success: false,
            message,
            error: {
                code,
                details,
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static not_authorized(
        res: Response,
        message: string = 'Not authorized',
        status_code: number = 401,
    ) {
        const response: CustomResponse = {
            success: false,
            message,
            error: {
                code: 'NOT_AUTHORIZED',
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static created<T>(
        res: Response,
        data: T,
        message: string = 'Resource created successfully',
        status_code: number = 201,
    ): void {
        const response: CustomResponse<T> = {
            success: true,
            data,
            message,
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static not_found(res: Response, messaage: string = 'Resource not found') {
        const response: CustomResponse = {
            success: false,
            message: messaage,
            error: {
                code: 'NOT_FOUND',
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, 404);
    }

    static send_response<T>(res: Response, response: CustomResponse<T>, status_code: number) {
        res.status(status_code).json(response);
    }
}
