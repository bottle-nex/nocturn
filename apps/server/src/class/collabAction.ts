import { CollabCookiePayload, CollabRole } from '@nocturn/types';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';

export default class CollabAction {
    public static generate_token_id(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    public static generate_user_token(
        user_id: string,
        quiz_id: string,
        collab_session_id: string,
        role: CollabRole,
    ): string {
        const token_id = CollabAction.generate_token_id();

        const payload: CollabCookiePayload = {
            userId: user_id,
            quizId: quiz_id,
            collabSessionId: collab_session_id,
            role,
            tokenId: token_id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };

        return jwt.sign(payload, env.SERVER_JWT_SECRET);
    }

    public static create_collaboration_link(
        quiz_id: string,
        role: CollabRole,
    ): string {
        const payload = {
            quizId: quiz_id,
            role: role,
        };
        const token = jwt.sign(payload, env.SERVER_JWT_SECRET);
        return `http://localhost:3000/collab/${quiz_id}?collaborationToken=${token}`;
    }

    public static verify_cookie(token: string): CollabCookiePayload | null {
        try {
            return jwt.verify(token, env.SERVER_JWT_SECRET) as CollabCookiePayload;
        } catch (error) {
            return null;
        }
    }
}
