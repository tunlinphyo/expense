import { inputStyles } from "./styles"
import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext } from "../../types"

export class CustomInput extends HTMLElement {
    private consumer: ContextConsumer<KeyboardContext>
    protected renderRoot: ShadowRoot
    private input: HTMLInputElement
    private fadeInput: HTMLElement
    private index: number = -1

    static get observedAttributes() {
        return ['value']
    }

    get value() {
        return this.input.value
    }
    set value(data: string) {
        let value = data
        this.input.value = value
        this.fadeInput.setAttribute('data-has-value', Boolean(value.length).toString())
        this.fadeInput.innerHTML = this.getSpanData(value)
        this.input.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }))
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [inputStyles]
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)
        this.input = this.createInput()
        this.fadeInput = document.createElement('div')

        this.onFocus = this.onFocus.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && oldValue != newValue && newValue != 'undefined') {
            this.value = newValue
            this.index = newValue.length - 1
        }
    }

    connectedCallback() {
        this.render()
        this.addEventListener('focus', this.onFocus)

        this.consumer.subscribe((context) => {
            if (context.status === 'open' && context.focusElem === this) {
                this.setAttribute('data-index', String(this.index))
                this.onKey(context.key)
            } else {
                this.removeAttribute('data-index')
            }
        })

        this.watchInputValueChangeByJS(this.input, () => {
            console.log('CHANGE', this.value)
        })
    }

    disconnectCallback() {
        this.removeEventListener('focus', this.onFocus)
        this.consumer.unsubscribe()
    }

    focus() {
        this.onFocus()
    }

    private onKey(key: string) {
        if (key === 'DELETE') {
            this.index = this.value.length - 1
            this.value = this.removeAt(this.value, this.index)
        } else if (key) {
            const result = (this as any).verifyValue?.(this.value, key) || false
            if (result) return
            this.index = this.value.length
            this.value = this.insertAt(this.value, this.index, key)
        }
    }

    private render() {
        // const ctor = this.constructor as typeof MiniEl
        // if (ctor.styles?.length) {
        //     this.renderRoot.adoptedStyleSheets = ctor.styles
        // }
        this.setAttribute('data-no-dismiss', '')
        this.fadeInput.classList.add('fade-input')
        this.fadeInput.setAttribute('tabindex', '0')
        
        const placeholder = this.getAttribute('placeholder') || ''
        this.fadeInput.setAttribute('data-placeholder', placeholder)

        this.appendChild(this.input)
        this.renderRoot.appendChild(this.fadeInput)
    }

    private watchInputValueChangeByJS(input: HTMLInputElement, callback: () => void) {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
        if (!descriptor) return

        const originalSetter = descriptor.set!
        Object.defineProperty(input, 'value', {
            set(newValue) {
                originalSetter.call(this, newValue)
                callback()
            },
            get: descriptor.get,
            configurable: true,
        })
    }

    private getSpanData(data: string) {
        if (!data.length) return '<span></span>'
        return data.split('').map(data => {
            return `<span>${data}</span>`
        }).join('')
    }

    private createInput() {
        const elem = document.createElement('input')
        elem.setAttribute('type', 'hidden') 
        elem.setAttribute('name', this.getAttribute('name') || 'input')

        return elem
    }

    private onFocus() {
        this.dispatchEvent(new CustomEvent('input-focus', {
            detail: {
                target: this,
                value: this.input.value,
                index: 0,
            },
            bubbles: true,
            composed: true,
        }))
    }

    private insertAt(str: string, index: number, insertStr: string) {
        return str.slice(0, index) + insertStr + str.slice(index)
    }

    private removeAt(str: string, index: number, count: number = 1): string {
        if (str.endsWith('.')) return str.slice(0, index)
        return str.slice(0, index) + str.slice(index + count)
    }
}

customElements.define('custom-input', CustomInput)