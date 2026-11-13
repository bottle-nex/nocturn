import { Request, Response } from 'express';
import S3ClientActions from '../../class/s3Client';
import ResponseWriter from '../../class/response_writer';

const ALLOWED_FILE_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
]);
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export default async function getPreSignedUrlController(req: Request, res: Response) {
    try {
        const { fileType, fileSize } = req.body;

        if (typeof fileType !== 'string' || !ALLOWED_FILE_TYPES.has(fileType)) {
            ResponseWriter.invalid_data(res, 'Unsupported file type');
            return;
        }

        if (typeof fileSize !== 'number' || !Number.isSafeInteger(fileSize) || fileSize <= 0) {
            ResponseWriter.invalid_data(res, 'File size must be a positive integer');
            return;
        }

        if (fileSize >= MAX_PDF_SIZE) {
            ResponseWriter.error(
                res,
                'FILE_SIZE_EXCEEDED',
                `File size exceeds ${MAX_PDF_SIZE / (1024 * 1024)} MB`,
                undefined,
                413,
            );
            return;
        }

        const s3Actions = new S3ClientActions();
        const { signedUrl, publicUrl, key } = await s3Actions.getPresignedUrl(fileType, fileSize);

        ResponseWriter.success(
            res,
            {
                uploadUrl: signedUrl,
                publicUrl,
                key,
            },
            'Pre-signed URL generated successfully',
        );
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        ResponseWriter.system_error(res);
    }
}
