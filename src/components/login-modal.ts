import { ModalDialog } from "../elements"
import { loginAnonymous, loginGithub, loginGoogle } from "../store/login"

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
                const result = await loginGoogle()
                if (result) this.closeModal()
            }
            if (button === 'login-github') {
                const result = await loginGithub()
                if (result) this.closeModal()
            }
            if (button === 'login-anonymous') {
                const result = await loginAnonymous()
                if (result) this.closeModal()
            }
        }
    }
}

customElements.define('login-modal', LoginModal)