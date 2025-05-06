import { IconService } from "../firebase/iconService"
import { iconsSignal } from "../store/signal"
import { IconType } from "../types"
import { css } from "../utils"

const hostStyle = css`
    * { box-sizing: border-box; }
    :host {
        aspect-ratio: 1;
        display: inline-grid;
        place-content: center;
        border-radius: 50%;
        border: 2px solid var(--bg-glass);
        color: light-dark(var(--white), var(--gray-6));
    }
    ::slotted(svg) {
        width: var(--size);
        height: var(--size);
    }
`

export class CategoryIcon extends HTMLElement {
    private renderRoot: ShadowRoot

    static get observedAttributes(): string[] {
        return ['icon']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name: string) {
        if (['icon'].includes(name)) {
            this.render()
        }
    }

    async render() {
        const width = this.getAttribute('width') || '32'
        const icon = this.getAttribute('icon') || ''
        const size = this.getAttribute('size') || '16'

        this.renderRoot.innerHTML = ''

        this.renderRoot.adoptedStyleSheets = [hostStyle]
        this.style.width = `${width}px`
        this.style.setProperty('--size', `${size}px`)
        const slotEl = document.createElement('slot')
        this.renderRoot.appendChild(slotEl)

        if (!icon) return this.innerHTML = ''

        let iconData: IconType | null | undefined = iconsSignal.get().find(item => item.id == icon)
        if (!iconData)
            iconData = await IconService.getIcon(icon)
        if (iconData)
            this.innerHTML = iconData.icon
    }
}

customElements.define("category-icon", CategoryIcon)