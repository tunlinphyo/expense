import { popoverStyles } from "./styles"

export class ToastPopover extends HTMLElement {
    private renderRoot: ShadowRoot
    private timeout: NodeJS.Timeout | undefined
    private startY: number = 0
    private currentY: number = 0
    private isDragging: boolean = false

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'open'})
        this.renderRoot.adoptedStyleSheets = [popoverStyles]

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
    }

    connectedCallback() {
        this.render()
        this.addEventListener('touchstart', this.onTouchStart, true)
        this.addEventListener('touchmove', this.onTouchMove, true)
        this.addEventListener('touchend', this.onTouchEnd)
    }

    disconnectedCallback() {
        this.timeout = undefined
        this.removeEventListener('touchstart', this.onTouchStart, true)
        this.removeEventListener('touchmove', this.onTouchMove, true)
        this.removeEventListener('touchend', this.onTouchEnd)
    }

    showToast() {
        const isOpen = this.matches(':popover-open')
        if (isOpen) {
            this.hideToast()

            const onEnd = () => {
                this.withAutoHide()
                this.removeEventListener('transitionend', onEnd)
            }

            this.addEventListener('transitionend', onEnd)
        } else {
            this.withAutoHide()
        }
    }

    hideToast() {
        clearTimeout(this.timeout)
        this.hidePopover()
    }

    private withAutoHide() {
        clearTimeout(this.timeout)
        this.showPopover()
        this.timeout = setTimeout(() => {
            this.hideToast()
        }, 4000)
    }

    private render() {
        const slot = document.createElement('slot')
        this.setAttribute('popover', 'manual')
        this.renderRoot.appendChild(slot)
    }

    private onTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) return

        this.startY = event.touches[0].clientY
        this.currentY = this.startY

        this.isDragging = true
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return

        this.currentY = event.touches[0].clientY
        const deltaY = this.currentY - this.startY
        if (deltaY < 0) {
            this.style.transform = `translateY(${deltaY}px)`
        }
    }

    private onTouchEnd(): void {
        this.removeAttribute('style')
        if (!this.isDragging) return

        const deltaY = this.currentY - this.startY
        this.isDragging = false

        if (deltaY < -20) {
            this.hidePopover()
        }
    }

}

customElements.define('toast-popover', ToastPopover)