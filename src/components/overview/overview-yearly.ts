import { DateDisplay } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { userSignal } from "../../store/signal"
import { TotalExpense } from "../../types"
import { OverviewLinechart } from "./overview-linechart"


export class OverviewYearly extends HTMLElement {
    private year: number = new Date().getFullYear()
    private observer?: IntersectionObserver

    private titleEl: DateDisplay | null
    private chartEl: OverviewLinechart | null

    constructor() {
        super()
        this.titleEl = this.querySelector<DateDisplay>('[data-line-title]')
        this.chartEl = this.querySelector<OverviewLinechart>('overview-linechart')
    }

    connectedCallback() {
        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                this.toggleListeners(entry.isIntersecting)
            }
        }, {
            root: null,
            threshold: 0, // You can tweak this threshold
        })

        this.observer.observe(this)

        this.titleEl?.setAttribute('value', `${this.year}-01-01`)
    }

    disconnectedCallback() {
        this.observer?.disconnect()
        this.chartEl?.distory()
    }

    private toggleListeners(inView: boolean) {
        if (inView) {
            this.loadData(this.year)
        } else {
            this.chartEl?.distory()
        }
    }

    private async loadData(year: number) {
        const result = await ExpenseService.monthlyTotal(userSignal.get(), year)
        const list: TotalExpense[] = Object.entries(result).map(([id, total]) => ({
            id,
            date: new Date(`${id}-01`),
            total
        }))
        if (this.chartEl) this.chartEl.list = list
    }

}

customElements.define('overview-yearly', OverviewYearly)