export class TabList extends HTMLElement {
    constructor() {
        super()
        if (!this.getAttribute('role')) {
            this.setAttribute('role', 'tablist')
        }
    }
}

customElements.define('tab-list', TabList)