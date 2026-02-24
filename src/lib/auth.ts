import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';

function parseAdminEmails() {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

const adminEmails = parseAdminEmails();

export function isAdminEmail(email?: string | null) {
    if (!email) return false;
    return adminEmails.includes(email.toLowerCase());
}

type OAuthToken = JWT & {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    tokenError?: string;
};

async function refreshGoogleAccessToken(token: OAuthToken): Promise<OAuthToken> {
    if (!token.refreshToken) {
        return { ...token, tokenError: 'MissingRefreshToken' };
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed with status ${response.status}`);
        }

        const refreshed = (await response.json()) as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
        };

        return {
            ...token,
            accessToken: refreshed.access_token,
            accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
            refreshToken: refreshed.refresh_token || token.refreshToken,
            tokenError: undefined,
        };
    } catch (error) {
        console.error('Error refreshing Google access token:', error);
        return { ...token, tokenError: 'RefreshAccessTokenError' };
    }
}

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    scope: [
                        'openid',
                        'email',
                        'profile',
                        'https://www.googleapis.com/auth/calendar.events',
                        'https://www.googleapis.com/auth/calendar.readonly',
                    ].join(' '),
                    access_type: 'offline',
                    prompt: 'consent',
                    include_granted_scopes: 'true',
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            return isAdminEmail(user.email);
        },
        async jwt({ token, account }) {
            const oauthToken = token as OAuthToken;

            if (account) {
                return {
                    ...oauthToken,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token || oauthToken.refreshToken,
                    accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
                    tokenError: undefined,
                };
            }

            if (
                oauthToken.accessToken &&
                oauthToken.accessTokenExpires &&
                Date.now() < oauthToken.accessTokenExpires - 60_000
            ) {
                return oauthToken;
            }

            if (!oauthToken.accessToken || !oauthToken.refreshToken) {
                return oauthToken;
            }

            return refreshGoogleAccessToken(oauthToken);
        },
        async session({ session, token }) {
            const oauthToken = token as OAuthToken;
            session.accessToken = oauthToken.accessToken;
            session.tokenError = oauthToken.tokenError;
            session.calendarConnected = Boolean(oauthToken.accessToken) && !oauthToken.tokenError;
            return session;
        },
    },
};
