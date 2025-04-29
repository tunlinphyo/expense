export class NavTabs extends HTMLElement {
    private _navSlot: HTMLSlotElement
    private _panels: HTMLElement[] = []

    constructor() {
        super()
        const shadow = this.attachShadow({ mode: 'open' })

        const template = document.createElement('template')
        template.innerHTML = `
            <slot name="navs"></slot>
            <slot></slot>
        `
        shadow.appendChild(template.content.cloneNode(true))

        this._navSlot = shadow.querySelector('slot[name=navs]')!
        this._navSlot.addEventListener('slotchange', () => this._bindTabs())
    }

    connectedCallback() {
        this._bindTabs()
    }

    private _bindTabs() {
        const navWrapper = this.querySelector('tab-list')
        const tabs = navWrapper?.querySelectorAll('nav-tab') ?? []
        this._panels = Array.from(this.querySelectorAll('nav-panel'))

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this._activate(index))
            if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab')
        })

        if (tabs.length > 0) this._activate(0)
    }

    private _activate(index: number) {
        const tabs = this.querySelectorAll('nav-tab')
        this._panels.forEach((panel, i) => {
            panel.hidden = i !== index
        })
        tabs.forEach((tab, i) => {
            (tab as HTMLElement).setAttribute('aria-selected', `${i === index}`)
        })
    }
}

customElements.define('nav-tabs', NavTabs)