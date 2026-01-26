import z from 'zod';

export const createFolderSchema = z.object({
    name: z.string().min(1).max(100),
});

export const deleteFolderSchema = z.object({
    folderId: z.string(),
});

export const updateFolderSchema = z.object({
    folderId: z.string(),
    name: z.string().min(1).max(100),
});
