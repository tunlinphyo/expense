import { ContextConsumer } from "../../context"
import { ReactiveForm } from "../../elements"
import { expenseContext } from "../../store/context"
import { ExpenseContext } from "../../types"
import { deepEqual } from "../../utils"
import { AppDate } from "../../utils/date"

export type FilterType = {
    date: string
    categories: string[]
}

export class FilterForm extends ReactiveForm {
    private contextConsumer: ContextConsumer<ExpenseContext>
    private _firstLoaded: boolean = false

    private dateToggle: HTMLButtonElement | null

    constructor() {
        super()
        this.dateToggle = this.querySelector('button[data-button="quick"]')

        this.contextConsumer = new ContextConsumer(this, expenseContext)
        this.onMonthChange = this.onMonthChange.bind(this)
        this.changeDate = this.changeDate.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.contextConsumer.subscribe((value, oldValue) => {
            if (this._firstLoaded && deepEqual(value, oldValue)) return

            const formData: FilterType = {
                date: AppDate.getLocalISODate(new Date(value.year, value.month, 1)),
                categories: value.categories
            }
            this.setFormData(formData)
            this._firstLoaded = true
        })
        this.addEventListener('input', this.onMonthChange)
        this.dateToggle?.addEventListener('click', this.changeDate)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.contextConsumer.unsubscribe()
        this.removeEventListener('input', this.onMonthChange)
        this.dateToggle?.removeEventListener('click', this.changeDate)
    }

    private changeDate() {
        const to = this.dateToggle?.dataset.to || ''
        console.log('TOOOO', to)
        if (!to) return
        if (to === 'last-month') {
            const date = AppDate.getLocalISODate(AppDate.getLastMonth())
            this.updateFormdata({ date })
        } else {
            const date = AppDate.getLocalISODate()
            this.updateFormdata({ date })
        }
    }

    private onMonthChange(e: Event) {
        const target = e.target as HTMLInputElement
        if (target.name === 'date') {
            console.log(target.name, this.dateToggle, target.value)
            if (!this.dateToggle) return
            if (AppDate.isThisMonth(target.value)) {
                this.dateToggle.dataset.to = 'last-month'
                this.dateToggle.textContent = 'Last month?'
            } else {
                this.dateToggle.dataset.to = 'this-month'
                this.dateToggle.textContent = 'This Month?'
            }
        }
    }

}

customElements.define('filter-form', FilterForm)