import { html } from "../../utils"
import { AppDate } from "../../utils/date"
import { hostStyles } from "../dialogs/styles"
import { pickerStyle } from "./styles"
import { YearMonth } from "./year-month"

import './year-month'

export class MonthPicker extends HTMLElement {
    private renderRoot: ShadowRoot
    private inputEl: HTMLInputElement
    private dialog: HTMLDialogElement
    private yearMonth!: YearMonth

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
        this.renderRoot.adoptedStyleSheets = [hostStyles, pickerStyle]
        this.dialog = document.createElement('dialog')
        this.inputEl = this.createInput()
        this.yearMonth = this.createYearMonth()

        this.onDateChange = this.onDateChange.bind(this)
        this.onDialogClick = this.onDialogClick.bind(this)
        this.onClick = this.onClick.bind(this)
        this.yearMonthChange = this.yearMonthChange.bind(this)
    }

    connectedCallback() {
        this.render()

        this.watchInputValueChangeByJS(this.inputEl, this.onDateChange)
        this.dialog.addEventListener('click', this.onDialogClick)
        this.yearMonth.addEventListener('change', this.yearMonthChange)
        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.dialog.removeEventListener('click', this.onDialogClick)
        this.yearMonth.removeEventListener('change', this.yearMonthChange)
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

        this.dialog.append(this.yearMonth)
        this.dialog.append(footerEl)

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
        if (target.hasAttribute('data-button')) {
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
        if (!el) return console.log('NOT_FOUND')
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

customElements.define('month-picker', MonthPicker)