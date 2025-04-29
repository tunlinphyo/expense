import { ModalDialog } from "../../elements"

export class CurrencySelect extends HTMLElement {
    private renderRoot: ShadowRoot
    private modalEl: ModalDialog | null

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.modalEl = this.querySelector('modal-dialog') as ModalDialog

        this.onClick = this.onClick.bind(this)
    }

    connectedCallback() {
        this.render()
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'select') {
            this.modalEl?.openModal()
        }
    }

    private render() {
        const slot = document.createElement('slot')

        this.renderRoot.appendChild(slot)
    }
}

customElements.define('currency-select', CurrencySelect)
