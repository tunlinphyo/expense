import { DynamicList } from "../../elements"
import { CategoryType } from "../../types"
import { InlineLoading } from "../inline-loading"
import { CategoryService } from "../../firebase/categoryService"
import { effect } from "../../signal"
import { categorySignal, userSignal } from "../../store/signal"
import { html, raw } from "../../utils"
import { EMPTY_CATEGORY } from "../svg"

type CategoryItem = {
    id: string,
    item: CategoryType
}

export class CategoryList extends DynamicList<CategoryItem> {
    private loadingEl: InlineLoading
    private unsubscribe?: () => void

    constructor() {
        super()
        this.loadingEl = document.createElement('inline-loading') as InlineLoading
        this.appendChild(this.loadingEl)
    }

    connectedCallback() {
        super.connectedCallback()

        this.addEventListener('sortchange', (e: Event) => {
            const customE = e as CustomEvent
            const orders = customE.detail.order
                .filter((id: string) => Boolean(id))
                .map((id: string, order: number) => ({ id, order }))
            CategoryService.updateSort(userSignal.get(), orders)
        })

        this.unsubscribe = effect(() => {
            this.renderCategories(categorySignal.get())
        }, [categorySignal])
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
    }

    private async renderCategories(categoryMap: Record<string, CategoryType>) {
        try {
            const categories = Object.values(categoryMap).map((item) => ({ id: item.id, item }))
            this.list = categories
        } finally {
            this.loadingEl.remove()
        }
    }

    protected emptyEl() {
        const container = document.createElement('div')
        container.className = 'empty-container'
        const h4 = document.createElement('h4')
        h4.textContent = 'No category'
        container.appendChild(html`${raw(EMPTY_CATEGORY)}`)
        container.appendChild(h4)

        return container
    }
}

customElements.define('category-list', CategoryList)