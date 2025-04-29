import { calendarBodyStyle } from "./styles"


export class CalendarBody extends HTMLElement {
    private renderRoot: ShadowRoot
    private containerEl: HTMLDivElement
    private yearMonth!: HTMLElement

    static get observedAttributes() {
        return ['value', 'month-picker']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.containerEl = this.createYearMonthContainer()
        this.renderRoot.adoptedStyleSheets = [calendarBodyStyle]
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && oldValue !== newValue) {
            const [year, month] = newValue.split('-')
            this.yearMonth.setAttribute('year', year)
            this.yearMonth.setAttribute('month', month)
        }
        if (name === 'month-picker' && oldValue !== newValue) {
            if (newValue === 'true') {
                this.containerEl.setAttribute('aria-hidden', 'false')
                this.containerEl.setAttribute('role', 'group')
                this.containerEl.setAttribute('aria-label', 'Year and Month Picker')
                this.containerEl.setAttribute('aria-live', 'polite')
                this.containerEl.setAttribute('aria-atomic', 'true')
            } else {
                this.containerEl.setAttribute('aria-hidden', 'true')
                this.containerEl.removeAttribute('role')
                this.containerEl.removeAttribute('aria-label')
                this.containerEl.removeAttribute('aria-live')
                this.containerEl.removeAttribute('aria-atomic')
            }
        }
    }

    connectedCallback() {
        this.render()

        this.yearMonth.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement
            const value = target.value
            this.dispatchEvent(new CustomEvent('yearmonthchange', {
                detail: value,
                bubbles: true,
                cancelable: true,
            }))
        })
    }

    private render() {
        const slot = document.createElement('slot')
        this.renderRoot.appendChild(this.containerEl)
        this.renderRoot.appendChild(slot)
    }

    private createYearMonthContainer() {
        const container = document.createElement('div')
        container.className = 'year-month-container'
        container.dataset.show = 'false'
        container.setAttribute('aria-hidden', 'true')

        this.yearMonth = document.createElement('year-month')
        this.yearMonth.setAttribute('name', 'year-month')

        container.appendChild(this.yearMonth)
        return container
    }
}

customElements.define('calendar-body', CalendarBody)