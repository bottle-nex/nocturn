import { ApiResponsePayload, CustomResponse, STREAM, stream } from '@nocturn/types';
import { Response } from 'express';

export default class ResponseWriter {
    static secure_success<T extends ApiResponsePayload>(
        res: Response,
        payload: T,
        message: string = 'Request successfull',
        status_code: number = 200,
    ) {
        const response: CustomResponse<T['data']> = {
            success: true,
            data: payload.data,
            message,
            meta: { timestamp: new Date().toISOString() },
        };

        this.send_response(res, response, status_code);
    }

    static success<T>(
        res: Response,
        data: T,
        message: string = 'Request successfull',
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

    static redirect(
        res: Response,
        url: string,
        message: string = 'redirecting', 
        status_code: number = 302,
    ) {
        const response: CustomResponse = {
            success: true,
            message,
            url,
            meta: {
                timestamp: new Date().toISOString(),
            },
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

    static system_error(res: Response) {
        const response: CustomResponse = {
            success: false,
            message: 'Internal server error',
            error: {
                code: 'INTERNAL_SERVER_ERROR',
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, 500);
    }

    static invalid_data(
        res: Response,
        message: string = 'Invalid or Incomplete data provided',
        status_code: number = 400,
    ) {
        const response: CustomResponse = {
            success: false,
            message,
            error: {
                code: 'INVALID_DATA',
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static custom<T>(
        res: Response,
        success: boolean,
        code: string,
        message: string,
        status_code: number,
        data?: T,
        details?: string,
    ) {
        const response: CustomResponse = {
            success,
            data,
            message,
            error: {
                code,
                details,
            },
            meta: { timestamp: new Date().toISOString() },
        };
        this.send_response(res, response, status_code);
    }

    static send_response<T>(res: Response, response: CustomResponse<T>, status_code: number) {
        res.status(status_code).json(response);
    }

    static stream = class Stream {
        static write(res: Response, data: stream) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        static end(res: Response) {
            res.write(
                `data: ${JSON.stringify({
                    type: STREAM.END,
                    data: null,
                })}\n\n`,
            );
            res.end();
        }
    };
}
