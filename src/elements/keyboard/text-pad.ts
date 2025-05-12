import { resetStyles, textPadStyles } from "./styles"
import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import type { KeyboardContext } from "../../types"
import { CustomInput } from "./input"

export class TextPad extends HTMLElement {
    private consumer: ContextConsumer<KeyboardContext>
    private renderRoot: ShadowRoot
    private capLock: boolean = true

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [resetStyles, textPadStyles]
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)

        this.onClick = this.onClick.bind(this)

        this.render()
    }

    connectedCallback() {
        this.setAttribute('caplock', 'true')
        this.renderRoot.addEventListener('click', this.onClick)

        this.consumer.subscribe((context) => {
            if (context.type === 'text' && context.status === 'open') {
                const focusEl = context.focusElem as CustomInput
                if (focusEl) {
                    this.toggleCapLock(!focusEl.value || focusEl.value.endsWith(' '))
                }
            }
        })

    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
        this.renderRoot.removeEventListener('click', this.onClick)
    }

    private render() {
        const template = document.createElement('template')
        template.innerHTML = `
            <div class="row row--one">
                <button type="button" class="textpad__key" data-key="q">q</button>
                <button type="button" class="textpad__key" data-key="w">w</button>
                <button type="button" class="textpad__key" data-key="e">e</button>
                <button type="button" class="textpad__key" data-key="r">r</button>
                <button type="button" class="textpad__key" data-key="t">t</button>
                <button type="button" class="textpad__key" data-key="y">y</button>
                <button type="button" class="textpad__key" data-key="u">u</button>
                <button type="button" class="textpad__key" data-key="i">i</button>
                <button type="button" class="textpad__key" data-key="o">o</button>
                <button type="button" class="textpad__key" data-key="p">p</button>
            </div>
            <div class="row row--two">
                <button type="button" class="textpad__key" data-key="a">a</button>
                <button type="button" class="textpad__key" data-key="s">s</button>
                <button type="button" class="textpad__key" data-key="d">d</button>
                <button type="button" class="textpad__key" data-key="f">f</button>
                <button type="button" class="textpad__key" data-key="g">g</button>
                <button type="button" class="textpad__key" data-key="h">h</button>
                <button type="button" class="textpad__key" data-key="j">j</button>
                <button type="button" class="textpad__key" data-key="k">k</button>
                <button type="button" class="textpad__key" data-key="l">l</button>
            </div>
            <div class="row row--three">
                <button type="button" class="textpad__key textpad__key--cap" data-key="CAP">
                    <svg-icon name="up" size="18"></svg-icon>
                </button>
                <button type="button" class="textpad__key" data-key="z">z</button>
                <button type="button" class="textpad__key" data-key="x">x</button>
                <button type="button" class="textpad__key" data-key="c">c</button>
                <button type="button" class="textpad__key" data-key="v">v</button>
                <button type="button" class="textpad__key" data-key="b">b</button>
                <button type="button" class="textpad__key" data-key="n">n</button>
                <button type="button" class="textpad__key" data-key="m">m</button>
                <button type="button" class="textpad__key textpad__key--delete" data-key="DELETE">
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