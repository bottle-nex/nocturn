import { Account, AuthOptions, ISODateString } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import axios from 'axios';
import { SIGNIN_URL, VERIFY_OTP_URL, REFRESH_TOKEN_URL } from 'routes/api_routes';

export interface UserType {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    token?: string | null;
    tokenExpiresAt?: number | null;
}

export interface CustomSession {
    user?: UserType;
    expires: ISODateString;
}

/**
 * Decode a JWT payload without verification to read the `exp` claim.
 */
function getTokenExpiry(token: string): number | null {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64').toString());
        return payload.exp ? payload.exp * 1000 : null; // converting to ms
    } catch {
        return null;
    }
}

/**
 * Call the server's refresh-token endpoint.
 * The refresh token is sent automatically via the httpOnly cookie.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const response = await axios.post(REFRESH_TOKEN_URL, {}, { withCredentials: true });
        const { data } = response.data;

        if (data?.token) {
            const expiresAt = getTokenExpiry(data.token);
            return {
                ...token,
                user: {
                    ...(token.user as UserType),
                    token: data.token,
                    tokenExpiresAt: expiresAt,
                },
            };
        }

        return { ...token, error: 'RefreshTokenError' };
    } catch {
        return { ...token, error: 'RefreshTokenError' };
    }
}

export const authOption: AuthOptions = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        async signIn({ user, account }: { user: UserType; account: Account | null }) {
            try {
                if (
                    account?.provider === 'google' ||
                    account?.provider === 'github' ||
                    account?.provider === 'facebook'
                ) {
                    const response = await axios.post(
                        `${SIGNIN_URL}`,
                        { user, account },
                        { withCredentials: true },
                    );

                    const result = response.data;

                    if (result?.success) {
                        user.id = result.data.user.id.toString();
                        user.token = result.data.token;
                        user.tokenExpiresAt = getTokenExpiry(result.data.token);
                        return true;
                    }
                }

                if (account?.provider === 'email-otp') {
                    return !!user;
                }

                return false;
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        async jwt({ token, user }) {
            // Initial sign-in: persist user data into the JWT
            if (user) {
                token.user = user as UserType;
                return token;
            }

            // On subsequent requests, check if access token is about to expire
            const userData = token.user as UserType;
            const expiresAt = userData?.tokenExpiresAt;

            // Refresh if token expires within the next 60 seconds
            if (expiresAt && Date.now() > expiresAt - 60 * 1000) {
                return refreshAccessToken(token);
            }

            return token;
        },
        async session({ session, token }: { session: CustomSession; token: JWT }) {
            session.user = token.user as UserType;
            return session;
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            id: 'email-otp',
            name: 'Email OTP',
            credentials: {
                email: { label: 'Email', type: 'email' },
                otp: { label: 'OTP', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) return null;

                try {
                    const response = await axios.post(
                        VERIFY_OTP_URL,
                        { email: credentials.email, otp: credentials.otp },
                        { withCredentials: true },
                    );

                    const result = response.data;

                    if (result?.success) {
                        const { user, token } = result.data;
                        return {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                            image: user.image ?? null,
                            token,
                            tokenExpiresAt: getTokenExpiry(token),
                        };
                    }

                    return null;
                } catch {
                    return null;
                }
            },
        }),
    ],
};
