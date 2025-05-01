import { effect } from "../../signal"
import { currencySignal, totalSignal } from "../../store/signal"
import { CurrencyDisplay } from "../currency-display"

export class CurrentTotal extends HTMLElement {
    private renderRoot: ShadowRoot
    private dispalyEl: CurrencyDisplay | null
    private unsubscribe?: () => void

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.dispalyEl = this.querySelector<CurrencyDisplay>('currency-display')
    }

    connectedCallback() {
        this.render()

        this.unsubscribe = effect(() => {
            if (this.dispalyEl) {
                this.dispalyEl.setAttribute('value', totalSignal.get().toString())
                this.adjustFontSize(this.dispalyEl)
            }
        }, [totalSignal, currencySignal])
    }

    disconnectedCallback() {
        this.unsubscribe?.()
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }

    private adjustFontSize(element: CurrencyDisplay, maxFontSize: number = 120, minFontSize: number = 24) {
        const textLength = element.textLength
        const newSize = Math.max(minFontSize, maxFontSize - textLength * 7)
        // const factor = Math.pow(Math.sqrt(textLength), 0)
        // const scale = Math.min(1, factor)
        // const reversedScale = 1 - scale

        // const newSize = minFontSize + (maxFontSize - minFontSize) * reversedScale
        element.style.fontSize = `${newSize}px`
    }
}

customElements.define('current-total', CurrentTotal)