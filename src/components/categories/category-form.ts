import { appToast } from ".."
import { ReactiveForm } from "../../elements"
import { CategoryService } from "../../firebase/categoryService"
import { userSignal } from "../../store/signal"
import { CategoryType } from "../../types"
import { allSettles, wait } from "../../utils"
import { CategoryModal } from "./category-modal"

type FormCateogry = Omit<CategoryType, 'order'>

export class CategoryForm extends ReactiveForm {
    private defaultData: FormCateogry = {
        id: '',
        name: '',
        color: 'blue',
        icon: 'list',
    }
    private unsubscribe?: () => void

    static get observedAttributes(): string[] {
        return ['id']
    }

    constructor() {
        super()
    }

    clear() {
        if (!this.data.id) 
            this.data = this.defaultData
        else 
            this.data = this.getFormData()
    }

    attributeChangedCallback(name: string, oldValue:string, newValue: string) {
        if (name === 'id') {
            if (newValue === oldValue) return
            this.childrenSettled(() => {
                if (!newValue) {
                        this.setFormData(this.defaultData)
                } else {
                    this.setCategory(newValue)
                }
            })
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.unsubscribe = CategoryService.onCategoryChange(userSignal.get(), ({type, id}) => {
            const currId = this.getAttribute('id')
            if (currId === id) {
                if (type === 'removed') {
                    const elem = this.closest('category-modal') as CategoryModal | null
                    if (elem) {
                        elem.closeModal()
                        appToast.showMessage('Category deleted', null, true)
                    }
                }
                if (type === 'modified') {
                    this.setCategory(id, true)
                }
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
    }

    private async setCategory(id: string, isSilent: boolean = false) {
        if (!isSilent) this.setAttribute('data-loading', '')
        const promises = [
            CategoryService.getCategory(userSignal.get(), id),
            wait()
        ]
        const success = await allSettles<CategoryType>(promises, (category) => {
            this.setFormData(category)
        })
        if (!success) {
            appToast.showMessage('Error occur', null, true)
            this.setFormData(this.defaultData)
        }
        if (!isSilent) this.removeAttribute('data-loading')
    }

    private childrenSettled(callback: () => void) {
        requestAnimationFrame(callback)
    }
}

customElements.define('category-form', CategoryForm)