import { ToastPopover } from "../elements"
import { ExpenseType } from "../types"
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

    expenseMessage(data: ExpenseType, message: string) {
        const node = html`
            <div class="expense-toast">
                <category-icon data-icon-current icon="${data.category.icon}" data-bg-color="${data.category.color}" width="40" size="14"></category-icon>
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