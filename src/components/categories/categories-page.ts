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
        this.observeOtherElementOpen()
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

    private observeOtherElementOpen() {
        const updateState = () => {
            const isOpen = !!document.querySelector("category-modal[modal-open]")
            if (this.hasAttribute('page-open'))
                this.scaleAnimate(isOpen)
        }

        const observer = new MutationObserver(updateState)

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ["modal-open"]
        })

        updateState()
    }

    private scaleAnimate(isOpen: boolean) {
        const open = { scale: "var(--modal-scale)", opacity: 1, borderRadius: '1.5rem' }
        const base = { scale: 1, opacity: 1, borderRadius: '0' }

        const animation = this.dialog.animate(isOpen ? [base, open] : [open, base], {
            duration: 200,
            easing: 'ease-out',
        })

        animation.finished.then(() => {
            Object.assign(this.dialog.style, isOpen ? open : base)
        })
    }
}

customElements.define('categories-page', CategoriesPage)