import { actionSheet, appLoading, appToast } from ".."
import { ContextConsumer } from "../../context"
import { ModalDialog } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { keyboardContext } from "../../store/context"
import { userSignal } from "../../store/signal"
import type { ExpenseType, KeyboardContext } from "../../types"
import { AppDate } from "../../utils/date"
import { ExpenseForm } from "./expense-form"


export class ExpenseModal extends ModalDialog {
    private formEl: ExpenseForm
    private consumer: ContextConsumer<KeyboardContext>

    static get observedAttributes() {
        return ['data-id']
    }

    constructor() {
        super()
        this.formEl = this.querySelector('expense-form')!
        this.consumer = new ContextConsumer(this, keyboardContext)
    }

    static get touchDisabledTags(): string[] {
        return ['date-picker']
    }

    connectedCallback() {
        super.connectedCallback()
        const textArea = this.querySelector('text-area') as HTMLElement
        this.consumer.subscribe((data, oldData) => {
            if (data.focusElem === textArea && data.status === 'open') {
                if (data.status === oldData.status) return
                this.dialog.classList.add('withKeyboard')
                requestAnimationFrame(() => {
                    console.log(this.dialog.scrollHeight, window.innerHeight, textArea?.offsetTop)
                    this.dialog.scrollTo({
                        top: 2000,
                        behavior: 'smooth'
                    })
                })
            } else {
                this.dialog.classList.remove('withKeyboard')
            }
        })
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
        appToast.showMessage('Expense added', 'check-circle')
    }

    private async updateExpense(id: string, expense: Partial<Omit<ExpenseType, "id">>) {
        appLoading.show()
        await ExpenseService.updateExpense(userSignal.get(), id, expense)
        appLoading.hide()
        this.closeModal()
        this.formEl.clear()
        this.toggleAction(false)
        appToast.showMessage('Expense updated', 'check-circle')
    }

    private async deleteExpense(id: string) {
        appLoading.show()
        await ExpenseService.deleteExpense(userSignal.get(), id)
        appLoading.hide()
        this.closeModal()
        appToast.showMessage('Expense deleted')
    }

    private toggleAction(is: boolean) {
        const actionButton = this.querySelector('button[data-button=action]')
        if (!actionButton) return
        actionButton.toggleAttribute('disabled', !is)
    }
}

customElements.define('expense-modal', ExpenseModal)