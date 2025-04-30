import { html } from "../../utils"
import { actionStyles, hostStyles } from "./styles"

export class ActionDialog extends HTMLElement {
    private renderRoot: ShadowRoot
    private dialog: HTMLDialogElement

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.dialog = document.createElement('dialog')

        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.dialog.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('click', this.onClick)
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

    protected render() {
        this.renderRoot.adoptedStyleSheets = [ hostStyles, actionStyles ]
        const elem = html`
            <section>
                <slot></slot>
            </section>
        `
        this.dialog.appendChild(elem)
        this.renderRoot.appendChild(this.dialog)
    }

    private onClick(event: Event) {
        const target = event.target as HTMLElement
        if (target && target.dataset.button) {
            if (target.dataset.button === 'close') {
                this.closeModal()
            } else {
                ;(this as any).buttonClick?.(event)
            }
        }
        if (target === this.dialog) {
            this.closeModal()
        }
    }

    private openAnimation(deltaY: number = 0) {
        return this.dialog.animate([
            { translate: `0 ${deltaY || 100 }px`, opacity: 0 },
            { translate: '0 0', opacity: 1 },
        ], {
            // duration: 600,
            // easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
            duration: 200,
            easing: 'ease'
        })
    }

    private closeAnimation(deltaY: number = 0) {
        this.dialog.classList.add('closing')

        return this.dialog.animate([
            { translate: `0 ${deltaY}px`, opacity: 1 },
            { translate: `0 ${deltaY + 100}px`, opacity: 0 },
        ], {
            // duration: 600,
            // easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)'
            duration: 200,
            easing: 'ease'
        })
    }
}

customElements.define('action-dialog', ActionDialog)