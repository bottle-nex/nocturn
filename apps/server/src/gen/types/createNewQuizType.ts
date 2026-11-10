import type { z } from 'zod';
import type { question_schema } from '../schemas/createNewQuizSchema';

export type generated_question_type = z.infer<typeof question_schema>;
