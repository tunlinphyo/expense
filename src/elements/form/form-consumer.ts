import { ContextConsumer } from "../../context"
import { updateBindings } from "../../utils/data-bind"
import { FormDataType } from "./form-utils"
import { formContext } from "./reactive-form"

export class FormConsumer extends HTMLElement {
    private renderRoot: ShadowRoot
    private consumer!: ContextConsumer<FormDataType>

    constructor() {
        super()
        this.renderRoot = this.attachShadow({ mode: 'open' })
        this.renderRoot.innerHTML = `<slot></slot>`
    }

    connectedCallback() {
        this.consumer = new ContextConsumer(this, formContext)
        this.consumer.subscribe((form, oldForm) => {
            console.log('BINDING', form, oldForm)
            updateBindings(this, form, oldForm)
        })
    }

    disconnectedCallback() {
        this.consumer.unsubscribe()
    }
}

customElements.define('form-consumer', FormConsumer)