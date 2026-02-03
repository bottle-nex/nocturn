import z from "zod";


export const generateNewQuizSchema = z.object({
    instruction: z.string(),
    sessionId: z.uuidv4(),
})