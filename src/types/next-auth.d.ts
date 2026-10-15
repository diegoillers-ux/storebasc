import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        tokenError?: string;
        calendarConnected?: boolean;
    }
    interface User {
        role?: string;
        isAdmin?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        tokenError?: string;
        role?: string | null;
        isAdmin?: boolean;
    }
}
