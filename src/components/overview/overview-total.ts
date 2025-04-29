import { CurrencyDisplay } from "../currency-display"


export class OverviewTotal extends HTMLElement {
    private renderRoot: ShadowRoot
    private dispalyEl: CurrencyDisplay | null

    static get observedAttributes() {
        return ['value']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.dispalyEl = this.querySelector<CurrencyDisplay>('currency-display')
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && oldValue !== newValue) {
            this.dispalyEl?.setAttribute('value', newValue)
        }
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('overview-total', OverviewTotal)