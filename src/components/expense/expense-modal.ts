import { ModalDialog } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { userSignal } from "../../store/signal"
import type { ExpenseType } from "../../types"
import { ExpenseForm } from "./expense-form"


export class ExpenseModal extends ModalDialog {
    private formEl: ExpenseForm

    static get observedAttributes() {
        return ['data-id']
    }

    constructor() {
        super()
        this.formEl = this.querySelector('expense-form')!
    }

    static get touchDisabledTags(): string[] {
        return ['date-picker']
    }

    attributeChangedCallback(_: string, _2:string, value: string) {
        requestAnimationFrame(() => {
            this.formEl.setAttribute('id', value)
        })

        this.formEl.addEventListener('input', () => {
            const formData = this.formEl.data
            const dirty = this.formEl.getAttribute('dirty')
            this.toggleAction(Boolean(dirty && formData.name && formData.color && formData.icon))
        })
    }

    async buttonClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'action') {
            const dirty = this.formEl.getAttribute('dirty')
            if (dirty) {
                try {
                    const data = this.formEl.getFormData()
                    if (data.id) {
                        const expense: Partial<Omit<ExpenseType, "id">> = {
                            categoryId: data.categoryId,
                            amount: Number(data.amount),
                            date: new Date(data.date),
                            note: data.note
                        }
                        this.updateExpense(data.id, expense)
                    } else {
                        const expense: Omit<ExpenseType, "id" | "category"> = {
                            categoryId: data.categoryId,
                            amount: Number(data.amount),
                            date: new Date(data.date),
                            note: data.note
                        }
                        await this.addExpense(expense)
                    }
                    this.closeModal()
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }

    private async addExpense(data: Omit<ExpenseType, "id" | "category">) {
        return ExpenseService.addExpense(userSignal.get(), data)
    }

    private async updateExpense(id: string, expense: Partial<Omit<ExpenseType, "id">>) {
        return ExpenseService.updateExpense(userSignal.get(), id, expense)
    }

    private toggleAction(is: boolean) {
        const actionButton = this.querySelector('button[data-button=action]')
        if (!actionButton) return
        actionButton.toggleAttribute('disabled', !is)
    }
}

customElements.define('expense-modal', ExpenseModal)