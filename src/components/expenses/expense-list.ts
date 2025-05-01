import { ContextConsumer } from "../../context"
import { DynamicList } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { effect } from "../../signal"
import { expenseContext } from "../../store/context"
import { categorySignal, totalSignal, userSignal } from "../../store/signal"
import { CategoryType, ExpenseContext, ExpenseQuery, ExpenseType } from "../../types"
import { html, isEmptyObject, raw, wait } from "../../utils"
import { AppDate } from "../../utils/date"
import { InlineLoading } from "../inline-loading"
import { EMPTY_EXPENSE } from "../svg"
import { PaginationState } from "./expense-pagination"

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
    private unsubscribe?: () => void
    private expenseUnsubscribe?: () => void
    private lastQueryString = ''

    private pageStack: any[] = []
    private hasMore = true

    private loaded: boolean = false

    constructor() {
        super()
        this.consumer = new ContextConsumer(this, expenseContext)
    }

    paginate(direction: 'next' | 'prev') {
        if (direction == 'next') {
            if (this.hasMore)
                this.loadExpenses('next')
        } else {
            if (this.pageStack.length)
                this.loadExpenses('prev')
        }
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

            this.resetQuery()
            if (this.loaded) {
                this.loadExpenses('current')
            }
        })

        this.unsubscribe = effect(() => {
            this.resetQuery()
            this.loadExpenses('current')

            this.expenseUnsubscribe?.()

            this.expenseUnsubscribe = ExpenseService.onExpenseChange(userSignal.get(), (type) => {
                const isCurrent = ["removed", "modified"].includes(type)
                if (isCurrent) {
                    this.loadExpenses('current')
                } else {
                    this.resetQuery()
                    this.loadExpenses('next')
                }
            })
        }, [categorySignal])

        this.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement
            if (target.hasAttribute('data-button')) {
                if (target.dataset.button == 'next') {
                    if (this.hasMore) this.loadExpenses('next')
                } if (target.dataset.button == 'prev') {
                    if (this.pageStack.length) this.loadExpenses('prev')
                }
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.consumer.unsubscribe()
        this.unsubscribe?.()
        this.expenseUnsubscribe?.()
    }

    private resetQuery() {
        this.pageStack = []
        this.hasMore = false
        this.lastQueryString = ''
    }

    private appendLoading() {
        this.loadingEl = document.createElement('inline-loading') as InlineLoading
        this.prepend(this.loadingEl)
    }

    private async loadExpenses(direction: 'next' | 'prev' | 'current' = 'next') {
        console.log('::::::::::EXPENSE::::::::::')
        const categoryMap = categorySignal.get()
        if (isEmptyObject(categoryMap)) {
            this.loadingEl?.remove()
            this.loadingEl = undefined
            this.list = []
            this.calculateTotal([])
            return
        }

        if (!this.loadingEl) this.appendLoading()

        try {
            if (direction === 'prev') {
                this.pageStack.pop()
                this.pageStack.pop()
            }
            if (direction === 'current') {
                this.pageStack.pop()
            }
            const lastDoc = this.pageStack.at?.(-1)
            const expenses = await ExpenseService.paginatedQuery(userSignal.get(), this.query, 10, lastDoc)
            await wait()
            const list = expenses.data.map(item => ({
                id: item.id,
                item: item,
                dateString: AppDate.monthDay(item.date),
                category: categoryMap[item.categoryId]
            }))
            this.list = list
            this.pageStack.push(expenses.docSnap)
            this.hasMore = expenses.hasMore

            this.lastQueryString = JSON.stringify(this.query)
            this.calculateTotal(expenses.data)
        } catch (error) {
            console.log('Failed to load expenses', error)
        } finally {
            this.loaded = true
            requestAnimationFrame(() => {
                this.loadingEl?.remove()
                this.loadingEl = undefined
                this.submitEvent()
            })
        }
    }

    private isSameQuery(newQuery: ExpenseQuery) {
        return JSON.stringify(newQuery) === this.lastQueryString
    }

    private async calculateTotal(expenses: ExpenseType[]) {
        return new Promise<number>(() => {
            const total = expenses.reduce((acc, expense) => acc + expense.amount, 0)
            console.log('TOTAL::::::::::', total)
            totalSignal.set(total)
        })
    }

    private submitEvent() {
        const count = this.pageStack.length
        const state: PaginationState = {
            prevDisable: count <= 1,
            nextDisable: !this.hasMore,
            page: count
        }
        this.dispatchEvent(new CustomEvent('paginator', {
            detail: state,
            bubbles: true,
            cancelable: true
        }))
    }

    protected emptyEl() {
        const container = document.createElement('div')
        container.className = 'empty-container'
        const h4 = document.createElement('h4')
        h4.textContent = 'No expense'
        container.appendChild(html`${raw(EMPTY_EXPENSE)}`)
        container.appendChild(h4)

        return container
    }
}

customElements.define('expense-list', ExpenseList)