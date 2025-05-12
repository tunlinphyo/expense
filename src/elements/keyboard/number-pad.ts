import { ContextConsumer } from "../../context"
import { keyboardContext } from "../../store/context"
import { KeyboardContext } from "../../types"
import { deepEqual } from "../../utils"
import { numberPadStyles } from "./styles"


export class NumberPad extends HTMLElement {
    private consumer: ContextConsumer<KeyboardContext>
    private renderRoot: ShadowRoot

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [numberPadStyles]
        this.consumer = new ContextConsumer<KeyboardContext>(this, keyboardContext)

        this.onClick = this.onClick.bind(this)

        this.render()
    }

    async connectedCallback() {
        this.renderRoot.addEventListener('click', this.onClick)
        this.consumer.unsubscribe()
        this.consumer.subscribe((context, oldContext) => {
            if (deepEqual(context, oldContext)) return
            // console.log('NUMBER_CONTEXT', context, oldContext)
            if (context.type === 'number') {
                this.setAttribute('nubmerpad', 'true')
            }
            else {
                this.setAttribute('nubmerpad', 'false')
            }
        })
    }

    disconnextedCallback() {
        console.log('NUMBERPAD_DISCONNECTED')
        this.consumer.unsubscribe()
        this.renderRoot.removeEventListener('click', this.onClick)
    }

    private render() {
        const template = document.createElement('template')
        template.innerHTML = `
            <button type="button" class="numberpad__key" data-key="1">1</button>
            <button type="button" class="numberpad__key" data-key="2">2</button>
            <button type="button" class="numberpad__key" data-key="3">3</button>
            <button type="button" class="numberpad__key" data-key="4">4</button>
            <button type="button" class="numberpad__key" data-key="5">5</button>
            <button type="button" class="numberpad__key" data-key="6">6</button>
            <button type="button" class="numberpad__key" data-key="7">7</button>
            <button type="button" class="numberpad__key" data-key="8">8</button>
            <button type="button" class="numberpad__key" data-key="9">9</button>
            <button class="numberpad__key numberpad__key--clear" data-key=".">.</button>
            <button class="numberpad__key" data-key="0">0</button>
            <button class="numberpad__key numberpad__key--clear" data-key="DELETE">
                <svg-icon name="delete-key" size="24"></svg-icon>
            </button>
        `
        this.renderRoot.appendChild(template.content.cloneNode(true))
    }
    
    private onClick(e: Event) {
        const target = e.target as HTMLButtonElement
        if (target.hasAttribute('data-key')) {
            const key = target.dataset.key
            if (key) {
                this.dispatchEvent(new CustomEvent('key-press', {
                    detail: key,
                    bubbles: true,
                    composed: true,
                }))
            }
        }
    }
}

customElements.define('number-pad', NumberPad)