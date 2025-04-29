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

    constructor() {
        super()

        this.contextConsumer = new ContextConsumer(this, expenseContext)
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
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.contextConsumer.unsubscribe()
    }
}

customElements.define('filter-form', FilterForm)