import { ContextProvider } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext } from "../../types"
import { resetStyles } from "./styles"
import { NumberPad } from "./number-pad"
import { TextPad } from "./text-pad"

import './number-pad'
import './text-pad'

export class Keyboard extends HTMLElement {
    protected renderRoot: ShadowRoot
    private provider: ContextProvider<KeyboardContext>
    private popoverEl: HTMLDialogElement
    private numberPad: NumberPad
    private textPad: TextPad
    private observer?: IntersectionObserver
    private isIntersecting: boolean = false

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [resetStyles]
        this.popoverEl = document.createElement('dialog')
        this.numberPad = document.createElement('number-pad') as NumberPad
        this.textPad = document.createElement('text-pad') as TextPad
        this.provider = new ContextProvider<KeyboardContext>(this, keyboardContext, {
            initial: {
                type: 'number',
                focusElem: null,
                status: 'closed',
                key: "",
            }
        })

        this.onKeyPress = this.onKeyPress.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onDocumentClick = this.onDocumentClick.bind(this)
    }

    open(type: 'number' | 'text', focusElem: HTMLElement) {
        this.toggleAttribute('open', true)
        this.provider.setValue({
            ...this.provider.value,
            type,
            focusElem,
            status: 'open',
            key: "",
        })
        this.popoverEl.addEventListener('key-press', this.onKeyPress)

        this.textPad.setAttribute('current-type', type)
        this.numberPad.setAttribute('current-type', type)

        // const elem = focusElem.parentElement?.closest('[modal-open]') as ModalDialog
        // if (elem) {
        //     elem.host.appendChild(this.popoverEl)
        // } else {
        //     document.body.appendChild(this.popoverEl)
        // }
        requestAnimationFrame(() => {
            // this.popoverEl.showPopover()
            this.popoverEl.showModal()
        })
    }

    close() {
        // this.popoverEl.hidePopover()
        this.popoverEl.close()
        this.onDialogHided()
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
        const footer = document.createElement('footer')
        const buttonEl = this.createButton()

        footer.appendChild(buttonEl)

        // this.popoverEl.setAttribute('popover', 'manual')
        this.popoverEl.appendChild(this.textPad)
        this.popoverEl.appendChild(this.numberPad)
        this.popoverEl.appendChild(footer)
        this.popoverEl.id = 'virtualKeyboard'
        this.renderRoot.appendChild(this.popoverEl)
        this.renderRoot.appendChild(slot)
    }

    private createButton() {
        const elem = document.createElement('button')
        elem.type = 'button'
        elem.dataset.button = 'done'
        elem.setAttribute('data-icon-button', '')

        elem.addEventListener('click', () => {
            this.close()
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
            status: 'closed',
            key: "",
        })
        // this.popoverEl.remove()
    }

    private onKeyPress(e: Event) {
        const customE = e as CustomEvent
        const key = customE.detail
        this.provider.setValue({ ...this.provider.value, key })
    }

    private onFocus(e: Event) {
        const customE = e as CustomEvent
        const detail = customE.detail
        if (this.provider.value.status === 'open') return
        this.open(detail.type, detail.target)
    }

    private onDocumentClick(e: Event) {
        return
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
                this.close()
            }
        }
    }
}