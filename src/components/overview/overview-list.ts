import type { CategoryTotal } from "../../types"
import { DynamicList } from "../../elements"

export class OverviewList extends DynamicList<CategoryTotal> {

}

customElements.define('overview-list', OverviewList)