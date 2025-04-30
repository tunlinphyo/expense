import { ModalDialog } from "../../elements"
import { CategoryForm } from "./category-form"
import { CategoryService } from '../../firebase/categoryService'
import { CategoryType } from "../../types"
import { userSignal } from "../../store/signal"
import { actionSheet, appLoading, appToast } from ".."

export class CategoryModal extends ModalDialog {
    private formEl: CategoryForm

    static get observedAttributes(): string[] {
        return ['data-id']
    }

    constructor() {
        super()
        this.formEl = this.querySelector('category-form')!

        this.onFormInput = this.onFormInput.bind(this)
    }

    attributeChangedCallback(_1: string, _2:string, value: string) {
        this.formEl.setAttribute('id', value)
        this.formEl.removeEventListener('input', this.onFormInput)

        requestAnimationFrame(() => {
            this.formEl.addEventListener('input', this.onFormInput)
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.formEl.removeEventListener('input', this.onFormInput)
    }

    async buttonClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'action') {
            const dirty = this.formEl.getAttribute('dirty')
            if (dirty) {
                try {
                    const data = this.formEl.getFormData()
                    if (data.id) {
                        this.updateCategory(data.id, data)
                    } else {
                        const category: Omit<CategoryType, 'id' | 'order'> = {
                            name: data.name as string,
                            color: data.color as string,
                            icon: data.icon as string,
                        }
                        this.addCateogry(category)
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        if (target.dataset.button === 'delete') {
            actionSheet.openSheet({
                actions: [
                    {
                        buttonText: `Delete Category`,
                        action: () => {
                            const id = this.formEl.getFormData().id
                            this.deleteCategory(id)
                        }
                    },
                ]
            })
        }
    }

    private onFormInput() {
        const formData = this.formEl.data
        const dirty = this.formEl.getAttribute('dirty')
        this.toggleAction(Boolean(dirty && formData.name && formData.color && formData.icon))
    }

    private async addCateogry(category: Omit<CategoryType, 'id' | 'order'>) {
        appLoading.show()
        await CategoryService.addCategory(userSignal.get(), category)
        appLoading.hide()
        this.closeModal()
    }

    private async updateCategory(id: string, category: Partial<Omit<CategoryType, "id">>) {
        appLoading.show()
        await CategoryService.updateCategory(userSignal.get(), id, category)
        appLoading.hide()
        this.closeModal()
    }

    private async deleteCategory(id: string) {
        appLoading.show()
        const result = await CategoryService.deleteCategory(userSignal.get(), id)
        appLoading.hide()
        if (result) {
            appToast.showMessage(result, null, true)
        } else {
            this.closeModal()
        }
    }

    private toggleAction(is: boolean) {
        const actionButton = this.querySelector('button[data-button=action]')
        if (!actionButton) return
        actionButton.toggleAttribute('disabled', !is)
    }
}

customElements.define('category-modal', CategoryModal)