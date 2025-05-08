import { OAuthCredential } from "firebase/auth"
import { actionSheet, appLoading, appToast } from "."
import { ModalDialog } from "../elements"
import { loginAnonymously, loginWithGithub, loginWithGoogle } from "../firebase/authService"

export class LoginModal extends ModalDialog {
    constructor() {
        super()
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('keydown', this.onKeyDown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('keydown', this.onKeyDown)
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.code === 'Escape') {
            e.preventDefault()
        }
    }

    async buttonClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            const button = target.dataset.button
            if (button === 'login-google') {
                this.loginGoogle()
            }
            if (button === 'login-github') {
                this.loginGithub()
            }
            if (button === 'login-anonymous') {
                this.loginAnonymous()
            }
        }
    }

    private async loginAnonymous() {
        try {
            appLoading.show()
            const result = await loginAnonymously()
            if (result.success) {
                this.closeModal()
                appToast.showMessage('Anonymously signed in')
            }
        } catch (error) {
            const loginError = error as Error
            appToast.showMessage(loginError.message, null, true)
        } finally {
            appLoading.hide()
        }
    }

    private async loginGoogle() {
        try {
            appLoading.show()
            const result = await loginWithGoogle()
            if (result.success) {
                this.closeModal()
                appToast.showMessage('Sign in success')
            } else {
                actionSheet.openSheet({
                    title: `Account already exists with ${result.email}. Please login again to link accounts.`,
                    actions: [
                        {
                            buttonText: 'Sign in with Google',
                            action: async () => {
                                this.linkWithGithub(result.credential)
                            }
                        },
                    ]
                })
            }
        } catch (error) {
            const loginError = error as Error
            appToast.showMessage(loginError.message, null, true)
        } finally {
            appLoading.hide()
        }
    }

    private async loginGithub() {
        try {
            appLoading.show()
            const result = await loginWithGithub()
            if (result.success) {
                this.closeModal()
                appToast.showMessage('Sign in success')
            } else {
                actionSheet.openSheet({
                    title: `Account already exists with ${result.email}. Please login again to link accounts.`,
                    actions: [
                        {
                            buttonText: 'Sign in with Google',
                            action: async () => {
                                this.linkWithGoogle(result.credential)
                            }
                        },
                    ]
                })
            }
        } catch (error) {
            const loginError = error as Error
            appToast.showMessage(loginError.message, null, true)
        } finally {
            appLoading.hide()
        }
    }

    private async linkWithGithub(credential: OAuthCredential) {
        try {
            appLoading.show()
            const reuslt = await loginWithGithub(credential)
            if (reuslt.success) {
                this.closeModal()
                appToast.showMessage('Linked accounts')
            }
        } catch (error) {
            const loginError = error as Error
            appToast.showMessage(loginError.message, null, true)
        } finally {
            appLoading.hide()
        }
    }

    private async linkWithGoogle(credential: OAuthCredential) {
        try {
            appLoading.show()
            const reuslt = await loginWithGoogle(credential)
            if (reuslt.success) {
                this.closeModal()
                appToast.showMessage('Linked accounts')
            }
        } catch (error) {
            const loginError = error as Error
            appToast.showMessage(loginError.message, null, true)
        } finally {
            appLoading.hide()
        }
    }
}

customElements.define('login-modal', LoginModal)