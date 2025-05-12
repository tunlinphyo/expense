import { inputStyles } from "./styles"
import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext, KeyboardType } from "../../types"

export class CustomTextarea extends HTMLElement {
    static styleSheet?: CSSStyleSheet
    private consumer: ContextConsumer<KeyboardContext>
    protected renderRoot: ShadowRoot
    private input: HTMLInputElement
    private fadeInput: HTMLElement
    private index: number = -1
    private endIndex: number = 0

    protected type: KeyboardType = 'text'

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
        this.renderFadeInput(value)
        this.input.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }))
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'closed' })
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)
        this.input = this.createInput()
        this.fadeInput = document.createElement('div')

        this.onFocus = this.onFocus.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && oldValue != newValue && newValue != 'undefined') {
            this.value = newValue
            this.index = newValue.length - 1
        }
    }

    connectedCallback() {
        const ctor = this.constructor as typeof CustomTextarea
        if (ctor.styleSheet) {
            this.renderRoot.adoptedStyleSheets = [inputStyles, ctor.styleSheet]
        } else {
            this.renderRoot.adoptedStyleSheets = [inputStyles]
        }
        this.render()
        this.addEventListener('focus', this.onFocus)
        this.renderRoot.addEventListener('click', this.onClick)

        this.consumer.subscribe((context) => {
            if (context.status === 'open' && context.focusElem === this) {
                this.setAttribute('data-index', String(this.index))
                this.onKey(context.key)
            } else {
                this.removeAttribute('data-index')
            }
        })
    }

    disconnectedCallback() {
        this.removeEventListener('focus', this.onFocus)
        this.renderRoot.removeEventListener('click', this.onClick)
        this.consumer.unsubscribe()
    }

    focus() {
        this.onFocus()
    }

    private onKey(key: string) {
        if (key === 'DELETE') {
            this.index = this.value.length - this.endIndex
            if (this.index < 0) return
            this.value = this.removeAt(this.value, this.index)
        } else if (key) {
            const result = (this as any).verifyValue?.(this.value, key) || false
            if (result) return
            this.index = this.value.length - this.endIndex + 1
            this.value = this.insertAt(this.value, this.index, key)
        }
    }

    private render() {
        this.setAttribute('data-no-dismiss', '')
        this.fadeInput.className = `fade-input ${this.type}`
        this.fadeInput.setAttribute('tabindex', '0')

        const placeholder = this.getAttribute('placeholder') || ''
        this.fadeInput.setAttribute('data-placeholder', placeholder)

        this.appendChild(this.input)
        this.renderRoot.appendChild(this.fadeInput)
    }

    private renderFadeInput(value: string) {
        this.fadeInput.innerHTML = ''

        if (!value.length) this.fadeInput.innerHTML = '<span data-active="true" data-index="0"><span>'

        const activeIndex = Math.max(value.length - this.endIndex, 0)

        value.split('').forEach((char, i) => {
            const span = document.createElement('span')
            span.dataset.character = char === ' ' ? 'SPACE' : char
            span.dataset.index = String(i);
            span.dataset.active = String(i === activeIndex)
            if (char === ' ') span.classList.add('space')
            span.textContent = char
            this.fadeInput.appendChild(span)
        })
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
                type: this.type
            },
            bubbles: true,
            composed: true,
        }))
    }

    onClick(e: Event) {
        const target = e.target as HTMLElement
        this.endIndex = this.getIndex(target)
        console.log(this.endIndex)
        this.renderFadeInput(this.value)
    }

    private insertAt(str: string, index: number, insertStr: string) {
        const insert = insertStr === 'SPACE' ? ' ' : insertStr
        return str.slice(0, index) + insert + str.slice(index)
    }

    private removeAt(str: string, index: number, count: number = 1): string {
        if (str.endsWith('.')) return str.slice(0, index)
        return str.slice(0, index) + str.slice(index + count)
    }

    private getIndex(elem: HTMLElement): number {
        const indexAttr = elem.getAttribute('data-index')
        return indexAttr ? this.value.length - Number(indexAttr) : 1
    }
}

customElements.define('custom-textarea', CustomTextarea)