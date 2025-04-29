import { ContextConsumer } from "../../context"
import { DateDisplay } from "../../elements"
import { expenseContext } from "../../store/context"
import { ExpenseContext } from "../../types"
import { css } from "../../utils"

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
            console.log('ExpenseFilter', value, oldValue)
            const dateString = new Date(value.year, value.month, 1).toISOString()
            this.dateDisplay.setAttribute('value', dateString)
        })
    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
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