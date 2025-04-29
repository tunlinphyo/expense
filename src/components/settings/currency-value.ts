import { effect } from "../../signal"
import { currencySignal } from "../../store/signal"

export class CurrencyValue extends HTMLElement {
    private renderRoot: ShadowRoot
    private unsubscribe?: () => void

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'closed' })
    }

    connectedCallback() {
        this.render()

        this.unsubscribe = effect(() => {
            this.renderRoot.textContent = currencySignal.get()
        }, [currencySignal])
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }

    private render() {
        this.renderRoot.textContent = currencySignal.get()
    }
}

customElements.define('currency-value', CurrencyValue)