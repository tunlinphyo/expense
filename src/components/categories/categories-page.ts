import { PageDialog } from "../../elements"
import { CategoryList } from "./category-list"

export class CategoriesPage extends PageDialog {
    private listEl: CategoryList
    constructor() {
        super()
        this.listEl = this.querySelector('category-list')!
    }

    connectedCallback() {
        super.connectedCallback()
    }

    buttonClick(e: Event) {
        const target = e.target as HTMLButtonElement
        if (target.dataset.button === 'action') {
            const btnAdd = this.querySelector('#addCateogry')!
            const isSort = target.dataset.sort === 'false'
            target.dataset.sort = isSort ? 'true' : 'false'
            this.listEl.toggleAttribute('sortable', isSort)
            btnAdd.toggleAttribute('disabled', isSort)
        }
    }
}

customElements.define('categories-page', CategoriesPage)