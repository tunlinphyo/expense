import { appToast } from ".."
import { ReactiveForm } from "../../elements"
import { CurrencyService } from "../../firebase/currencyService"
import { ExpenseService } from "../../firebase/expenseService"
import { effect } from "../../signal"
import { currencySignal, userSignal } from "../../store/signal"
import { ExpenseType } from "../../types"
import { allSettles, wait } from "../../utils"
import { AppDate } from "../../utils/date"
// import { NumberInput } from "../form/number-input"
import { ExpenseModal } from "./expense-modal"

type FormExpense = Omit<ExpenseType, 'amount' | 'date' | 'category'> & {
    amount: string;
    date: string;
    color: string;
    icon: string;
    name: string;
}

export class ExpenseForm extends ReactiveForm {
    private defaultData: FormExpense = {
        id: '',
        categoryId: '',
        amount: '',
        date: AppDate.getLocalISODate(),
        note: '',
        color: 'gray',
        icon: '',
        name: ''
    }
    private unsubscribe?: () => void
    private _initialDate: Date | null = null
    private expenseUnsubscribe?: () => void

    private dateToggle: HTMLButtonElement | null

    static get observedAttributes(): string[] {
        return ['id']
    }

    constructor() {
        super()
        this.dateToggle = this.querySelector('button[data-button="quick"]')
        this.onCategoryChange = this.onCategoryChange.bind(this)
        this.onDateChange = this.onDateChange.bind(this)
        this.changeDate = this.changeDate.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('change', this.onCategoryChange)
        this.addEventListener('input', this.onDateChange)
        this.dateToggle?.addEventListener('click', this.changeDate)

        this.unsubscribe = effect(() => {
            this.updateCurrencySign(currencySignal.get())
        }, [currencySignal])

        this.expenseUnsubscribe = ExpenseService.onExpenseChange(userSignal.get(), ({type, id}) => {
            const currId = this.getAttribute('id')
            if (currId === id) {
                if (type === 'removed') {
                    const elem = this.closest('expense-modal') as ExpenseModal | null
                    if (elem) {
                        elem.closeModal()
                        appToast.showMessage('Expense deleted', null, true)
                    }
                }
                if (type === 'modified') {
                    this.setExpense(id, true)
                }
            }
        })

        // const amountEl = this.querySelector('input[name="amount"]')
        // amountEl?.addEventListener('focus', (e: Event) => {
        //     const traget = e.target as HTMLElement
        //     traget.scrollIntoView({ block: 'start', behavior: 'auto' })
        // })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('change', this.onCategoryChange)
        this.removeEventListener('input', this.onDateChange)
        this.dateToggle?.removeEventListener('click', this.changeDate)
        this.unsubscribe?.()
        this.expenseUnsubscribe?.()
    }

    clear() {
        if (!this.data.id)
            this.data = this.defaultData
        else
            this.data = this.getFormData()
    }

    getDate() {
        return this._initialDate
    }

    private async updateCurrencySign(id: string) {
        const elem = this.querySelector<HTMLElement>('[data-currency-sign]')
        if (elem) {
            const currency = await CurrencyService.getCurrency(id)
            if (currency) elem.dataset.currencySign = currency.sign
        }
    }

    private onCategoryChange(e: Event) {
        const target = e.target as HTMLInputElement
        if (target.name === 'categoryId') {
            const amountEl = this.querySelector('input[name="amount"]') as HTMLInputElement
            // const amountEl = this.querySelector('number-input') as NumberInput
            if (!amountEl.value)
                amountEl?.focus()
        }
    }

    private changeDate() {
        const to = this.dateToggle?.dataset.to || ''
        if (!to) return
        if (to === 'yesterday') {
            const date = AppDate.getLocalISODate(AppDate.getYesterday())
            this.updateFormdata({ date })
        } else {
            const date = AppDate.getLocalISODate()
            this.updateFormdata({ date })
        }
    }

    private onDateChange(e: Event) {
        const target = e.target as HTMLInputElement
        if (target.name === 'date') {
            if (!this.dateToggle) return
            if (AppDate.isToday(target.value)) {
                this.dateToggle.dataset.to = 'yesterday'
                this.dateToggle.textContent = 'Yeasterday?'
            } else {
                this.dateToggle.dataset.to = 'today'
                this.dateToggle.textContent = 'Today?'
            }
        }
    }

    attributeChangedCallback(name: string, oldValue:string, newValue: string) {
        if (name === 'id') {
            if (newValue === oldValue) return
            this.childrenSettled(() => {
                if (!newValue) {
                    this.defaultData.date = AppDate.getLocalISODate()
                    this.setFormData(this.defaultData)
                } else {
                    this.setExpense(newValue)
                }
            })
        }
    }

    private async setExpense(id: string, isSilent: boolean = false) {
        if (!isSilent) this.setAttribute('data-loading', '')
        const promises = [
            ExpenseService.getExpense(userSignal.get(), id),
            wait()
        ]
        this._initialDate = null
        const success = await allSettles<ExpenseType>(promises, (expense) => {
            this._initialDate = expense.date

            const data: FormExpense = {
                id: expense.id,
                categoryId: expense.categoryId,
                amount: expense.amount.toString(),
                date: AppDate.getLocalISODate(expense.date),
                note: expense.note,
                color: expense.category.color,
                icon: expense.category.icon,
                name: expense.category.name
            }
            this.setFormData(data)
        })
        if (!success) {
            appToast.showMessage('Error occur', null, true)
            this.setFormData(this.defaultData)
        }
        if (!isSilent) this.removeAttribute('data-loading')
    }

    private childrenSettled(callback: () => void) {
        requestAnimationFrame(callback)
    }
}

customElements.define('expense-form', ExpenseForm)