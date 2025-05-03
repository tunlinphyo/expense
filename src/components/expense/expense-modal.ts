import { actionSheet, appLoading } from ".."
import { ModalDialog } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { userSignal } from "../../store/signal"
import type { ExpenseType } from "../../types"
import { AppDate } from "../../utils/date"
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

    attributeChangedCallback(_: string, oldValue:string, newValue: string) {
        requestAnimationFrame(() => {
            if (oldValue != newValue) this.dialogScrollTop()
            this.formEl.setAttribute('id', newValue)
        })

        this.formEl.addEventListener('input', () => {
            const formData = this.formEl.data
            const dirty = this.formEl.getAttribute('dirty')
            this.toggleAction(Boolean(dirty && Number(formData.amount) && formData.categoryId && formData.date))
        })
    }

    buttonClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'action') {
            const dirty = this.formEl.getAttribute('dirty')
            if (dirty) {
                try {
                    const data = this.formEl.getFormData()
                    const initialDate = this.formEl.getDate()
                    if (data.id) {
                        const oldTime = initialDate ? new Date(initialDate) : new Date()
                        const dateWithTime = AppDate.addTimeToDate(new Date(data.date), oldTime)

                        const expense: Partial<Omit<ExpenseType, "id">> = {
                            categoryId: data.categoryId,
                            amount: Number(data.amount),
                            date: dateWithTime,
                            note: data.note
                        }
                        this.updateExpense(data.id, expense)
                    } else {
                        const dateWithTime = AppDate.addTimeToDate(new Date(data.date))

                        const expense: Omit<ExpenseType, "id" | "category"> = {
                            categoryId: data.categoryId,
                            amount: Number(data.amount),
                            date: dateWithTime,
                            note: data.note
                        }
                        console.log("NEW_EXP", data.date, expense)
                        this.addExpense(expense)
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        if (target.dataset.button === 'delete') {
            actionSheet.openSheet({
                actions: [
                    {
                        buttonText: `Delete Expense`,
                        action: () => {
                            const id = this.formEl.getFormData().id
                            this.deleteExpense(id)
                        }
                    },
                ]
            })
        }
    }

    private async addExpense(data: Omit<ExpenseType, "id" | "category">) {
        appLoading.show()
        await ExpenseService.addExpense(userSignal.get(), data)
        appLoading.hide()
        this.closeModal()
        this.formEl.clear()
    }

    private async updateExpense(id: string, expense: Partial<Omit<ExpenseType, "id">>) {
        appLoading.show()
        await ExpenseService.updateExpense(userSignal.get(), id, expense)
        appLoading.hide()
        this.closeModal()
        this.formEl.clear()
        this.toggleAction(false)
    }

    private async deleteExpense(id: string) {
        appLoading.show()
        await ExpenseService.deleteExpense(userSignal.get(), id)
        appLoading.hide()
        this.closeModal()
    }

    private toggleAction(is: boolean) {
        const actionButton = this.querySelector('button[data-button=action]')
        if (!actionButton) return
        actionButton.toggleAttribute('disabled', !is)
    }
}

customElements.define('expense-modal', ExpenseModal)