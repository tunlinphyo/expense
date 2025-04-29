import { css, html, raw } from "../../utils"
import { ICONS } from "./icons"

const hostStyle = css`
    * { box-sizing: border-box }
    :host {
        display: inline-flex;
    }
`

export class SvgIcon extends HTMLElement {
    private renderRoot: ShadowRoot

    static get observedAttributes() {
        return ['name', 'size']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [ hostStyle ]
    }

    attributeChangedCallback() {
        this.render()
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.renderRoot.innerHTML = ''
    }

    protected render() {
        const name = this.getAttribute('name') || ''
        const size = Number(this.getAttribute('size') || '16')

        this.renderRoot.innerHTML = ''
        const iconEl = html`${raw(ICONS[name](size))}`
        this.renderRoot.appendChild(iconEl)
    }
}

customElements.define('svg-icon', SvgIcon)
