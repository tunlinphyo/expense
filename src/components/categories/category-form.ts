import { ReactiveForm } from "../../elements"
import { CategoryService } from "../../firebase/categoryService"
import { userSignal } from "../../store/signal"
import { CategoryType } from "../../types"
import { wait } from "../../utils"

type FormCateogry = Omit<CategoryType, 'order'>

export class CategoryForm extends ReactiveForm {
    private defaultData: FormCateogry = {
        id: '',
        name: '',
        color: 'blue',
        icon: 'list',
    }

    static get observedAttributes(): string[] {
        return ['id']
    }

    constructor() {
        super()
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

    private async setCategory(id: string) {
        this.setAttribute('data-loading', '')
        const category = await CategoryService.getCategory(userSignal.get(), id)
        await wait()
        if (category)
                this.setFormData(category)
        this.removeAttribute('data-loading')
    }

    private childrenSettled(callback: () => void) {
        requestAnimationFrame(callback)
    }
}

customElements.define('category-form', CategoryForm)