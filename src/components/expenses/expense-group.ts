import { ContextProvider } from "../../context"
import { expenseContext } from "../../store/context"
import { ExpenseContext } from "../../types"

export class ExpenseGroup extends HTMLElement {
    private provider: ContextProvider<ExpenseContext>

    constructor() {
        super()

        this.provider = new ContextProvider(this, expenseContext, {
            initial: {
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                categories: []
            }
        })
    }

    connectedCallback() {
        this.provider.subscribe((value) => {
            console.log('PROVIDER', value)
        })

        this.addEventListener('filterchange', (e: Event) => {
            const customE = e as CustomEvent
            this.provider.setValue(customE.detail)
        })
    }

    disconnectedCallback() {
        this.provider.unsubscribe()
    }

}

customElements.define('expense-group', ExpenseGroup)