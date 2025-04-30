import { html } from "../utils"
import { appLoadingStyles, loadingIcon } from "./styles"

export class AppLoading extends HTMLElement {
    private renderRoot: ShadowRoot
    private dialogEl: HTMLDialogElement

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.dialogEl = document.createElement('dialog')

        this.renderRoot.adoptedStyleSheets = [appLoadingStyles, loadingIcon]
    }

    connectedCallback() {
        this.render()
    }

    show() {
        this.dialogEl.showModal()
    }

    hide() {
        this.dialogEl.close()
    }

    private render() {
        const elem = html`<div class="loading"></div>`
        this.dialogEl.appendChild(elem)
        this.renderRoot.appendChild(this.dialogEl)
    }
}

customElements.define('app-loading', AppLoading)