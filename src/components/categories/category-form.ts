import { ReactiveForm } from "../../elements"
import { CategoryService } from "../../firebase/categoryService"
import { userSignal } from "../../store/signal"
import { CategoryType } from "../../types"

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

    attributeChangedCallback(name: string, _:string, newValue: string) {
        if (name === 'id') {
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
        const category = await CategoryService.getCategory(userSignal.get(), id)
        if (category)
                this.setFormData(category)
    }

    private childrenSettled(callback: () => void) {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback)
        })
    }
}

customElements.define('category-form', CategoryForm)