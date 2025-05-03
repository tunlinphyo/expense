import { ToastPopover } from "../elements"
import { html } from "../utils"

export class AppToast extends ToastPopover {
    showMessage(message: string, icon: string | null = 'info', isError: boolean = false) {
        const node = html`
            <div class="toast ${isError ? 'toast--error' : icon}">
                <div class="icon">
                    <svg-icon name="${isError ? 'exclamation' : (icon ?? 'info')}" size="20"></svg-icon>
                </div>
                <span>${message}</span>
            </div>
        `
        this.appendUI(node)

        requestAnimationFrame(() => {
            this.showToast()
        })
    }

    private appendUI(node: Node) {
        this.innerHTML = ''
        this.appendChild(node)
    }
}

customElements.define('app-toast', AppToast)