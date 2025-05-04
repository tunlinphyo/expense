import { appToast } from ".."
import { ContextConsumer } from "../../context"
import { DynamicList } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { effect } from "../../signal"
import { expenseContext } from "../../store/context"
import { categorySignal, totalSignal, userSignal } from "../../store/signal"
import { CategoryType, ExpenseContext, ExpenseQuery, ExpenseType } from "../../types"
import { allSettles, deepEqual, html, isEmptyObject, raw, wait } from "../../utils"
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
    private readonly pageSize = 10
    private loadingEl?: InlineLoading
    private consumer: ContextConsumer<ExpenseContext>
    private query: ExpenseQuery = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        categories: []
    }
    private unsubscribe?: () => void
    private expenseUnsubscribe?: () => void
    private ids: string[] = []

    private pageStack: any[] = []
    private hasMore = true

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

        this.consumer.subscribe((query, oldQuery) => {
            if (deepEqual(query, oldQuery)) return
            this.query = query

            this.fetchTotal()
            this.resetDBQuery() 
            this.loadExpenses('current')
        })

        this.unsubscribe = effect(() => {
            this.expenseUnsubscribe?.()

            this.resetDBQuery()
            this.loadExpenses('current')
            this.fetchTotal()

            this.expenseUnsubscribe = ExpenseService.onExpenseChange(userSignal.get(), ({type, id}) => {
                const is = this.ids.includes(id)
                const isCurrent = ["removed", "modified"].includes(type)
                if (isCurrent && is) {
                    this.loadExpenses('current', is)
                } else {
                    this.resetDBQuery()
                    this.loadExpenses('next', is)
                }
                this.fetchTotal()
            })
        }, [categorySignal], false)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.consumer.unsubscribe()
        this.unsubscribe?.()
        this.expenseUnsubscribe?.()
    }

    private resetDBQuery() {
        this.pageStack = []
        this.hasMore = false
    }

    private appendLoading() {
        this.loadingEl = document.createElement('inline-loading') as InlineLoading
        this.prepend(this.loadingEl)
    }

    private async loadExpenses(direction: 'next' | 'prev' | 'current' = 'next', isSilent: boolean = false) {
        console.log('::::::::::EXPENSE::::::::::')
        const categoryMap = categorySignal.get()
        if (isEmptyObject(categoryMap)) {
            this.loadingEl?.remove()
            this.loadingEl = undefined
            this.list = []
            // this.submitEvent()
            return
        }

        if (!this.loadingEl && !isSilent) this.appendLoading()

        try {
            if (direction === 'prev') {
                this.pageStack.pop()
                this.pageStack.pop()
            }
            if (direction === 'current') {
                this.pageStack.pop()
            }
            const lastDoc = this.pageStack.at?.(-1)
            const promises = [
                ExpenseService.paginatedQuery(userSignal.get(), this.query, this.pageSize, lastDoc),
                wait()
            ]
            const success = await allSettles<{
                data: ExpenseType[];
                docSnap: any;
                hasMore: boolean;
            }>(promises, (expenses) => {
                const list = expenses.data.map(item => ({
                    id: item.id,
                    item: item,
                    dateString: AppDate.monthDay(item.date),
                    category: categoryMap[item.categoryId]
                }))
                this.list = list
                this.pageStack.push(expenses.docSnap)
                this.hasMore = expenses.hasMore
                this.ids = list.map(item => item.id)
            })
            if (!success) appToast.showMessage('Fetch error', null, true)
        } catch (error) {
            appToast.showMessage('Unknow error', null, true)
        } finally {
            requestAnimationFrame(() => {
                this.loadingEl?.remove()
                this.loadingEl = undefined
                this.submitEvent()
            })
        }
    }

    private async fetchTotal() {
        console.log(":::::::::TOTAL::::::::::::")
        const total = await ExpenseService.getTotalAmount(userSignal.get(), this.query)
        totalSignal.set(total)
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