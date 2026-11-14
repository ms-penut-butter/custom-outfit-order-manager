import type {NextAuthConfig} from 'next-auth'

export const config = {
    pages: {
      signIn: '/login',
    },
    callbacks: {
        authorized: async ({ auth, request: { nextUrl } }) => {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');
            if (isOnLogin) {
                return isLoggedIn ? Response.redirect(new URL('/', nextUrl)) : true
            }
            return isLoggedIn ? true : Response.redirect(new URL('/login', nextUrl))
        }
    },
    providers: []
} satisfies NextAuthConfig