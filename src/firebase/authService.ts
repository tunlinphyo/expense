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

export type UserType = 'anonymous' | 'google' | 'github' | 'unknown'

export type LoginReturn = { success: true, user: User}
 | { success: false, email: string, credential: OAuthCredential}


export const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}

export const loginWithGoogle = async (credential?: OAuthCredential): Promise<LoginReturn> => {
    try {
        const result = await signInWithPopup(auth, googleProvider)

        if (
            credential &&
            credential.providerId === 'github.com'
        ) {
            await linkWithCredential(result.user, credential)
        }

        return {
            success: true,
            user: result.user
        }
    } catch (error: any) {
        const authError = error as AuthError

        console.log('ERROR_CODE::::::::::', error.code)

        if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email || ''
            const pendingCredential = OAuthProvider.credentialFromError(error)

            if (!pendingCredential) throw new Error('Google sign-in error')

            return {
                success: false,
                email,
                credential: pendingCredential
            }
        } else if (authError.code === 'auth/popup-closed-by-user') {
            throw new Error('Cancled by user');
        } else if (authError.code === 'auth/network-request-failed') {
            throw new Error('Network error');
        } else {
            throw new Error('Google sign-in error')
        }
    }
}

export const loginWithGithub = async (credential?: OAuthCredential): Promise<LoginReturn> => {
    try {
        const result = await signInWithPopup(auth, githubProvider)

        if (
            credential &&
            credential.providerId === 'google.com'
        ) {
            await linkWithCredential(result.user, credential)
        }

        return {
            success: true,
            user: result.user
        }
    } catch (error: any) {
        const authError = error as AuthError

        console.log('ERROR_CODE::::::::::', error.code)

        if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email || ''
            const pendingCredential = OAuthProvider.credentialFromError(error)

            if (!pendingCredential) throw new Error('GitHub sign-in error')

            return {
                success: false,
                email,
                credential: pendingCredential
            }
        } else if (authError.code === 'auth/popup-closed-by-user') {
            throw new Error('Cancled by user');
        } else if (authError.code === 'auth/network-request-failed') {
            throw new Error('Network error');
        } else {
            throw new Error('GitHub sign-in error')
        }

    }
}

export const loginAnonymously = async (): Promise<LoginReturn> => {
    try {
        const result = await signInAnonymously(auth)

        return {
            success: true,
            user: result.user
        }
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