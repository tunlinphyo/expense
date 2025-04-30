import { css } from "../utils"

const hostStyles = css`
    :host {
        width: 100%;
        min-height: 100%;

        display: grid;
        grid-template-columns: var(--layout-column);
        grid-template-rows: var(--layout-row);
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