import { ContextConsumer } from "../../context"
import { DateDisplay } from "../../elements"
import { expenseContext } from "../../store/context"
import { ExpenseContext } from "../../types"
import { css } from "../../utils"
import { AppDate } from "../../utils/date"

const hostStyles = css`
    date-display {
        font-size: var(--text-lg);
        color: var(--fg-color);
        padding-inline: var(--size-2);
    }
`

export class ExpenseFilter extends HTMLElement {
    private renderRoot: ShadowRoot
    private dateDisplay: DateDisplay

    private consumer: ContextConsumer<ExpenseContext>

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.adoptedStyleSheets = [ hostStyles ]
        this.dateDisplay = this.createDateDisplay()

        this.consumer = new ContextConsumer(this, expenseContext)
    }

    connectedCallback() {
        this.render()

        this.consumer.subscribe((value, oldValue) => {
            const dateString = AppDate.getLocalISODate(new Date(value.year, value.month, 1))
            this.dateDisplay.setAttribute('value', dateString)
            this.setBadge(value.categories.length)
        })
    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
    }

    private setBadge(count: number) {
        const elem = this.querySelector<HTMLElement>('[data-badge]')
        if (elem) {
            elem.dataset.badge = count.toString()
        }
    }

    private render() {
        const slot = document.createElement('slot')

        this.renderRoot.appendChild(this.dateDisplay)
        this.renderRoot.appendChild(slot)
    }

    private createDateDisplay() {
        const elem = document.createElement('date-display') as DateDisplay
        elem.setAttribute('format', 'MMMM YYYY')

        return elem
    }
}

customElements.define('expense-filter', ExpenseFilter)