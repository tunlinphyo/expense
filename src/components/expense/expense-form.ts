import { ReactiveForm } from "../../elements"
import { CurrencyService } from "../../firebase/currencyService"
import { ExpenseService } from "../../firebase/expenseService"
import { effect } from "../../signal"
import { currencySignal, userSignal } from "../../store/signal"
import { ExpenseType } from "../../types"
import { AppDate } from "../../utils/date"

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

    static get observedAttributes(): string[] {
        return ['id']
    }

    constructor() {
        super()
        this.onCategoryChange = this.onCategoryChange.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('change', this.onCategoryChange)

        this.unsubscribe = effect(() => {
            this.updateCurrencySign(currencySignal.get())
        }, [currencySignal])
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('change', this.onCategoryChange)
        this.unsubscribe?.()
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
            amountEl?.focus()
        }
    }

    attributeChangedCallback(name: string, _:string, newValue: string) {
        if (name === 'id') {
            this.childrenSettled(() => {
                if (!newValue) {
                        this.setFormData(this.defaultData)
                } else {
                    this.setExpense(newValue)
                }
            })
        }
    }

    private async setExpense(id: string) {
        const expense = await ExpenseService.getExpense(userSignal.get(), id)
        if (expense) {
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
        }
    }

    private childrenSettled(callback: () => void) {
        requestAnimationFrame(callback)
    }
}

customElements.define('expense-form', ExpenseForm)