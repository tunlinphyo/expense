import { ContextConsumer, ContextProvider, createContext } from "../../context"
import { updateBindings } from "../../utils/data-bind"
import {
    collectInitialFormData,
    FormDataType,
    parseFormValue,
    resetFormValues,
    setFormValues
} from "./form-utils"

export const formContext = createContext<FormDataType>('form-context')

export class ReactiveForm extends HTMLElement {
    private provider!: ContextProvider<FormDataType>
    private consumer!: ContextConsumer<FormDataType>
    private formData: FormDataType = {}
    private initData: FormDataType = {}

    private boundOnInput = this._onInput.bind(this)
    private boundOnClick = this._onClick.bind(this)
    private boundOnKeydown = this._onKeydown.bind(this)

    get dirty(): boolean {
        return !this._isEqual(this.formData, this.initData)
    }

    get data() {
        return this.formData
    }
    set data(formData: FormDataType) {
        // updateBindings(this, formData, this.formData)
        this.initData = { ...formData }
        this.formData = { ...formData }
        this.provider.setValue(formData)
        setFormValues(this, this.initData)
    }

    getInitData() {
        return this.initData
    }

    setFormData(formData: FormDataType) {
        this.data = formData
    }

    getFormData(): FormDataType {
        return this.formData
    }

    submit(): void {
        const event = new Event('submit', { bubbles: true, cancelable: true })
        this.dispatchEvent(event)
    }

    reset() {
        const event = new Event('reset', { bubbles: true, cancelable: true })
        if (this.dispatchEvent(event)) {
            this.data = this.initData
        }
    }

    clear() {
        this.initData = {}
        this.formData = {}
        this.provider.setValue(this.formData)
        resetFormValues(this)
    }

    connectedCallback(): void {
        this.setAttribute('role', 'form') // for accessibility
        this.setAttribute('aria-labelledby', this.getAttribute('aria-labelledby') || '')
        // this.tabIndex = 0

        this.formData = collectInitialFormData(this)
        this.initData = { ...this.formData }

        this.provider = new ContextProvider(this, formContext, {
            initial: this.formData
        })

        this.consumer = new ContextConsumer(this, formContext)
        this.consumer.subscribe((form, oldForm) => {
            updateBindings(this, form, oldForm)
            setFormValues(this, form)
            this._updateDirtyAttribute()
        })

        this.addEventListener('input', this.boundOnInput, true)
        // this.addEventListener('change', this.boundOnInput, true)
        this.addEventListener('click', this.boundOnClick, true)
        this.addEventListener('keydown', this.boundOnKeydown, true)
    }

    disconnectedCallback() {
        this.removeEventListener('input', this.boundOnInput, true)
        // this.removeEventListener('change', this.boundOnInput, true)
        this.removeEventListener('click', this.boundOnClick, true)
        this.removeEventListener('keydown', this.boundOnKeydown, true)

        this.consumer.unsubscribe()
    }

    protected updateFormdata(formData: FormDataType) {
        this.formData = { ...this.formData, ...formData }
        this.provider.setValue(this.formData)
    }

    private _onInput(e: Event): void {
        const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        const name = el.name
        if (!name) return

        const value = parseFormValue(el)
        if (value === null) return

        const formObj: FormDataType = {}
        formObj[name] = value
        if (el.dataset.sync) {
            const keys = el.dataset.sync.split(':')
            for(const key of keys) {
                formObj[key] = el.dataset[key] || ''
            }
        }
        this.formData = { ...this.formData, ...formObj }
        this.provider.setValue(this.formData)
    }

    private _onClick(e: MouseEvent): void {
        const target = e.target as HTMLElement
        if (target instanceof HTMLButtonElement) {
            if (target.type === 'submit') {
                this.submit()
            } else if (target.type === 'reset') {
                this.reset()
            }
        }
    }

    private _onKeydown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            const active = document.activeElement as HTMLElement
            if (active?.tagName === 'TEXTAREA') return // ignore multiline
            if (this.contains(active)) {
                this.submit()
            }
        }
    }

    private _updateDirtyAttribute(): void {
        const isDirty = this.dirty
        if (isDirty) {
          this.setAttribute('dirty', 'true')
        } else {
          this.removeAttribute('dirty')
        }
    }

    private _isEqual(a: FormDataType, b: FormDataType): boolean {
        const aKeys = Object.keys(a)
        const bKeys = Object.keys(b)
        if (aKeys.length !== bKeys.length) return false

        return aKeys.every(key => {
            const aVal = a[key]
            const bVal = b[key]
            if (Array.isArray(aVal) && Array.isArray(bVal)) {
                return aVal.length === bVal.length && aVal.every((v, i) => v === bVal[i])
            }
            return aVal === bVal
        })
    }
}

customElements.define('reactive-form', ReactiveForm)