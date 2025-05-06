import { html } from "../../utils"
import { hostStyles } from "../dialogs/styles"
import { datePickerStyle, pickerStyle } from "./styles"
import { CalendarView } from "./calendar-view"

import './calendar-view'
import { AppDate } from "../../utils/date"
import { modalIn, modalOut } from "../animation"

export class DatePicker extends HTMLElement {
    private renderRoot: ShadowRoot
    private inputEl: HTMLInputElement
    private dialog: HTMLDialogElement
    private calender!: CalendarView
    private touchTracker!: HTMLElement

    private startY: number = 0
    private currentY: number = 0
    private isDragging: boolean = false

    static get observedAttributes() {
        return ['value']
    }

    get value(): string {
        return this.inputEl.value || AppDate.getLocalISODate()
    }
    set value(dateString: string) {
        this.setAttribute('value', dateString)
    }

    attributeChangedCallback(_: string, oldValue: string, newValue: string) {
        if (oldValue != newValue && newValue != 'undefined') {
            this.inputEl.value = AppDate.getLocalISODate(newValue)
            this.inputEl.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true,
            }))
        }
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [hostStyles, pickerStyle, datePickerStyle]
        this.dialog = document.createElement('dialog')
        this.inputEl = this.createInput()
        this.touchTracker = document.createElement('div')

        this.onDateChange = this.onDateChange.bind(this)
        this.onDialogClick = this.onDialogClick.bind(this)
        this.onClick = this.onClick.bind(this)
        this.calendarChange = this.calendarChange.bind(this)

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
    }

    connectedCallback() {
        this.calender = this.createCalendar()
        this.render()

        this.watchInputValueChangeByJS(this.inputEl, this.onDateChange)
        this.dialog.addEventListener('click', this.onDialogClick)
        this.calender.addEventListener('change', this.calendarChange)
        this.addEventListener('click', this.onClick)

        this.dialog.addEventListener('touchstart', this.onTouchStart, true)
        this.dialog.addEventListener('touchmove', this.onTouchMove, true)
        this.dialog.addEventListener('touchend', this.onTouchEnd)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('click', this.onDialogClick)
        this.calender.removeEventListener('change', this.calendarChange)
        this.removeEventListener('click', this.onClick)

        this.dialog.removeEventListener('touchstart', this.onTouchStart, true)
        this.dialog.removeEventListener('touchmove', this.onTouchMove, true)
        this.dialog.removeEventListener('touchend', this.onTouchEnd)
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
                    today
                </button>
                <button type="button" data-button="done">
                    done
                </button>
            </footer>
        `

        this.touchTracker.classList.add('touch-tracker')
        this.dialog.appendChild(this.touchTracker)
        this.dialog.appendChild(this.calender)
        this.dialog.appendChild(footerEl)

        this.renderRoot.appendChild(slot)
        this.renderRoot.appendChild(this.dialog)
        this.appendChild(this.inputEl)
        this.dispalyDate()
    }

    private calendarChange(e: Event) {
        const customE = e as CustomEvent
        this.value = customE.detail
    }

    private onClick(event: Event) {
        const target = event.target as HTMLElement
        if (target.hasAttribute('data-button') && target.dataset.button === 'date') {
            this.openModal()
        }
    }
    private onDialogClick(event: Event) {
        const target = event.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            if (target.dataset.button === 'today')
                this.calender.setToday()
            else if (target.dataset.button === 'done')
                this.closeModal()
        } else if (event.target === this.dialog) {
            this.closeModal()
        }
    }

    private onDateChange() {
        this.calender.setAttribute('date', this.value)
        this.dispalyDate()
    }

    private dispalyDate() {
        const el = this.querySelector('date-display')
        if (!el) return
        el.setAttribute('value', this.value)
    }

    private createCalendar() {
        const el = document.createElement('calendar-view') as CalendarView
        el.setAttribute('date', this.value)
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

    private onTouchStart(event: TouchEvent): void {
        const target = event.target as HTMLElement

        if (target !== this.touchTracker) return
        if (event.touches.length !== 1) return

        this.startY = event.touches[0].clientY
        this.currentY = this.startY

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

customElements.define('date-picker', DatePicker)