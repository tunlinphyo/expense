import { ModalDialog, PageDialog } from "../elements"
import { appStore } from "../store"
import { AppDate } from "../utils/date"
import { ExpenseGroup } from "./expenses/expense-group"

export class ExpenseApp extends HTMLElement {
    constructor() {
        super()
        this.onButtonClick = this.onButtonClick.bind(this)
    }

    connectedCallback() {
        appStore()
        this.addEventListener('click', this.onButtonClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onButtonClick)
    }

    private onButtonClick(e: Event) {
        const traget = e.target as HTMLButtonElement
        if (!traget.hasAttribute('data-button')) return

        if (traget.dataset.button === 'page')
            this.openPage(traget)

        if (traget.dataset.button === 'modal')
            this.openModal(traget)
    }

    private openPage(button: HTMLButtonElement) {
        const pageEl = this.querySelector<PageDialog>(`#${button.dataset.pageId}`)
        if (!pageEl) return console.error(`No page-dialog with id: ${button.dataset.pageId}`)

        if (button.dataset.pageId === 'overviewPage') {
            const month = this.onOverviewOpen()
            pageEl.setAttribute('month', month)
        }
        pageEl.openPage()
    }

    private openModal(button: HTMLButtonElement) {
        const modalEl = this.querySelector<ModalDialog>(`#${button.dataset.modalId}`)
        if (!modalEl) return console.error(`No page-dialog with id: ${button.dataset.modalId}`)

        if (button.hasAttribute('data-id'))
            modalEl.setAttribute('data-id', button.dataset.id || '')
        modalEl.openModal()
    }

    private onOverviewOpen() {
        const expenseGroup = this.querySelector<ExpenseGroup>(`expense-group`)
        return expenseGroup?.getFilterDate() || AppDate.getLocalISODate()
    }
}

customElements.define('expense-app', ExpenseApp)