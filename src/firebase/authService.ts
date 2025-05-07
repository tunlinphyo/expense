import {
    signInAnonymously,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    AuthError,
    OAuthCredential,
    OAuthProvider,
    linkWithCredential,
} from "firebase/auth"
import { auth, googleProvider, githubProvider } from "./firebase"
import { actionSheet } from "../components"

export type UserType = 'anonymous' | 'google' | 'github' | 'unknown'

// ✅ Save the pending credential to link across providers
let pendingCredential: OAuthCredential | null = null

export const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}

export const loginWithGoogle = async (): Promise<boolean> => {
    try {
        const result = await signInWithPopup(auth, googleProvider)

        if (
            pendingCredential &&
            pendingCredential.providerId === 'github.com' &&
            result.user.providerData.every(p => p.providerId !== 'github.com')
        ) {
            await linkWithCredential(result.user, pendingCredential)
            pendingCredential = null
        }

        return true
    } catch (error: any) {
        const authError = error as AuthError

        console.log('ERROR_CODE::::::::::', error.code)

        if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email
            pendingCredential = OAuthProvider.credentialFromError(error)

            if (!pendingCredential) throw new Error('Google sign-in error')

            actionSheet.openSheet({
                title: `Account already exists with: ${email}`,
                actions: [
                    {
                        buttonText: 'Sign in with GitHub',
                        action: async () => {
                            await loginWithGithub()
                        }
                    },
                ]
            })
            throw new Error('User exist')
        } else if (authError.code === 'auth/popup-closed-by-user') {
            throw new Error('Cancled by user');
        } else if (authError.code === 'auth/network-request-failed') {
            throw new Error('Network error');
        } else {
            throw new Error('Google sign-in error')
        }

    }
}

export const loginWithGithub = async (): Promise<boolean> => {
    try {
        const result = await signInWithPopup(auth, githubProvider)

        if (
            pendingCredential &&
            pendingCredential.providerId === 'google.com' &&
            result.user.providerData.every(p => p.providerId !== 'google.com')
        ) {
            await linkWithCredential(result.user, pendingCredential)
            pendingCredential = null
        }

        return true
    } catch (error: any) {
        const authError = error as AuthError

        console.log('ERROR_CODE::::::::::', error.code)

        if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email
            pendingCredential = OAuthProvider.credentialFromError(error)

            if (!pendingCredential) throw new Error('GitHub sign-in error')

            actionSheet.openSheet({
                title: `Account already exists with: ${email}`,
                actions: [
                    {
                        buttonText: 'Sign in with Google',
                        action: async () => {
                            await loginWithGoogle()
                        }
                    },
                ]
            })
            throw new Error('User exist')
        } else if (authError.code === 'auth/popup-closed-by-user') {
            throw new Error('Cancled by user');
        } else if (authError.code === 'auth/network-request-failed') {
            throw new Error('Network error');
        } else {
            throw new Error('GitHub sign-in error')
        }

    }
}

export const loginAnonymously = async (): Promise<User | null> => {
    try {
        const result = await signInAnonymously(auth)
        return result.user
    } catch (error: any) {
        const authError = error as AuthError
        if (authError.code === 'auth/network-request-failed') {
            throw new Error('Network error');
        } else {
            throw new Error(error.message)
        }
    }
}

export const logout = () => signOut(auth)

export const getAuthType = (user: User): UserType => {
    if (user.isAnonymous) return 'anonymous'

    const providerId = user.providerData[0]?.providerId
    switch (providerId) {
        case "google.com":
            return 'google'
        case "github.com":
            return 'github'
        default:
            return 'unknown'
    }
}