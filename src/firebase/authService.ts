// src/authService.ts
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth"
import { auth, googleProvider } from "./firebase"

export const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user)
    })
}

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        return {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
        }
    } catch (err) {
        console.error("Google login error:", err)
        return null
    }
}

export const logout = () => signOut(auth)