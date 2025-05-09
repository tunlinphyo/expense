import { calendarStyle } from "./styles"
import './month-grid'
import { MonthGrid, MonthState } from "./month-grid"
import { AppDate } from "../../utils/date"
import { html } from "../../utils"

import "./calendar-body"
import { CalendarBody } from "./calendar-body"

export class CalendarView extends HTMLElement {
    private readonly days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    private renderRoot: ShadowRoot
    private fieldsetEl: HTMLFieldSetElement
    private currentMonth?: HTMLElement
    private calendarBody: CalendarBody
    private monthes: [MonthGrid, MonthGrid, MonthGrid]

    private startX: number = Infinity
    private currentX: number = 0
    private isDragging: boolean = false

    static get observedAttributes() {
        return ['month', 'date']
    }

    get currMonth() {
        const attr = this.getAttribute('month')
        return attr ? new Date(attr) : new Date()
    }
    get prevMonth() {
        const d = this.currMonth
        return new Date(d.getFullYear(), d.getMonth() - 1, d.getDate())
    }
    get nextMonth() {
        const d = this.currMonth
        return new Date(d.getFullYear(), d.getMonth() + 1, d.getDate())
    }
    get prevString() {
        return `${this.prevMonth.getFullYear()}-${String(this.prevMonth.getMonth() + 1).padStart(2, '0')}`
    }
    get nextString() {
        return `${this.nextMonth.getFullYear()}-${String(this.nextMonth.getMonth() + 1).padStart(2, '0')}`
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [calendarStyle]
        this.calendarBody = document.createElement('calendar-body') as CalendarBody
        this.fieldsetEl = document.createElement('fieldset')
        this.monthes = [this.createMonth('curr'), this.createMonth('prev'), this.createMonth('next')]

        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onDateChange = this.onDateChange.bind(this)
        this.yearMonthCahgned = this.yearMonthCahgned.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (newValue && name === 'month' && newValue !== oldValue) {
            this.updateMonth()
            this.calendarBody.setAttribute('value', newValue)
            if (this.currentMonth) this.currentMonth.textContent = AppDate.yearMonth(newValue)
        }
        if (newValue && name === 'date' && newValue !== oldValue) {
            this.setAttribute('month', newValue)
        }
    }

    connectedCallback() {
        this.render()
        this.fieldsetEl.addEventListener('touchstart', this.onTouchStart, { passive: false })
        this.fieldsetEl.addEventListener('touchmove', this.onTouchMove, { passive: false })
        this.fieldsetEl.addEventListener('touchend', this.onTouchEnd)
        this.fieldsetEl.addEventListener('change', this.onDateChange)
        this.calendarBody.addEventListener('yearmonthchange', this.yearMonthCahgned)
    }

    disconnectedCallback() {
        this.fieldsetEl.removeEventListener('touchstart', this.onTouchStart)
        this.fieldsetEl.removeEventListener('touchmove', this.onTouchMove)
        this.fieldsetEl.removeEventListener('touchend', this.onTouchEnd)
        this.fieldsetEl.removeEventListener('change', this.onDateChange)
        this.calendarBody.removeEventListener('yearmonthchange', this.yearMonthCahgned)
    }

    setToday() {
        const d = new Date()
        const now = new Date(d.getFullYear(), d.getMonth(), 1)
        const month = new Date(this.currMonth.getFullYear(), this.currMonth.getMonth(), 1)
        const diff = this.monthDiff(now, month)

        if (diff) this.movetoToday(diff * -1, d.getDate())
    }

    private render() {
        const headers = this.createHeaders()
        const header = this.createHeader(headers)

        for (const month of this.monthes) {
            this.fieldsetEl.appendChild(month)
        }

        this.calendarBody.appendChild(headers)
        this.calendarBody.appendChild(this.fieldsetEl)

        this.renderRoot.appendChild(header)
        this.renderRoot.appendChild(this.calendarBody)
    }

    private yearMonthCahgned(e: Event) {
        const customE = e as CustomEvent
        this.setAttribute('month', customE.detail) // YYYY-MM-DD format needed for safe parsing
    }

    private onDateChange(e: Event) {
        const target = e.target as HTMLInputElement
        this.setAttribute('date', target.value)
        this.dispatchEvent(new CustomEvent('change', {
            detail: target.value,
            bubbles: true,
            cancelable: true,
        }))
    }

