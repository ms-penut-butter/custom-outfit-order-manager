import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import {z} from "zod"
import {config} from './auth.config'

const mockedData = {
    id: '123',
    email: 'pbrahmbhatt3@outlook.com'
}

function getUser(email: string) {
    if (email === mockedData.email) {
        return mockedData
    }

    return null
}

export const {auth, signIn, signOut} = NextAuth({
    ...config,
    providers: [Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
                .object({
                    email: z.email(), password: z.string().min(6)
                })
                .parse(credentials)

            return getUser(parsedCredentials.email)
        }
    })]
})