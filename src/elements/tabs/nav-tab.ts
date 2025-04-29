export class NavTab extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.setAttribute('tabindex', '0')
    }
}

customElements.define('nav-tab', NavTab)