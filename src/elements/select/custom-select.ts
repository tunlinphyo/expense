import { CustomSelected } from './custom-selected'
import { CustomOption } from './custom-option'

import './custom-selected'
import './custom-option'
import { modalIn, modalOut } from '../animation'
import { hostStyles } from '../dialogs/styles'
import { selectStyle } from './styles'
import { html } from '../../utils'

export class CustomSelect extends HTMLElement {
    private renderRoot: ShadowRoot
    private dialog: HTMLDialogElement
    private selectedEl: CustomSelected | null
    private slotEl: HTMLSlotElement
    protected optionMap: Map<string, CustomOption> = new Map()

    private _value: string = ''

    static get observedAttributes() {
        return ['value']
    }

    get value() {
        return this._value
    }
    set value(data: string) {
        this._value = data
        this.setAttribute('value', this.value)
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'open'})
        this.renderRoot.adoptedStyleSheets = [hostStyles, selectStyle]
        this.dialog = document.createElement('dialog')
        this.slotEl = document.createElement('slot')
        this.selectedEl = this.querySelector('custom-selected')

        this.onButtonClick = this.onButtonClick.bind(this)
        this.onDialogClick = this.onDialogClick.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && newValue !== oldValue) {
            this.renderSelected(newValue, oldValue)
        }
    }

    connectedCallback() {
        this.render()
        this.setOptions()

        this.addEventListener('click', this.onButtonClick)
        this.dialog.addEventListener('click', this.onDialogClick)
    }

    disconnectedCallback() {
        this.optionMap = new Map()
        this.removeEventListener('click', this.onButtonClick)
        this.dialog.removeEventListener('click', this.onDialogClick)
    }

    openModal() {
        this.dialog.showModal()
        this.openAnimation()
    }

    closeModal(currentX: number = 0) {
        const animation = this.closeAnimation(currentX)

        animation.finished.then(() => {
            this.dialog.classList.remove("closing")
            this.dialog.close()
        })
    }

    protected setOptions() {
        const options = this.querySelectorAll<CustomOption>('custom-option')
        Array.from(options).forEach(elem => {
            this.optionMap.set(elem.value, elem)
        })
    }

    private render() {
        const slot = document.createElement('slot')
        slot.name = 'button'

        const section = document.createElement('div')
        section.className = 'section'

        const node = html`
            <button type="button" data-button="done" data-icon-button>
                <svg-icon name="close" size="14"></svg-icon>
            </button>
        `

        section.appendChild(this.slotEl)
        this.dialog.appendChild(section)
        this.dialog.appendChild(node)
        this.renderRoot.appendChild(slot)
        this.renderRoot.appendChild(this.dialog)
    }

    private onButtonClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            this.openModal()
        }
    }

    private onDialogClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.tagName === 'CUSTOM-OPTION') {
            const value = (target as CustomOption).value
            this.setAttribute('value', value)
            this.closeModal()
        } else if (target.hasAttribute('data-button') && target.dataset.button === 'done') {
            this.closeModal()
        } else if (target === this.dialog) {
            this.closeModal()
        }
    }

    private openAnimation(deltaY: number = 0) {
        return modalIn(this.dialog, deltaY, true)
    }

    private closeAnimation(deltaY: number = 0) {
        this.dialog.classList.add('closing')

        return modalOut(this.dialog, deltaY)
    }

    private renderSelected(value: string, old: string) {
        const prevSelected = this.optionMap.get(old)
        const selected = this.optionMap.get(value)

        prevSelected?.removeAttribute('selected')
        if (selected) {
            selected.setAttribute('selected', '')
            if (this.selectedEl) {
                const cloned = selected.getNode()
                this.selectedEl.replaceNode(cloned)
            }
        }
    }
}

customElements.define('custom-select', CustomSelect)