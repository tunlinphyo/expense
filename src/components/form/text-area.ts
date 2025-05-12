import { CustomTextarea } from "../../elements"
import type { KeyboardType } from "../../types"
import { css } from "../../utils"

export class TextArea extends CustomTextarea {
    private readonly MAX_LENGTH = 120
    protected type: KeyboardType = 'textarea'

    static styleSheet = css`
        .fade-input {
            --caret-height: 1.5em;
            min-height: 120px;
            display: block;
            font-size: var(--text-base);
            font-weight: normal;
        }
    `

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