import { css, html } from "../utils"

const hostStyle = css`
    :host {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 30vh;

        .loading {
            width: 40px;
            aspect-ratio: 1;
            border: 3px solid var(--primary);
            border-left-color: transparent;
            border-radius: 50%;
            animation: loading .6s linear infinite;
        }
    }

    @keyframes loading {
        to {
            rotate: 360deg;
        }
    }
`

export class InlineLoading extends HTMLElement {
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [ hostStyle ]
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