import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildTestApp } from '../../helpers/app.helper';
import { generateAccessToken } from '../../helpers/auth.helper';
import router from '../../../routes/s3.router';
import S3ClientActions from '../../../class/s3Client';

const app = buildTestApp(router);

describe('presigned uploads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requires authentication', async () => {
        await request(app)
            .post('/api/v1/get-presigned-url')
            .send({ fileType: 'image/png', fileSize: 100 })
            .expect(401);
    });

    it.each([0, -1, 1.5, '100', null])('rejects invalid sizes: %s', async (fileSize) => {
        await request(app)
            .post('/api/v1/get-presigned-url')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ fileType: 'image/png', fileSize })
            .expect(400);
    });

    it('rejects oversized uploads and active content types', async () => {
        await request(app)
            .post('/api/v1/get-presigned-url')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ fileType: 'application/pdf', fileSize: 10 * 1024 * 1024 })
            .expect(413);
        await request(app)
            .post('/api/v1/get-presigned-url')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ fileType: 'image/svg+xml', fileSize: 100 })
            .expect(400);
    });

    it('signs the byte length and MIME type with the real AWS signer', async () => {
        const response = await request(app)
            .post('/api/v1/get-presigned-url')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ fileType: 'image/png', fileSize: 100 })
            .expect(200);
        const url = new URL(response.body.data.uploadUrl);
        expect(url.searchParams.get('X-Amz-SignedHeaders')?.split(';')).toEqual(
            expect.arrayContaining(['content-length', 'content-type']),
        );
        expect(url.searchParams.has('x-amz-checksum-crc32')).toBe(false);
        expect(response.body.data.key).toMatch(/^quiz-images\/.+\.png$/);
    });

    it('gives PDFs distinct keys instead of overwriting a shared object', async () => {
        const s3 = new S3ClientActions();
        const first = await s3.getPresignedUrl('application/pdf', 100);
        const second = await s3.getPresignedUrl('application/pdf', 100);
        expect(first.key).toMatch(/^ai-chat-pdfs\/.+\.pdf$/);
        expect(second.key).not.toBe(first.key);
        expect(first.publicUrl).toContain(first.key);
    });
});
