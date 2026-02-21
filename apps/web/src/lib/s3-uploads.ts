import axios from 'axios';
import { GET_PRESIGNED_URL } from 'routes/api_routes';
import { toast } from '@/lib/toast';

export default class S3 {
    static async handleUploadImage(file: File) {
        if (!file) {
            toast('Please select an image');
            return;
        }

        try {
            const { data } = await axios.post(GET_PRESIGNED_URL, {
                fileType: file.type,
                fileSize: file.size,
            });

            const { uploadUrl, publicUrl } = data;
            if (!uploadUrl) {
                throw new Error('No upload URL received from backend');
            }

            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                timeout: 30000,
            });

            return publicUrl;
        } catch {
            console.error('Error while uploading image');
        }
    }
}
