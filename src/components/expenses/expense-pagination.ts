import { updateBindings } from "../../utils/data-bind"

export type PaginationState = {
    prevDisable: boolean
    nextDisable: boolean
    page: number | string
}

export class ExpensePagination extends HTMLElement {
    private renderRoot: ShadowRoot

    private _state: PaginationState = {
        prevDisable: true,
        nextDisable: true,
        page: '01'
    }

    get state() {
        return this._state
    }
    set state(state: PaginationState) {
        state.page = String(state.page).padStart(2, '0')
        updateBindings(this, state, this._state)
        this._state = {...state}
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.onClick = this.onClick.bind(this)
    }

    connectedCallback() {
        this.render()
        updateBindings(this, this.state, {})
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            this.dispatchEvent(new CustomEvent('paginate', {
                detail: target.dataset.button,
                bubbles: true,
                cancelable: true
            }))
            this.scrollClosestNavPanelToTop(target)
        }
    }

    private scrollClosestNavPanelToTop(elem: HTMLElement) {
        const panel = elem.closest('nav-panel') as HTMLElement | null
        if (panel) {
            panel.scrollTo({ top: 0, behavior: 'instant' })
        }
    }
}

customElements.define('expense-pagination', ExpensePagination)