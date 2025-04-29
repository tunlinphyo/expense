import { ContextConsumer } from "../../context"
import { DynamicList } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { effect } from "../../signal"
import { expenseContext } from "../../store/context"
import { categorySignal, totalSignal, userSignal } from "../../store/signal"
import { CategoryType, ExpenseContext, ExpenseQuery, ExpenseType } from "../../types"
import { isEmptyObject } from "../../utils"
import { AppDate } from "../../utils/date"
import { InlineLoading } from "../inline-loading"

type ExpenseItem = {
    id: string
    item: ExpenseType
    dateString: string
    category: CategoryType
}

export class ExpenseList extends DynamicList<ExpenseItem> {
    private loadingEl?: InlineLoading
    private consumer: ContextConsumer<ExpenseContext>
    private query: ExpenseQuery = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        categories: []
    }
    private lastDoc: any
    private unsubscribe?: () => void
    private expenseUnsubscribe?: () => void
    private lastQueryString = ''

    constructor() {
        super()
        this.consumer = new ContextConsumer(this, expenseContext)
    }

    connectedCallback() {
        super.connectedCallback()
        this.appendLoading()

        this.consumer.subscribe(data => {
            const newQuery: ExpenseQuery = {
                year: data.year,
                month: data.month,
                categories: data.categories
            }
            if (this.isSameQuery(newQuery)) return
            this.query = newQuery
            this.lastDoc = null
            this.loadExpenses()
        })

        this.unsubscribe = effect(() => {
            this.lastDoc = null

            this.expenseUnsubscribe?.()

            this.expenseUnsubscribe = ExpenseService.onExpenseChange(userSignal.get(), () => {
                // this.lastDoc = null
                this.loadExpenses()
                console.log('ON_EXPENSE_CHANGE')
            })
        }, [categorySignal])

    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.consumer.unsubscribe()
        this.unsubscribe?.()
        this.expenseUnsubscribe?.()
    }

    private appendLoading() {
        this.loadingEl = document.createElement('inline-loading') as InlineLoading
        this.appendChild(this.loadingEl)
    }

    private async loadExpenses() {
        const categoryMap = categorySignal.get()
        if (isEmptyObject(categoryMap)) {
            this.list = []
            return
        }

        if (!this.loadingEl) this.appendLoading()

        try {
            const expenses = await ExpenseService.paginatedQuery(userSignal.get(), this.query, 20, this.lastDoc)
            const list = expenses.data.map(item => ({
                id: item.id,
                item: item,
                dateString: AppDate.monthDay(item.date),
                category: categoryMap[item.categoryId]
            }))
            console.log('EXPENSES::::::::::::::::::::::::::::::::::', list, expenses.lastVisible)
            this.list = list
            this.lastDoc = expenses.lastVisible

            this.lastQueryString = JSON.stringify(this.query)
            this.calculateTotal(expenses.data)
        } catch (error) {
            console.error('Failed to load expenses', error)
        } finally {
            this.loadingEl?.remove()
        }
    }

    private isSameQuery(newQuery: ExpenseQuery) {
        return JSON.stringify(newQuery) === this.lastQueryString
    }

    private async calculateTotal(expenses: ExpenseType[]) {
        return new Promise<number>(() => {
            const total = expenses.reduce((acc, expense) => acc + expense.amount, 0)
            totalSignal.set(total)
        })
    }
}

customElements.define('expense-list', ExpenseList)