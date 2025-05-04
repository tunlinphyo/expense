import { ModalDialog } from "../elements"

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
}

customElements.define('login-modal', LoginModal)