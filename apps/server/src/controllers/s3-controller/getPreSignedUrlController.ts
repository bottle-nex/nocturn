import { Request, Response } from 'express';
import S3ClientActions from '../../class/s3Client';
import ResponseWriter from '../../class/response_writer';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export default async function getPreSignedUrlController(req: Request, res: Response) {
    try {
        const { fileType, fileSize } = req.body;

        if (!fileType) {
            ResponseWriter.invalid_data(res, 'File type is required');
            return;
        }

        if(!fileSize) {
            ResponseWriter.invalid_data(res, 'file size is required');
            return;
        }

        if(fileSize >= MAX_PDF_SIZE) {
            ResponseWriter.error(
                res,
                'FILE_SIZE_EXCEEDED',
                `File size exceeds ${MAX_PDF_SIZE / (1024 * 1024)} MB`,
                undefined,
                413,
            );
            return;
        }
        
        if (!fileType.includes('/')) {
            ResponseWriter.invalid_data(
                res,
                "Invalid file type format. Expected format: 'image/png'",
            );
            return;
        }

        const s3Actions = new S3ClientActions();
        const { signedUrl, publicUrl, key } = await s3Actions.getPresignedUrl(fileType);

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
