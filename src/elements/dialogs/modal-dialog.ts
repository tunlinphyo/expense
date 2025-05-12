import { html } from "../../utils"
import { modalIn, modalOut } from "../animation"
import { hostStyles, modalStyles } from "./styles"

export class ModalDialog extends HTMLElement {
    private renderRoot: ShadowRoot
    protected dialog: HTMLDialogElement
    private startY: number = 0
    private currentY: number = 0
    private isDragging: boolean = false
    private undraggable: boolean = false

    static get touchDisabledTags(): string[] {
        return []
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.dialog = document.createElement('dialog')

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.undraggable = this.hasAttribute('undraggable')
        this.dialog.addEventListener('touchstart', this.onTouchStart, true)
        this.dialog.addEventListener('touchmove', this.onTouchMove, true)
        this.dialog.addEventListener('touchend', this.onTouchEnd)
        this.dialog.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('touchstart', this.onTouchStart, true)
        this.dialog.removeEventListener('touchmove', this.onTouchMove, true)
        this.dialog.removeEventListener('touchend', this.onTouchEnd)
        this.dialog.removeEventListener('click', this.onClick)
    }

    openModal() {
        this.dialog.showModal()
        this.toggleAttribute('modal-open', true)

        const animation = this.openAnimation()
        animation.finished.then(() => {
            this.dispatchEvent(new CustomEvent("opened"))
        })
    }

    closeModal(currentX: number = 0) {
        const animation = this.closeAnimation(currentX)
        this.toggleAttribute('modal-open', false)

        animation.finished.then(() => {
            this.dialog.classList.remove("closing")
            this.dialog.close()
            this.dispatchEvent(new CustomEvent("closed"))
        })
    }

    protected dialogScrollTop() {
        this.dialog.scrollTo({ top: 0, behavior: 'instant' })
    }

    protected render() {
        this.renderRoot.adoptedStyleSheets = [ hostStyles, modalStyles ]
        const elem = html`
            <slot name="header"></slot>
            <section>
                <slot></slot>
            </section>
        `
        if (this.querySelector('.modal-header'))
            this.dialog.classList.add('has-header')

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
            if (this.undraggable) return
            this.closeModal()
        }
    }

    private onTouchStart(event: TouchEvent): void {
        const target = event.target as HTMLElement
        const touchDisabled = (this.constructor as typeof ModalDialog).touchDisabledTags
        if (touchDisabled.includes(target.tagName.toLowerCase())) return

        if (event.touches.length !== 1) return
        if (this.undraggable) return

        this.startY = event.touches[0].clientY
        this.currentY = this.startY
        const top = this.dialog.offsetTop
        if ((this.dialog.scrollTop || 0) > 0 && this.startY > top + 80) return
        if (this.startY < (top - 10)) return

        this.isDragging = true
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return

        this.currentY = event.touches[0].clientY
        const deltaY = this.currentY - this.startY
        if (deltaY > 0) {
            event.preventDefault()
            this.dialog.style.transform = `translateY(${deltaY}px)`
        }
    }

    private onTouchEnd(): void {
        this.dialog.removeAttribute('style')
        if (!this.isDragging) return

        const deltaY = this.currentY - this.startY
        this.isDragging = false

        if (deltaY > this.dialog.clientHeight * 0.3) {
            this.closeModal(deltaY)
        } else if (deltaY > 1) {
            this.openAnimation(deltaY)
        }
    }

    private openAnimation(deltaY: number = 0) {
        return modalIn(this.dialog, deltaY)
    }

    private closeAnimation(deltaY: number = 0) {
        this.dialog.classList.add('closing')

        return modalOut(this.dialog, deltaY)
    }
}

customElements.define('modal-dialog', ModalDialog)