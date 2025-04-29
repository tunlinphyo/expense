import { effect } from "../signal"
import { currencySignal } from "../store/signal"
import { AppNumber } from "../utils/number"

export class CurrencyDisplay extends HTMLElement {
    private renderRoot: ShadowRoot
    private unsubscribe?: () => void

    static get observedAttributes(): string[] {
        return ['value', 'currency']
    }

    get textLength() {
        return this.renderRoot.textContent?.length || 0
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this.render()
        this.setAttribute('currency', currencySignal.get())

        this.unsubscribe = effect(() => {
            this.setAttribute('currency', currencySignal.get())
        }, [currencySignal])
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }

    attributeChangedCallback(name: string) {
        if (['value', 'currency'].includes(name)) {
            this.render()
        }
    }

    render() {
        const value = Number(this.getAttribute('value')) || 0
        const currency = this.getAttribute('currency')
        if (currency) {
            const price = AppNumber.price(Number(value), currency)
            this.renderRoot.textContent = price
        }
    }
}

customElements.define("currency-display", CurrencyDisplay)