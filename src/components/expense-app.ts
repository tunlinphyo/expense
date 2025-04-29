import { ModalDialog, PageDialog } from "../elements"
import { AppService } from "../firebase/appService"
import { observeAuthState } from "../firebase/authService"
import { Currency } from "../types"
import { currencySignal, userSignal } from '../store/signal'
import { effect } from "../signal"
import { User } from "firebase/auth"

export class ExpenseApp extends HTMLElement {
    private currencyEffect?: () => void
    private userEffect?: () => void
    private user?: User
    private _loadedFromServer = false

    constructor() {
        super()
        this.onButtonClick = this.onButtonClick.bind(this)
    }

    connectedCallback() {
        this.addEventListener('click', this.onButtonClick)

        observeAuthState((user) => {
            const newId = user?.uid || 'guest'
            userSignal.set(newId)
            this.getAppData(newId)
        })

        this.currencyEffect = effect(() => {
            if (this._loadedFromServer) {
                this.setCurrency(this.user?.uid || 'guest', currencySignal.get())
            }
        }, [currencySignal])

        AppService.onFieldChange(userSignal.get(), 'currency', currency => {
            if (currency) currencySignal.set(currency)
        })
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onButtonClick)
        this.currencyEffect?.()
        this.userEffect?.()
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
        pageEl.openPage()
    }

    private openModal(button: HTMLButtonElement) {
        const modalEl = this.querySelector<ModalDialog>(`#${button.dataset.modalId}`)
        if (!modalEl) return console.error(`No page-dialog with id: ${button.dataset.modalId}`)

        modalEl.setAttribute('data-id', button.dataset.id || '')
        modalEl.openModal()
    }

    private async getAppData(userId: string) {
        const appData = await AppService.getAll(userId)
        const currency = appData.find(item => item.id === 'currency')
        this._loadedFromServer = true
        if (currency)
            currencySignal.set(currency.data)
        else
            this.setCurrency(userId, currencySignal.get())
    }

    private async setCurrency<K extends Currency["id"]>(userId: string, currency: K) {
        await AppService.setField(userId, 'currency', currency)
    }
}

customElements.define('expense-app', ExpenseApp)