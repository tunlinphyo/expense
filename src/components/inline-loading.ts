import { inlineLoading } from "./styles"

export class InlineLoading extends HTMLElement {
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [ inlineLoading ]
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.renderRoot.innerHTML = ''
    }

    private render() {
        // const elem = html`<div class="loading"></div>`
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('inline-loading', InlineLoading)