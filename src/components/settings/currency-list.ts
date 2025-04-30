import { appToast } from "..";
import { DynamicList } from "../../elements"
import { AppService } from "../../firebase/appService";
import { CurrencyService } from "../../firebase/currencyService";
import { effect } from "../../signal";
import { currencySignal, userSignal } from "../../store/signal";
import { Currency } from "../../types";

type CurrencyItem = {
    id: string,
    item: Currency
}

export class CurrencyList extends DynamicList<CurrencyItem> {
    private currencies: Currency[] = []
    private unsubscribe?: () => void

    constructor() {
        super()
        this.getCurrency()
        this.onChange = this.onChange.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('change', this.onChange)
        this.unsubscribe = effect(() => this.checkInput(), [currencySignal])
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('change', this.onChange)
        this.unsubscribe?.()
    }

    private onChange(e: Event) {
        const target = e.target as HTMLInputElement
        if (target.value) {
            currencySignal.set(target.value)
            AppService.setField(userSignal.get(), 'currency', target.value)
            appToast.showMessage(`${target.dataset.name}`, 'usd')
            this.dispatchEvent(new Event('currencyselected', {
                bubbles: true,
                cancelable: true
            }))
        }
    }

    private checkInput() {
        const elem = this.querySelector<HTMLInputElement>(`input[name=currency][value=${currencySignal.get()}]`)
        if (elem) elem.checked = true
    }

    private async getCurrency() {
        this.currencies = await CurrencyService.getAllCurrencies()
        this.renderCurrency()
    }

    private renderCurrency() {
        const list = this.currencies.map(item => ({
            id: item.id,
            item,
        }))
        this.list = list
        this.checkInput()
    }
}

customElements.define('currency-list', CurrencyList)