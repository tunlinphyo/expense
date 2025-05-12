import { resetStyles, textPadStyles } from "./styles"
import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext } from "../../types"
import { CustomInput } from "./input"

export class TextPad extends HTMLElement {
    private consumer: ContextConsumer<KeyboardContext>
    private renderRoot: ShadowRoot
    private capLock: boolean = true
    private textDisplay: HTMLElement
    private currentText: string = ''

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [resetStyles, textPadStyles]
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)
        this.textDisplay = document.createElement('div')
        this.textDisplay.className = 'textDisplay'

        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.setAttribute('caplock', this.capLock.toString())
        this.renderRoot.addEventListener('pointerdown', this.onClick)

        // this.type = this.getAttribute('current-type') || ''
        this.currentText = ''

        this.consumer.subscribe((context) => {
            if (context.status === 'open') {
                if (context.type === 'text') {
                    const focusEl = context.focusElem as CustomInput
                    if (focusEl) {
                        this.toggleCapLock(!focusEl.value || focusEl.value.endsWith(' '))
                    }
                }
                if (context.type === 'textarea') {
                    const focusEl = context.focusElem as CustomInput
                    if (focusEl) {
                        this.toggleCapLock(!focusEl.value)
                    }
                }
            } else {
                this.currentText = ''
                this.textDisplay.textContent = this.currentText
            }
        })

    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
        this.renderRoot.removeEventListener('pointerdown', this.onClick)
    }

    private render() {
        const template = document.createElement('template')
        template.innerHTML = `
            <div class="row row--one">
                <button type="button" class="textpad__key" data-popup data-key="q">q</button>
                <button type="button" class="textpad__key" data-popup data-key="w">w</button>
                <button type="button" class="textpad__key" data-popup data-key="e">e</button>
                <button type="button" class="textpad__key" data-popup data-key="r">r</button>
                <button type="button" class="textpad__key" data-popup data-key="t">t</button>
                <button type="button" class="textpad__key" data-popup data-key="y">y</button>
                <button type="button" class="textpad__key" data-popup data-key="u">u</button>
                <button type="button" class="textpad__key" data-popup data-key="i">i</button>
                <button type="button" class="textpad__key" data-popup data-key="o">o</button>
                <button type="button" class="textpad__key" data-popup data-key="p">p</button>
            </div>
            <div class="row row--two">
                <button type="button" class="textpad__key" data-popup data-key="a">a</button>
                <button type="button" class="textpad__key" data-popup data-key="s">s</button>
                <button type="button" class="textpad__key" data-popup data-key="d">d</button>
                <button type="button" class="textpad__key" data-popup data-key="f">f</button>
                <button type="button" class="textpad__key" data-popup data-key="g">g</button>
                <button type="button" class="textpad__key" data-popup data-key="h">h</button>
                <button type="button" class="textpad__key" data-popup data-key="j">j</button>
                <button type="button" class="textpad__key" data-popup data-key="k">k</button>
                <button type="button" class="textpad__key" data-popup data-key="l">l</button>
            </div>
            <div class="row row--three">
                <button type="button" class="textpad__key textpad__key--cap" data-popup data-key="CAP">
                    <svg-icon name="up" size="18"></svg-icon>
                </button>
                <button type="button" class="textpad__key" data-popup data-key="z">z</button>
                <button type="button" class="textpad__key" data-popup data-key="x">x</button>
                <button type="button" class="textpad__key" data-popup data-key="c">c</button>
                <button type="button" class="textpad__key" data-popup data-key="v">v</button>
                <button type="button" class="textpad__key" data-popup data-key="b">b</button>
                <button type="button" class="textpad__key" data-popup data-key="n">n</button>
                <button type="button" class="textpad__key" data-popup data-key="m">m</button>
                <button type="button" class="textpad__key textpad__key--delete" data-popup data-key="DELETE">
                    <svg-icon name="delete-key" size="20"></svg-icon>
                </button>
            </div>
            <div class="row row--four">
                <div></div>
                <button type="button" class="textpad__key" data-key="#">#</button>
                <button type="button" class="textpad__key" data-key="SPACE"></button>
                <button type="button" class="textpad__key" data-key="&">&</button>
                <div></div>
            </div>
        `
        this.renderRoot.appendChild(this.textDisplay)
        this.renderRoot.appendChild(template.content.cloneNode(true))
    }

    private onClick(e: Event) {
        const target = e.target as HTMLButtonElement
        if (target.hasAttribute('data-key')) {
            const key = target.dataset.key
            if (key === 'CAP') {
                this.toggleCapLock()
            } else if (key) {
                let keyString = key
                if (this.capLock) {
                    this.toggleCapLock()
                    keyString = key.toUpperCase()
                }

                if (key === 'SPACE') this.currentText = ''
                else if (key === 'DELETE') this.currentText = this.currentText.slice(0, -1)
                else this.currentText += keyString

                this.textDisplay.textContent = this.currentText
                this.dispatchEvent(new CustomEvent('key-press', {
                    detail: keyString,
                    bubbles: true,
                    composed: true,
                }))
            }
        }
    }

    private toggleCapLock(status?: boolean) {
        this.capLock = status !== undefined ? status : !this.capLock
        this.setAttribute('caplock', this.capLock.toString())
    }
 }

customElements.define('text-pad', TextPad)