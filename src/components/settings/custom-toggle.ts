
export class CustomToggle extends HTMLElement {
    private renderRoot: ShadowRoot
    private toggleElem: HTMLElement

    static get observedAttributes() {
        return ['value']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.toggleElem = document.createElement('div')

        this.render()
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && newValue !== oldValue) {
            this.toggleElem.setAttribute('part', `toggle ${newValue}`)
        }
    }

    private render() {
        this.renderRoot.appendChild(this.toggleElem)
    }
}

customElements.define('custom-toggle', CustomToggle)