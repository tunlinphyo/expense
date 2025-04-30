import { ContextProvider } from "../../context"
import { effect } from "../../signal"
import { expenseContext } from "../../store/context"
import { userSignal } from "../../store/signal"
import { ExpenseContext } from "../../types"

export class ExpenseGroup extends HTMLElement {
    private provider: ContextProvider<ExpenseContext>
    private unsubscribe?: () => void

    private readonly initValue = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        categories: []
    }

    constructor() {
        super()

        this.provider = new ContextProvider(this, expenseContext, {
            initial: this.initValue
        })
    }

    connectedCallback() {
        this.addEventListener('filterchange', (e: Event) => {
            const customE = e as CustomEvent
            this.provider.setValue(customE.detail)
        })

        this.unsubscribe = effect(() => {
            this.provider.setValue(this.initValue)
        }, [userSignal])
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }

}

customElements.define('expense-group', ExpenseGroup)