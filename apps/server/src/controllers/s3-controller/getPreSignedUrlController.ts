import { Request, Response } from 'express';
import S3ClientActions from '../../class/s3Client';
import ResponseWriter from '../../class/response_writer';

export default async function getPreSignedUrlController(req: Request, res: Response) {
    try {
        const { fileType } = req.body;

        if (!fileType) {
            ResponseWriter.invalid_data(res, 'File type is required');
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
        return;
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
