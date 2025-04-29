import { DynamicList } from "../../elements"
import { CategoryType } from "../../types"
import { InlineLoading } from "../inline-loading"
import { CategoryService } from "../../firebase/categoryService"
import { effect } from "../../signal"
import { categorySignal, userSignal } from "../../store/signal"

type CategoryItem = {
    id: string,
    item: CategoryType
}

export class CategoryList extends DynamicList<CategoryItem> {
    private loadingEl: InlineLoading
    private hasLoaded = false
    private unsubscribe?: () => void

    constructor() {
        super()
        this.loadingEl = document.createElement('inline-loading') as InlineLoading
        this.appendChild(this.loadingEl)
    }

    connectedCallback() {
        super.connectedCallback()
        this.loadCategories()

        this.unsubscribe = effect(() => {
            if (this.hasLoaded)
                this.loadCategories()
        }, [userSignal])

        this.addEventListener('sortchange', (e: Event) => {
            const customE = e as CustomEvent
            const orders = customE.detail.order
                .filter((id: string) => Boolean(id))
                .map((id: string, order: number) => ({ id, order }))
            CategoryService.updateSort(userSignal.get(), orders)
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
    }

    private async setCategoriesMap(categores: CategoryType[]) {
        const categoryMap = Object.fromEntries(
            categores.map(doc => {
              const data = doc
              return [data.id, data]
            })
        )
        categorySignal.set(categoryMap)
    }

    private async loadCategories() {
        const id = userSignal.get()
        try {
            const categories = await CategoryService.getAll(id)
            this.list = categories.map(item => ({ id: item.id, item }))
            this.setCategoriesMap(categories)
        } finally {
            this.loadingEl.remove()
        }
        CategoryService.onCategoryChange(id, (categories) => {
            this.list = categories.map(item => ({ id: item.id, item }))
        })
    }
}

customElements.define('category-list', CategoryList)