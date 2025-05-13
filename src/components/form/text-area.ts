import { CustomTextarea } from "../../elements"
import type { KeyboardType } from "../../types"

export class TextArea extends CustomTextarea {
    private readonly MAX_LENGTH = 120
    protected type: KeyboardType = 'textarea'

    connectedCallback() {
        super.connectedCallback()
    }

    focus() {
        super.focus()
        this.style.marginBottom = '50vh'
        this.scrollIntoView()
    }

    verifyValue(value: string, key: string) {
        return (
            (value.length === this.MAX_LENGTH)
            || ((value.endsWith(' ') || !value) && key === 'SPACE')
        )
    }
}

customElements.define('text-area', TextArea)