import { html } from "../utils"
import { inlineLoading, loadingIcon } from "./styles"

export class InlineLoading extends HTMLElement {
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [ inlineLoading, loadingIcon ]
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.renderRoot.innerHTML = ''
    }

    private render() {
        const elem = html`<div class="loading"></div>`
        this.renderRoot.appendChild(elem)
    }
}

customElements.define('inline-loading', InlineLoading)