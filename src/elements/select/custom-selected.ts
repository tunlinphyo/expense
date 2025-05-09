

export class CustomSelected extends HTMLElement {
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
        this.render()
    }

    replaceNode(node: Node) {
        this.replaceChildren(node)
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }
}

customElements.define('custom-selected', CustomSelected)