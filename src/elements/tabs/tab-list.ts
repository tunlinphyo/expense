export class TabList extends HTMLElement {
    constructor() {
        super()
        this.setAttribute('role', 'tablist')
    }
}

customElements.define('tab-list', TabList)