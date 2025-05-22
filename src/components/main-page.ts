import { css } from "../utils"

const hostStyles = css`
    :host {
        width: 100%;
        min-height: 100%;

        display: grid;
        grid-template-columns: var(--layout-column);
        grid-template-rows: [header-start page-start] calc(env(safe-area-inset-top) + 60px) [header-end body-start] auto [body-end page-end];
        padding-block-end: var(--nav-padding);
    }
    ::slotted(*) {
        grid-area: body / body;
    }
    ::slotted(header) {
        grid-area: header / body;

        display: flex;
        justify-content: center;
        align-items: center;
    }
`

export class MainPage extends HTMLElement {
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [hostStyles]
    }

    connectedCallback() {
        this.render()
    }

    render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('main-page', MainPage)