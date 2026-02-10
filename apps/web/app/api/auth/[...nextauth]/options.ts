import { Account, AuthOptions, ISODateString } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import axios from 'axios';
import { SIGNIN_URL, VERIFY_OTP_URL } from 'routes/api_routes';

export interface UserType {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null;
    token?: string | null;
}

export interface CustomSession {
    user?: UserType;
    expires: ISODateString;
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
                    const response = await axios.post(`${SIGNIN_URL}`, {
                        user,
                        account,
                    });

                    const result = response.data;

                    if (result?.success) {
                        user.id = result.data.user.id.toString();
                        user.token = result.data.token;
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
            if (user) {
                token.user = user as UserType;
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
                    const response = await axios.post(VERIFY_OTP_URL, {
                        email: credentials.email,
                        otp: credentials.otp,
                    });

                    const result = response.data;

                    if (result?.success) {
                        const { user, token } = result.data;
                        return {
                            id: user.id.toString(),
                            name: user.name,
                            email: user.email,
                            image: user.image ?? null,
                            token,
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
