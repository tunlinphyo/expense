import { appToast } from ".."
import { CustomSelect } from "../../elements"
import { AppService } from "../../firebase/appService"
import { CurrencyService } from "../../firebase/currencyService"
import { effect } from "../../signal"
import { currencySignal, userSignal } from "../../store/signal"
import type { Currency } from "../../types"
import { updateBindings } from "../../utils/data-bind"


export class CurrencySelect extends CustomSelect {
    private template: HTMLTemplateElement | null
    private unsubscribe?: () => void
    private loaded: boolean = false

    constructor() {
        super()
        this.template = this.querySelector('template')

        this.onSelect = this.onSelect.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue)
        if (name === 'value' && newValue !== oldValue) {
            AppService.setField(userSignal.get(), 'currency', newValue)
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.getCurrency()
        this.unsubscribe = effect(() => {
            if (!this.loaded) return
            this.value = currencySignal.get()
        }, [currencySignal])

        this.addEventListener('select', this.onSelect)
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()
        this.unsubscribe?.()
        this.removeEventListener('select', this.onSelect)
    }

    private onSelect(e: Event) {
        const target = e.target as HTMLElement
        const name = target.dataset.name || ''
        appToast.showMessage(`${name}`, 'usd')
    }

    private async getCurrency() {
        if (this.template) {
            const currencies = await CurrencyService.getAllCurrencies()
            for (const currency of currencies) {
                this.renderCurrency(currency)
            }
            this.loaded = true
            this.setOptions()
            this.value = currencySignal.get()
        }
    }

    private renderCurrency(currency: Currency) {
        if (!this.template) return
        const clone = this.template.content.firstElementChild?.cloneNode(true) as HTMLElement
        if (clone) {
            this.appendChild(clone)
            updateBindings(clone, currency, {})
        }
    }
}

customElements.define('currency-select', CurrencySelect)