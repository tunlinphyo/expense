import type { CategoryTotal } from "../../types"
import { DynamicList } from "../../elements"
import { html, raw } from "../../utils"
import { EMPTY_GRAPH } from "../svg"

export class OverviewList extends DynamicList<CategoryTotal> {

    protected emptyEl() {
        const container = document.createElement('div')
        container.className = 'empty-container'
        const h4 = document.createElement('h4')
        h4.textContent = 'No data'
        container.appendChild(html`${raw(EMPTY_GRAPH)}`)
        container.appendChild(h4)

        return container
    }
}

customElements.define('overview-list', OverviewList)