import { ModalDialog } from "../../elements"

export class CurrencySelect extends HTMLElement {
    private renderRoot: ShadowRoot
    private modalEl: ModalDialog | null

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.modalEl = this.querySelector('modal-dialog') as ModalDialog

        this.onClick = this.onClick.bind(this)
        this.onSelect = this.onSelect.bind(this)
    }

    connectedCallback() {
        this.render()
        this.addEventListener('click', this.onClick)
        this.addEventListener('currencyselected', this.onSelect)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
        this.removeEventListener('currencyselected', this.onSelect)
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'select') {
            this.modalEl?.openModal()
        }
    }

    private onSelect() {
        this.modalEl?.closeModal()
    }

    private render() {
        const slot = document.createElement('slot')

        this.renderRoot.appendChild(slot)
    }
}

customElements.define('currency-select', CurrencySelect)
