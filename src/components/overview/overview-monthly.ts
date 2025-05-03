import type { CategoryTotal, MonthlyResult, OverviewContext } from "../../types"
import { DateDisplay, MonthPicker } from "../../elements"
import { ExpenseService } from "../../firebase/expenseService"
import { userSignal } from "../../store/signal"
import { DoughnutChart } from "./doughnut-chart"
import { OverviewList } from "./overview-list"
import { allSettles, wait } from "../../utils"
import { appToast } from ".."
import { ContextConsumer } from "../../context"
import { overviewContext } from "../../store/context"

export class OverviewMonthly extends HTMLElement {
    private consumer: ContextConsumer<OverviewContext>
    private titleEl: DateDisplay | null
    private monthPicker: MonthPicker | null
    private doughnutChart: DoughnutChart | null

    constructor() {
        super()
        this.consumer = new ContextConsumer<OverviewContext>(this, overviewContext)
        this.titleEl = this.querySelector<DateDisplay>('date-display')
        this.monthPicker = this.querySelector<MonthPicker>('month-picker')
        this.doughnutChart = this.querySelector<DoughnutChart>('doughnut-chart')

        this.onMonthSelect = this.onMonthSelect.bind(this)
    }

    connectedCallback() {
        this.consumer.subscribe(value => {
            this.toggleListeners(value.open)
        })
    }

    disconnectedCallback() {
        this.monthPicker?.removeEventListener('select', this.onMonthSelect)
        this.doughnutChart?.distory()
    }

    private toggleListeners(inView: boolean) {
        if (inView) {
            const monthAttr = document.getElementById('overviewPage')?.getAttribute('month')
            if (monthAttr && this.monthPicker) 
                this.monthPicker.setAttribute('value', monthAttr)

            this.monthPicker?.addEventListener('select', this.onMonthSelect)

            if (this.monthPicker && this.doughnutChart && this.titleEl) {
                this.titleEl.setAttribute('value', this.monthPicker.value)
                this.doughnutChart.setAttribute('month', this.monthPicker.value)
            }

            const month = this.monthPicker?.value || ''
            if (month) this.loadData(month)
        } else {
            this.doughnutChart?.distory()
            this.monthPicker?.removeEventListener('select', this.onMonthSelect)
        }
    }

    private onMonthSelect(e: Event) {
        const customE = e as CustomEvent
        this.titleEl?.setAttribute('value', customE.detail)
        this.loadData(customE.detail)
    }

    private async loadData(monthString: string) {
        this.toggleAttribute('data-loading', true)

        const [y, m] = monthString.split('-')
        const year = Number(y)
        const month = Number(m)
        const promises = [
            ExpenseService.categoryTotal(userSignal.get(), year, month),
            wait()
        ]
        const success = await allSettles<MonthlyResult>(promises, (result) => {
            const list: CategoryTotal[] = Object.entries(result).map(([id, data]) => ({
                id,
                category: data.category,
                total: data.total
            }))
            if (this.doughnutChart) this.doughnutChart.list = list
            this.renderTotal(list)
            this.renderList(list)
        })
        if (!success) appToast.showMessage('Error', null, true)

        this.toggleAttribute('data-loading', false)
    }

    private async renderTotal(list: CategoryTotal[]) {
        const totalEl = this.querySelector('overview-total')
        if (totalEl) {
            const total = list.reduce((accr, item) => accr + item.total,0)
            totalEl.setAttribute('value', total.toString())
        }
    }

    private renderList(list: CategoryTotal[]) {
        const listEl = this.querySelector<OverviewList>('overview-list')
        if (listEl) listEl.list = list.sort((a, b) => a.category.order - b.category.order)
    }
}

customElements.define('overview-monthly', OverviewMonthly)