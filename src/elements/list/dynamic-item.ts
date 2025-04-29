import { deepEqual, css } from "../../utils"
import { updateBindings } from "../../utils/data-bind"
import { type WithId } from "../../types"

export class DynamicItem<T extends WithId> extends HTMLElement {
    protected renderRoot: ShadowRoot
    private _data: T = {} as T

    get data(): T {
        return { ...this._data }
    }

    set data(value: T) {
        if (deepEqual(this._data, value)) return
        updateBindings(this, value, this.data)
        this._data = value
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this._onClick = this._onClick.bind(this)

        let sheet = css`
            :host {
                display: block;
            }
        `
        this.renderRoot.adoptedStyleSheets = [sheet]
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(slot)
    }

    connectedCallback(): void {
        this.addEventListener('click', this._onClick)
    }

    disconnectedCallback() {
        this.removeEventListener('click', this._onClick)
    }

    private _onClick(e: Event): void {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            this.dispatchEvent(new CustomEvent('item-click', {
                detail: {
                    id: this._data.id,
                    data: this._data,
                    dataset: target.dataset
                },
                bubbles: true,
                composed: true
            }))
        }
    }
}

customElements.define('dynamic-item', DynamicItem)