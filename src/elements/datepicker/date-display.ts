

export class DateDisplay extends HTMLElement {
    private renderRoot: ShadowRoot

    static get observedAttributes() {
        return ['value']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
    }

    attributeChangedCallback(_1: string, _2: string, newValue: string) {
        const format = this.getAttribute('format') || 'MMMM DD, YYYY'
        this.renderRoot.textContent = this.formatDate(new Date(newValue), format)
    }

    private formatDate(date: Date, format: string): string {
        const map: Record<string, string> = {
            YYYY: date.getFullYear().toString(),
            MM: String(date.getMonth() + 1).padStart(2, '0'),
            M: (date.getMonth() + 1).toString(),
            DD: String(date.getDate()).padStart(2, '0'),
            D: date.getDate().toString(),
            MMMM: date.toLocaleString('en-US', { month: 'long' }),
            MMM: date.toLocaleString('en-US', { month: 'short' }),
            dddd: date.toLocaleString('en-US', { weekday: 'long' }),
            ddd: date.toLocaleString('en-US', { weekday: 'short' }),
        }

        return format.replace(/\b(YYYY|MMMM|MMM|MM|M|DD|D|dddd|ddd)\b/g, match => map[match])
    }
}

customElements.define('date-display', DateDisplay)