import { ModalDialog } from "../../elements"
import { ExpenseContext } from "../../types"
import { FilterForm } from "./filter-form"

export class FilterModal extends ModalDialog {
    private formEl: FilterForm | null
    private actionButton: HTMLButtonElement | null

    static get touchDisabledTags(): string[] {
        return ['date-picker', 'month-picker']
    }

    constructor() {
        super()
        this.setAttribute('data-half', '')
        this.formEl = this.querySelector<FilterForm>('filter-form')
        this.actionButton = this.querySelector('button[data-button=action]')

        this.onSubmit = this.onSubmit.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()

        this.actionButton?.addEventListener('click', this.onSubmit)
    }

    disconnectedCallback() {
        super.disconnectedCallback()

        this.actionButton?.removeEventListener('click', this.onSubmit)
    }

    onSubmit(e: Event) {
        console.log('ON_CLICK', e.target)
        if (!this.formEl || !this.formEl.dirty) {
            this.closeModal()
            return
        }

        const formData = this.formEl.getFormData()
        const date = new Date(formData.date)
        const data: ExpenseContext = {
            year: date.getFullYear(),
            month: date.getMonth(),
            categories: formData.categories
        }
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: data,
            bubbles: true,
            cancelable: true
        }))
        this.closeModal()
    }
}

customElements.define('filter-modal', FilterModal)