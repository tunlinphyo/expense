import { ContextProvider } from "../../context"
import { effect } from "../../signal"
import { expenseContext } from "../../store/context"
import { userSignal } from "../../store/signal"
import { ExpenseContext } from "../../types"
import { ExpenseList } from "./expense-list"
import { ExpensePagination } from "./expense-pagination"

export class ExpenseGroup extends HTMLElement {
    private provider: ContextProvider<ExpenseContext>
    private unsubscribe?: () => void
    private expenseList: ExpenseList | null
    private expensePagination: ExpensePagination | null

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
        this.expenseList = this.querySelector('expense-list')
        this.expensePagination = this.querySelector('expense-pagination')

        this.onFilterChange = this.onFilterChange.bind(this)
        this.onPaginate = this.onPaginate.bind(this)
        this.onPaginator = this.onPaginator.bind(this)
    }

    connectedCallback() {
        this.addEventListener('filterchange', this.onFilterChange)
        this.addEventListener('paginate', this.onPaginate)
        this.addEventListener('paginator', this.onPaginator)

        this.unsubscribe = effect(() => {
            this.provider.setValue(this.initValue)
        }, [userSignal])
    }

    disconnectedCallback() {
        this.unsubscribe?.()
        this.removeEventListener('filterchange', this.onFilterChange)
        this.removeEventListener('paginate', this.onPaginate)
        this.removeEventListener('paginator', this.onPaginator)
    }

    private onFilterChange(e: Event) {
        const customE = e as CustomEvent
        this.provider.setValue(customE.detail)
    }

    private onPaginate(e: Event) {
        const customE = e as CustomEvent
        if (this.expenseList) this.expenseList.paginate(customE.detail)
    }

    private onPaginator(e: Event) {
        const customE = e as CustomEvent
        if (this.expensePagination) this.expensePagination.state = customE.detail
    }
}

customElements.define('expense-group', ExpenseGroup)