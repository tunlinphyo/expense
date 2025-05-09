import { optionStyle } from "./styles"


export class CustomOption extends HTMLElement {
    private renderRoot: ShadowRoot

    get value() {
        return this.getAttribute('value') || ''
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [optionStyle]

        this.onClick = this.onClick.bind(this)
        this.render()
    }

    getNode(): DocumentFragment {
        const fragment = document.createDocumentFragment()
        Array.from(this.children).forEach(child => {
            fragment.appendChild(child.cloneNode(true))
        })
        return fragment
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private onClick() {
        this.dispatchEvent(new Event('select', {
            bubbles: true,
            cancelable: true,
        }))
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('custom-option', CustomOption)