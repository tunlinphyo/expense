import { html } from "../../utils"
import { hostStyles } from "../dialogs/styles"
import { pickerStyle } from "./styles"
import { CalendarView } from "./calendar-view"

import './calendar-view'

export class DatePicker extends HTMLElement {
    private renderRoot: ShadowRoot
    private inputEl: HTMLInputElement
    private dialog: HTMLDialogElement
    private calender!: CalendarView

    static get observedAttributes() {
        return ['value']
    }

    get value(): string {
        return this.inputEl.value || new Date().toISOString().split("T")[0]
    }
    set value(dateString: string) {
        this.setAttribute('value', dateString)
    }

    attributeChangedCallback(_: string, oldValue: string, newValue: string) {
        if (oldValue != newValue) {
            this.inputEl.value = new Date(newValue).toISOString().split("T")[0]
            this.inputEl.dispatchEvent(new Event('input'))
        }
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [hostStyles, pickerStyle]
        this.dialog = document.createElement('dialog')
        this.inputEl = this.createInput()

        this.onDateChange = this.onDateChange.bind(this)
        this.onDialogClick = this.onDialogClick.bind(this)
        this.onClick = this.onClick.bind(this)
        this.calendarChange = this.calendarChange.bind(this)
    }

    connectedCallback() {
        this.calender = this.createCalendar()
        this.render()

        this.watchInputValueChangeByJS(this.inputEl, this.onDateChange)
        this.dialog.addEventListener('click', this.onDialogClick)
        this.calender.addEventListener('change', this.calendarChange)
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('click', this.onDialogClick)
        this.calender.removeEventListener('change', this.calendarChange)
        this.removeEventListener('click', this.onClick)
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
                    TODAY
                </button>
                <button type="button" data-button="done">
                    DONE
                </button>
            </footer>
        `

        this.dialog.append(this.calender)
        this.dialog.append(footerEl)

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
        if (target.hasAttribute('data-button')) {
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
        if (!el) return console.log('NOT_FOUND')
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

    private openAnimation(deltaY: number = 0) {
        return this.dialog.animate([
            { translate: `0 ${deltaY || window.innerHeight }px` },
            { translate: '0 0' },
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
        })
    }

    private closeAnimation(deltaY: number = 0) {
        this.dialog.classList.add('closing')

        return this.dialog.animate([
            { translate: `0 ${deltaY}px` },
            { translate: `0 110%` },
        ], {
            duration: 300,
            easing: 'ease'
        })
    }
}

customElements.define('date-picker', DatePicker)