    private createHeader(headers: HTMLElement) {
        const header = document.createElement('header')
        const monthToggle = document.createElement('button')
        this.currentMonth = document.createElement('span')
        const btnGroup = document.createElement('div')
        const prevButton = document.createElement('button')
        const nextButton = document.createElement('button')

        monthToggle.dataset.button = 'month-toggle'
        monthToggle.dataset.toggle = 'off' // on | off
        this.currentMonth.textContent = AppDate.yearMonth(this.currMonth)
        const arrow = html`<svg-icon name="next" size="14"></svg-icon>`
        monthToggle.appendChild(this.currentMonth)
        monthToggle.appendChild(arrow)

        btnGroup.classList.add('btn-group')
        prevButton.dataset.button = 'prev'
        prevButton.innerHTML = '<svg-icon name="prev"></svg-icon>'
        nextButton.dataset.button = 'next'
        nextButton.innerHTML = '<svg-icon name="next"></svg-icon>'

        monthToggle.addEventListener('click', () => {
            const toggle = monthToggle.dataset.toggle
            if (toggle === 'off') {
                monthToggle.dataset.toggle = 'on'
                this.calendarBody.setAttribute('month-picker', 'true')
                headers.setAttribute('aria-hidden', 'true')
                this.fieldsetEl.setAttribute('aria-hidden', 'true')
            } else {
                monthToggle.dataset.toggle = 'off'
                this.calendarBody.setAttribute('month-picker', 'false')
                headers.setAttribute('aria-hidden', 'false')
                this.fieldsetEl.setAttribute('aria-hidden', 'false')
            }
        })

        btnGroup.appendChild(prevButton)
        btnGroup.appendChild(nextButton)

        header.appendChild(monthToggle)
        header.appendChild(btnGroup)

        prevButton.addEventListener('click', () => {
            this.convertMonthes(1)
        })
        nextButton.addEventListener('click', () => {
            this.convertMonthes(-1)
        })

        return header
    }

    private createHeaders() {
        const headerEl = document.createElement("div")
        headerEl.classList.add('header')
        for(const day of this.days) {
            const dayEl = document.createElement("div")
            dayEl.className = 'cell cell-title'
            dayEl.textContent = day
            headerEl.appendChild(dayEl)
        }

        return headerEl
    }

    private createMonth(state: MonthState) {
        const el = document.createElement('month-grid') as MonthGrid
        el.state = state
        el.setAttribute('month', this.getMonth())
        el.setAttribute('date', this.getAttribute('date') || '')
        return el
    }

    private updateMonth() {
        for (const month of this.monthes) {
            month.setAttribute('month', this.getMonth())
            month.setAttribute('date', this.getAttribute('date') || '')
        }
    }

    private getMonth(update: number = 0) {
        const monthAttr  = this.getAttribute('month')
        const date = monthAttr ? new Date(monthAttr) : new Date()
        const year = date.getFullYear()
        let month = date.getMonth()
        const newD = new Date(year, month + update, 1)
        return `${newD.getFullYear()}-${String(newD.getMonth() + 1).padStart(2, '0')}`
    }

    private onTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) return

        event.stopPropagation()

        this.startX = event.touches[0].clientX
        this.currentX = this.startX

        this.isDragging = true
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return

        event.stopPropagation()
        event.preventDefault()

        this.currentX = event.touches[0].clientX
        const deltaX = this.currentX - this.startX
        this.moveMonthes(deltaX)
    }

    private onTouchEnd(): void {
        if (!this.isDragging) return

        const deltaX = this.currentX - this.startX
        this.isDragging = false

        if (Math.abs(deltaX) > this.fieldsetEl.clientWidth * 0.3) {
            this.convertMonthes(deltaX)
        } else {
            this.returnMonthes()
        }
    }

    private moveMonthes(x: number) {
        for (const month of this.monthes) {
            month.move(x)
        }
    }

    private returnMonthes() {
        for (const month of this.monthes) {
            month.return()
        }
    }

    private convertMonthes(x: number) {
        const percentage = x > 0 ? 100 : -100
        const state = x < 0 ? 1 : -1
        const onEnd = () => {
            requestAnimationFrame(() => {
                this.setAttribute('month', this.getMonth(state))
            })
            this.monthes[0].removeEventListener('transitionend', onEnd)
        }
        for (const month of this.monthes) {
            month.update(percentage)
        }
        this.monthes[0].addEventListener('transitionend', onEnd)
    }

    private movetoToday(x: number, date: number) {
        const percentage = x < 0 ? 100 : -100
        const abs = Math.abs(x)
        const monthString = this.getMonth(x)
        if (abs > 1) {
            for (const month of this.monthes) {
                const state = x > 0 ? 'next' : 'prev'
                if (month.state === state) {
                    month.setAttribute('date', `${monthString}-${date}`)
                    month.force(monthString)
                }
            }
        }
        const onEnd = () => {
            requestAnimationFrame(() => {
                this.setAttribute('date', `${monthString}-${date}`)
                this.setAttribute('month', monthString)
            })
            this.monthes[0].removeEventListener('transitionend', onEnd)
        }
        for (const month of this.monthes) {
            month.update(percentage)
        }
        this.monthes[0].addEventListener('transitionend', onEnd)
    }

    private monthDiff(fromDate: Date, toDate: Date): number {
        return (
            (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
            (toDate.getMonth() - fromDate.getMonth())
        )
    }
}

customElements.define('calendar-view', CalendarView)