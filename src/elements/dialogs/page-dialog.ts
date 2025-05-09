import { html } from "../../utils"
import { AppNumber } from "../../utils/number"
import { hostStyles, pageStyles } from "./styles"

export class PageDialog extends HTMLElement {
    private renderRoot: ShadowRoot
    protected dialog: HTMLDialogElement
    private startX: number = Infinity
    private currentX: number = 0
    private isDragging: boolean = false

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

    openPage(scrollReset: boolean = false) {
        this.dialog.showModal()
        this.toggleAttribute('page-open', true)
        if (scrollReset) {
            this.dialog.scrollTo(0, 0)
        }

        const animation = this.openAnimation()
        animation.finished.then(() => {
            this.dispatchEvent(new CustomEvent("opened"))
        })
    }

    closePage(deltaX: number = 0, deltaY: number = 0) {
        const animation = this.closeAnimation(deltaX, deltaY)
        this.toggleAttribute('page-open', false)

        animation.finished.then(() => {
            this.dialog.classList.remove("closing")
            this.dialog.close()
            this.dispatchEvent(new CustomEvent("closed"))
        })
    }

    protected render() {
        this.renderRoot.adoptedStyleSheets = [ hostStyles, pageStyles ]
        const elem = html`
            <slot name="header"></slot>
            <section>
                <slot></slot>
            </section>
            <slot name="footer"></slot>
        `
        this.dialog.appendChild(elem)
        this.renderRoot.appendChild(this.dialog)
    }

    private onClick(event: Event) {
        const target = event.target as HTMLElement
        if (target && target.dataset.button) {
            if (target.dataset.button === 'close') {
                this.closePage(0)
            } else {
                ;(this as any).buttonClick?.(event)
            }
        }
    }

    private onTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) return

        this.startX = event.touches[0].clientX
        this.currentX = this.startX
        if (this.startX > 40 && this.startX < (window.innerWidth - 40)) return

        this.isDragging = true
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return

        this.currentX = event.touches[0].clientX
        const deltaX = this.currentX - this.startX
        const x = Math.abs(deltaX)
        if (x > 0) {
            event.preventDefault()

            this.dialog.style.translate = `${AppNumber.mapRange(x,0,window.innerWidth,0,80)}px ${AppNumber.mapRange(x,0,window.innerWidth,0,-20)}px `
            this.dialog.style.scale = `${AppNumber.mapRange(x,0,200,1,0.88)}`
            this.dialog.style.borderRadius = `${AppNumber.mapRange(Math.min(x,200),0,200,0,32)}px`
            this.dialog.style.overflow = 'hidden'
        }
    }

    private onTouchEnd(): void {
        if (!this.isDragging) return

        const deltaX = this.currentX - this.startX
        this.isDragging = false

        const absX = Math.abs(deltaX)
        const x = AppNumber.mapRange(absX,0,window.innerWidth,0,80)
        const y = AppNumber.mapRange(absX,0,window.innerWidth,0,-20)
        if (absX > Math.min(200, this.dialog.clientWidth * 0.3)) {
            this.closePage(x, y)
        } else if (absX > 1) {
            this.openAnimation(x, y)
        }
    }

    private openAnimation(deltaX: number = 0, deltaY: number = 0) {
        const computed = getComputedStyle(this.dialog)
        const scale = computed.scale
        const borderRadius = computed.borderRadius

        this.dialog.removeAttribute('style')

        return this.dialog.animate([
            { translate: `${deltaX || 100 }px ${deltaY}px`, opacity: deltaX > 0 ? 1 : 0, scale, borderRadius },
            { translate: '0 0', opacity: 1, scale: 1, borderRadius: 0 },
        ], {
            duration: 200,
            easing: 'ease'
        })
    }

    private closeAnimation(deltaX: number = 0, deltaY: number = 0) {
        const computed = getComputedStyle(this.dialog)
        const scale = computed.scale
        const borderRadius = computed.borderRadius

        this.dialog.removeAttribute('style')
        this.dialog.classList.add('closing')

        return this.dialog.animate([
            { translate: `${deltaX}px ${deltaY}px`, opacity: 1, scale, borderRadius },
            { translate: `${deltaX}px 0`, opacity: 0, scale, borderRadius },
        ], {
            duration: 200,
            easing: 'ease'
        })
    }
}

customElements.define('page-dialog', PageDialog)