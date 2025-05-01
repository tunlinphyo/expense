import { updateBindings } from "../../utils/data-bind"

export type PaginationState = {
    prevDisable: boolean
    nextDisable: boolean
    page: number
}

export class ExpensePagination extends HTMLElement {
    private renderRoot: ShadowRoot

    private _state: PaginationState = {
        prevDisable: true,
        nextDisable: true,
        page: 0
    }

    get state() {
        return this._state
    }
    set state(state: PaginationState) {
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
        }
    }
}

customElements.define('expense-pagination', ExpensePagination)