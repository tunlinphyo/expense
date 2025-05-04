import { appLoading, appToast, loginModal } from "../components"
import { loginWithGoogle } from "../firebase/authService"

const LOCAL_STATUS_KEY = 'localStatus'

export function showLoginModal() {
    const status = getLocalStatus()
    if (status) return false

    loginModal.openModal()
    return new Promise(resolve => {
        const handleLogin = async (e: Event) => {
            const target = e.target as HTMLElement
            if (target.hasAttribute('data-button')) {
                if (target.dataset.button === 'login') {
                    await login()
                    hideLoginModal(handleLogin, resolve, true)
                }
                if (target.dataset.button === 'guest') {
                    setLocalStatus('guest')
                    hideLoginModal(handleLogin, resolve, false)
                }
            }
        }
        loginModal.addEventListener('click', handleLogin)
    })
}

export async function login() {
    appLoading.show()
    return new Promise(resolve => {
        loginWithGoogle()
            .then(() => {
                appToast.showMessage('Sign in success', 'check-circle')
                removeLocalStatus()
            })
            .catch(error => {
                appToast.showMessage(error.message, null, true)
            })
            .finally(() => {
                appLoading.hide()
                resolve(true)
            })
    })
}

function hideLoginModal(callback: (e: Event) => void, resolve: (is: boolean) => void, status: boolean) {
    loginModal.closeModal()
    loginModal.removeEventListener('click', callback)
    resolve(status)
}

function setLocalStatus(status: string) {
    localStorage.setItem(LOCAL_STATUS_KEY, status)
}

function getLocalStatus(): string | null {
    return localStorage.getItem(LOCAL_STATUS_KEY)
}

function removeLocalStatus() {
    localStorage.removeItem(LOCAL_STATUS_KEY)
}
