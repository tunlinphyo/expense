export class NavPanel extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.setAttribute('role', 'tabpanel')
    }
}

customElements.define('nav-panel', NavPanel)