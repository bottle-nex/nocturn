import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import { env } from '../configs/env';
dotenv.config();
const cloudFrontDomain = env.SERVER_AWS_CLOUDFRONT_DOMAIN;

export default class S3ClientActions {
    private s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: env.SERVER_AWS_REGION!,
            credentials: {
                accessKeyId: env.SERVER_AWS_ACCESS_KEY_ID!,
                secretAccessKey: env.SERVER_AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    async getPresignedUrl(
        fileType: string,
    ): Promise<{ signedUrl: string; publicUrl: string; key: string }> {
        const fileExt = this.getFileExtension(fileType);
        const fileName = `${uuid()}.${fileExt}`;
        const key = `quiz-images/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: env.SERVER_AWS_BUCKET_NAME!,
            Key: key,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 60 });
        const publicUrl = `https://${cloudFrontDomain}/${key}`;

        return { signedUrl, publicUrl, key };
    }

    private getFileExtension(mimeType: string): string {
        const mimeToExt: { [key: string]: string } = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'application/pdf': 'pdf',
            'text/plain': 'txt',
            'application/json': 'json',
        };

        return mimeToExt[mimeType] || mimeType.split('/')[1] || 'bin';
    }
}
