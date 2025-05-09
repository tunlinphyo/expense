import { html } from "../../utils"
import { AppDate } from "../../utils/date"
import { modalIn, modalOut } from "../animation"
import { hostStyles } from "../dialogs/styles"
import { monthPickerStyle, pickerStyle } from "./styles"
import { YearMonth } from "./year-month"

import './year-month'

export class MonthPicker extends HTMLElement {
    private renderRoot: ShadowRoot
    private inputEl: HTMLInputElement
    private dialog: HTMLDialogElement
    private yearMonth!: YearMonth
    // private touchTracker!: HTMLElement

    // private startY: number = 0
    // private currentY: number = 0
    // private isDragging: boolean = false

    static get observedAttributes() {
        return ['value']
    }

    get value(): string {
        return this.inputEl.value || AppDate.getLocalISODate()
    }
    set value(dateString: string) {
        this.setAttribute('value', dateString)
    }

    get yearmonth() {
        const [year, month] = this.value.split('-')
        return [year, month]
    }

    attributeChangedCallback(_: string, oldValue: string, newValue: string) {
        if (oldValue != newValue) {
            this.inputEl.value = AppDate.getLocalISODate(newValue)
            this.inputEl.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true
            }))
        }
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [hostStyles, pickerStyle, monthPickerStyle]
        this.dialog = document.createElement('dialog')
        this.inputEl = this.createInput()
        this.yearMonth = this.createYearMonth()
        // this.touchTracker = document.createElement('div')

        this.onDateChange = this.onDateChange.bind(this)
        this.onDialogClick = this.onDialogClick.bind(this)
        this.onClick = this.onClick.bind(this)
        this.yearMonthChange = this.yearMonthChange.bind(this)

        // this.onTouchStart = this.onTouchStart.bind(this)
        // this.onTouchMove = this.onTouchMove.bind(this)
        // this.onTouchEnd = this.onTouchEnd.bind(this)
    }

    connectedCallback() {
        this.render()

        this.watchInputValueChangeByJS(this.inputEl, this.onDateChange)
        this.dialog.addEventListener('click', this.onDialogClick)
        this.yearMonth.addEventListener('change', this.yearMonthChange)
        this.addEventListener('click', this.onClick)

        // this.dialog.addEventListener('touchstart', this.onTouchStart, true)
        // this.dialog.addEventListener('touchmove', this.onTouchMove, true)
        // this.dialog.addEventListener('touchend', this.onTouchEnd)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('click', this.onDialogClick)
        this.yearMonth.removeEventListener('change', this.yearMonthChange)
        this.removeEventListener('click', this.onClick)

        // this.dialog.removeEventListener('touchstart', this.onTouchStart, true)
        // this.dialog.removeEventListener('touchmove', this.onTouchMove, true)
        // this.dialog.removeEventListener('touchend', this.onTouchEnd)
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

    private render() {
        const slot = document.createElement('slot')
        const footerEl = html`
            <footer>
                <button type="button" data-button="today">
                    <svg-icon name="calendar" size="16"></svg-icon>
                    today
                </button>
                <!-- <button type="button" data-button="done">
                    done
                </button> -->
            </footer>
            <button type="button" data-button="done" data-icon-button>
                <svg-icon name="done" size="16"></svg-icon>
            </button>
        `

        // this.touchTracker.classList.add('touch-tracker')
        // this.dialog.appendChild(this.touchTracker)
        this.dialog.appendChild(this.yearMonth)
        this.dialog.appendChild(footerEl)

        this.renderRoot.appendChild(slot)
        this.renderRoot.appendChild(this.dialog)
        this.appendChild(this.inputEl)
        this.dispalyDate()
    }

    private yearMonthChange(e: Event) {
        const customE = e as CustomEvent
        this.value = customE.detail
    }

    private onClick(event: Event) {
        const target = event.target as HTMLElement
        if (target.hasAttribute('data-button') && target.dataset.button === 'month') {
            this.openModal()
        }
    }
    private onDialogClick(event: Event) {
        const target = event.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            if (target.dataset.button === 'today') {
                this.yearMonth.setToday()
            } else if (target.dataset.button === 'done') {
                this.closeModal()
                this.dispatchEvent(new CustomEvent('select', {
                    detail: this.value,
                    bubbles: true,
                    cancelable: true,
                }))
            }
        } else if (event.target === this.dialog) {
            this.closeModal()
        }
    }

    private onDateChange() {
        const [year, month] = this.yearmonth
        this.yearMonth.setAttribute('year', year)
        this.yearMonth.setAttribute('month', month)
        this.dispalyDate()
    }

    private dispalyDate() {
        const el = this.querySelector('date-display')
        if (!el) return
        el.setAttribute('value', this.value)
    }

    private createYearMonth() {
        const el = document.createElement('year-month') as YearMonth
        const [year, month] = this.yearmonth
        el.setAttribute('year', year)
        el.setAttribute('month', month)
        return el
    }

    private createInput() {
        const el = document.createElement('input')
        el.setAttribute('type', 'date')
        el.setAttribute('name', this.getAttribute('name') || 'date-picker')
        el.setAttribute('data-aria-only', '')
        return el
    }

    private watchInputValueChangeByJS(input: HTMLInputElement, callback: () => void) {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
        if (!descriptor) return

        const originalSetter = descriptor.set!
        Object.defineProperty(input, 'value', {
            set(newValue) {
                originalSetter.call(this, newValue)
                callback()
            },
            get: descriptor.get,
            configurable: true,
        })
    }

    // private onTouchStart(event: TouchEvent): void {
    //     const target = event.target as HTMLElement

    //     if (target !== this.touchTracker) return
    //     if (event.touches.length !== 1) return

    //     this.startY = event.touches[0].clientY
    //     this.currentY = this.startY

    //     this.isDragging = true
    // }

    // private onTouchMove(event: TouchEvent): void {
    //     if (!this.isDragging) return

    //     this.currentY = event.touches[0].clientY
    //     const deltaY = this.currentY - this.startY
    //     if (deltaY > 0) {
    //         event.preventDefault()
    //         this.dialog.style.transform = `translateY(${deltaY}px)`
    //     }
    // }

    // private onTouchEnd(): void {
    //     this.dialog.removeAttribute('style')
    //     if (!this.isDragging) return

    //     const deltaY = this.currentY - this.startY
    //     this.isDragging = false

    //     if (deltaY > this.dialog.clientHeight * 0.3) {
    //         this.closeModal(deltaY)
    //     } else if (deltaY > 1) {
    //         this.openAnimation(deltaY)
    //     }
    // }

    private openAnimation(deltaY: number = 0) {
        return modalIn(this.dialog, deltaY)
    }

    private closeAnimation(deltaY: number = 0) {
        this.dialog.classList.add('closing')

        return modalOut(this.dialog, deltaY)
    }
}

customElements.define('month-picker', MonthPicker)