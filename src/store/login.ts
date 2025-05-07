import { appLoading, appToast } from "../components"
import { loginAnonymously, loginWithGithub, loginWithGoogle } from "../firebase/authService"

export async function loginGoogle(): Promise<boolean> {
    appLoading.show()
    return new Promise(resolve => {
        loginWithGoogle()
            .then(() => {
                appToast.showMessage('Sign in success', 'check-circle')
                resolve(true)
            })
            .catch(error => {
                appToast.showMessage(error.message, null, true)
                resolve(false)
            })
            .finally(() => {
                appLoading.hide()
            })
    })
}

export async function loginGithub(): Promise<boolean> {
    appLoading.show()
    return new Promise(resolve => {
        loginWithGithub()
            .then(() => {
                appToast.showMessage('Sign in success', 'check-circle')
                resolve(true)
            })
            .catch(error => {
                appToast.showMessage(error.message, null, true)
                resolve(false)
            })
            .finally(() => {
                appLoading.hide()
            })
    })
}

export async function loginAnonymous(): Promise<boolean> {
    appLoading.show()
    return new Promise(resolve => {
        loginAnonymously()
            .then(() => {
                appToast.showMessage('Sign in success', 'check-circle')
                resolve(true)
            })
            .catch(error => {
                appToast.showMessage(error.message, null, true)
                resolve(false)
            })
            .finally(() => {
                appLoading.hide()
            })
    })
}
