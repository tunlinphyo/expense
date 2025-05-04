
import { modalIn, modalOut } from "../animation"
import { hostStyles, scrollModalStyles } from "./styles"

export class ScrollModal extends HTMLElement {
    private renderRoot: ShadowRoot
    protected dialog: HTMLDialogElement
    private startY: number = 0
    private currentY: number = 0
    private isDragging: boolean = false
    private touchTracker!: HTMLElement

    static get touchDisabledTags(): string[] {
        return []
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.dialog = document.createElement('dialog')
        this.touchTracker = document.createElement('div')

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.dialog.addEventListener('touchstart', this.onTouchStart)
        this.dialog.addEventListener('touchmove', this.onTouchMove)
        this.dialog.addEventListener('touchend', this.onTouchEnd)
        this.dialog.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('touchstart', this.onTouchStart)
        this.dialog.removeEventListener('touchmove', this.onTouchMove)
        this.dialog.removeEventListener('touchend', this.onTouchEnd)
        this.dialog.removeEventListener('click', this.onClick)
    }

    openModal() {
        this.dialog.showModal()
        this.dialog.scrollTo({ top: 0, behavior: 'instant' })
        this.toggleAttribute('modal-open', true)
        this.openAnimation()
    }

    closeModal(currentX: number = 0) {
        const animation = this.closeAnimation(currentX)
        this.toggleAttribute('modal-open', false)

        animation.finished.then(() => {
            this.dialog.classList.remove("closing")
            this.dialog.close()
        })
    }

    protected dialogScrollTop() {
        this.dialog.scrollTo({ top: 0, behavior: 'instant' })
    }

    protected render() {
        this.renderRoot.adoptedStyleSheets = [ hostStyles, scrollModalStyles ]
        const sectionEl = document.createElement('section')
        sectionEl.setAttribute('data-no-scrollbar', '')
        sectionEl.innerHTML = `<slot></slot>`
        if (this.querySelector('.modal-header'))
            this.dialog.classList.add('has-header')

        this.touchTracker.classList.add('touch-tracker')
        sectionEl.prepend(this.touchTracker)
        
        this.dialog.appendChild(sectionEl)
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

    private onTouchStart(event: TouchEvent): void {
        const target = event.target as HTMLElement
        if (event.touches.length !== 1) return

        this.startY = event.touches[0].clientY
        this.currentY = this.startY
        const elem = this.dialog.querySelector<HTMLElement>('dialog section')!
        const top = elem.offsetTop
        
        if (target !== this.touchTracker) {
            if ((this.dialog.scrollTop || 0) > 0 && this.startY > top + 80) return
            if (this.startY < (top - 10)) return
        }

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

        if (deltaY > this.dialog.clientHeight * 0.25) {
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

customElements.define('scroll-modal', ScrollModal)
