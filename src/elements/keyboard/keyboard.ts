import { ContextProvider } from "../../context"
import { keyboardContext } from "../../store/context"
import { KeyboardContext } from "../../types"
import { keyboardStyles } from "./styles"

import './number-pad'
import { html } from "../../utils"

export class Keyboard extends HTMLElement {
    protected renderRoot: ShadowRoot
    private provider: ContextProvider<KeyboardContext>
    private popoverEl: HTMLDialogElement
    private observer?: IntersectionObserver
    private isIntersecting: boolean = false

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [keyboardStyles]
        this.popoverEl = document.createElement('dialog')
        this.provider = new ContextProvider<KeyboardContext>(this, keyboardContext, {
            initial: {
                type: 'number',
                focusElem: null,
                focusIndex: -1,
                status: 'closed',
                key: "",
            }
        })

        this.onKeyPress = this.onKeyPress.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onDocumentClick = this.onDocumentClick.bind(this)
    }

    open(type: 'number' | 'text', focusElem: HTMLElement, focusIndex: number) {
        this.toggleAttribute('open', true)
        this.provider.setValue({
            ...this.provider.value,
            type,
            focusElem,
            focusIndex,
            status: 'open',
            key: "",
        })
        this.popoverEl.addEventListener('key-press', this.onKeyPress)
        
        focusElem.parentNode?.appendChild(this.popoverEl)
        requestAnimationFrame(() => {
            this.popoverEl.showPopover()
        })
    }

    close() {
        this.popoverEl.hidePopover()
    }

    connectedCallback() {
        this.render()
        this.addEventListener('input-focus', this.onFocus)
        this.observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {

                    if (!entry.isIntersecting) {
                        this.onDialogHided()
                    }
                    this.isIntersecting = entry.isIntersecting
                }
            },
            {
                root: null,
                threshold: 0.01
            }
          )
          
        this.observer.observe(this.popoverEl)
        document.addEventListener('click', this.onDocumentClick)
    }

    disconnectedCallback() {
        this.popoverEl.removeEventListener('key-press', this.onKeyPress)
        this.removeEventListener('input-focus', this.onFocus)
        document.removeEventListener('click', this.onDocumentClick)
        this.observer?.disconnect()
    }

    private render() {
        const slot = document.createElement('slot')
        const numberPad = document.createElement('number-pad')
        const footer = document.createElement('footer')
        const buttonEl = this.createButton()

        footer.appendChild(buttonEl)

        this.popoverEl.setAttribute('popover', 'manual')
        this.popoverEl.appendChild(numberPad)
        this.popoverEl.appendChild(footer)
        this.popoverEl.id = 'virtualKeyboard'
        this.renderRoot.appendChild(slot)
    }

    private createButton() {
        const elem = document.createElement('button')
        elem.type = 'button'
        elem.dataset.button = 'done'
        elem.setAttribute('data-icon-button', '')

        elem.addEventListener('click', () => {
            console.log('ON_CLICK')
            this.popoverEl.hidePopover()
        })

        elem.innerHTML = '<svg-icon name="close" size="14"></svg-icon>'
        return elem
    }

    private onDialogHided() {
        this.toggleAttribute('open', false)
        this.popoverEl.removeEventListener('key-press', this.onKeyPress)
        this.provider.setValue({ 
            ...this.provider.value, 
            focusElem: null,
            focusIndex: -1,
            status: 'closed',
            key: "",
        })
        this.popoverEl.remove()
    }

    private onKeyPress(e: Event) {
        const customE = e as CustomEvent
        const key = customE.detail
        this.provider.setValue({ ...this.provider.value, key })
    }

    private onFocus(e: Event) {
        const customE = e as CustomEvent
        const detail = customE.detail
        console.log('ON_FOCUS', detail)
        if (this.provider.value.status === 'open') return
        this.open('number', detail.target, detail.index)
    }

    private onDocumentClick(e: Event) {
        const path = e.composedPath()
        const blockDismissSelector = '[data-no-dismiss]'

        // If popoverEl is open and click was outside popoverEl
        if (this.isIntersecting) {
            if (path[0] === this.popoverEl) return
            const clickedInsidePopover = path.includes(this.popoverEl)
            const clickedInsideNoDismiss = path.some(el => 
                el instanceof HTMLElement && el.matches?.(blockDismissSelector)
            )

            if (!(clickedInsidePopover || clickedInsideNoDismiss)) {
                this.popoverEl.hidePopover()    
            }
        }
    }
}