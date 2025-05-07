import { hostStyle } from "./styles"

export class BasePrompt extends HTMLElement {
    private renderRoot: ShadowRoot
    static get observedAttributes() {
        return ['show']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'open'})
        this.renderRoot.adoptedStyleSheets = [hostStyle]

        this.onClick = this.onClick.bind(this)
    }

    attributeChangedCallback(name: string) {
        if (name === 'show') {
            if (this.hasAttribute(name)) {
                this.showPopover()
            } else {
                this.hidePopover()
            }
        }
    }

    connectedCallback() {
        this.render()
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    protected onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            const btn = target.dataset.button
            if (btn === 'prompt-close') {
                this.removeAttribute('show')
            }
        }
    }

    private render() {
        const slot = document.createElement('slot')
        this.setAttribute('popover', 'manual')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('base-prompt', BasePrompt)