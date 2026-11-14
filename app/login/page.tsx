'use client'
import Link from 'next/link'
import {useActionState} from "react";
import {authenticate} from '../lib/actions'


export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
    return (
        <div>
            <h1>Login</h1>
            <form action={formAction}>
                {errorMessage && <p>{errorMessage}</p>}
                <input name="email" type="email" placeholder="Email" />
                <input name="password" type="password" placeholder="Password" />
                <button disabled={isPending} type="submit">Login {isPending && <span>Loading...</span>}</button>
            </form>
            <p>Don't have an account? <Link href="/sign-up">sign up</Link></p>
        </div>
    )
}