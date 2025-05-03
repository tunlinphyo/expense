import { appToast } from ".."
import { ContextConsumer } from "../../context"
import { DateDisplay } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { overviewContext } from "../../store/context"
import { userSignal } from "../../store/signal"
import type { OverviewContext, TotalExpense } from "../../types"
import { allSettles, wait } from "../../utils"
import { OverviewLinechart } from "./overview-linechart"

export class OverviewYearly extends HTMLElement {
    private year: number = new Date().getFullYear()
    private consumer: ContextConsumer<OverviewContext>

    private titleEl: DateDisplay | null
    private chartEl: OverviewLinechart | null

    private data: Record<string, number> | null = null

    constructor() {
        super()
        this.consumer = new ContextConsumer<OverviewContext>(this, overviewContext)
        this.titleEl = this.querySelector<DateDisplay>('[data-line-title]')
        this.chartEl = this.querySelector<OverviewLinechart>('overview-linechart')
    }

    connectedCallback() {
        this.titleEl?.setAttribute('value', `${this.year}-01-01`)
        this.consumer.subscribe((value) => {
            this.toggleListeners(value.open)
        })
    }

    disconnectedCallback() {
        this.chartEl?.distory()
        this.consumer.unsubscribe()
    }

    private toggleListeners(inView: boolean) {
        if (inView) {
            this.loadData(this.year)
        } else {
            this.chartEl?.distory()
        }
    }

    private async loadData(year: number) {
        this.toggleAttribute('data-loading', true)
        if (!this.data) {
            const promises = [
                ExpenseService.monthlyTotal(userSignal.get(), year),
                wait()
            ]
            const success = await allSettles<Record<string, number>>(promises, (result) => {
                this.data = result
            })

            if (!success) appToast.showMessage('Error', null, true)
        }
        if (!this.data) return 
        const list: TotalExpense[] = Object.entries(this.data).map(([id, total]) => ({
            id,
            date: new Date(`${id}-01`),
            total
        }))
        if (this.chartEl) this.chartEl.list = list
        this.toggleAttribute('data-loading', false)
    }

}

customElements.define('overview-yearly', OverviewYearly)