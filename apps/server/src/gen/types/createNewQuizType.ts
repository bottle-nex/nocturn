import { z } from 'zod';
import { question_schema } from '../schemas/createNewQuizSchema';

export type generated_question_type = z.infer<typeof question_schema>;
