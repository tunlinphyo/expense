import { CustomInput } from "../../elements"
import type { KeyboardType } from "../../types"

export class TextInput extends CustomInput {
    private readonly MAX_LENGTH = 20
    protected type: KeyboardType = 'text'

    verifyValue(value: string, key: string) {
        return (
            (value.length === this.MAX_LENGTH)
            || ((value.endsWith(' ') || !value) && key === 'SPACE')
        )
    }
}

customElements.define('text-input', TextInput)