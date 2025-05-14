import { CustomInput } from "../../elements"
import type { KeyboardType } from "../../types"

export class NumberInput extends CustomInput {
    private readonly MAX_LENGTH = 6
    protected type: KeyboardType = 'number'

    verifyValue(value: string, key: string) {
        return (
            (value.includes('.') && key === '.')
            || (!value.includes('.') && value.length >= this.MAX_LENGTH && key !== '.')
            || (value.includes('.') && value.split('.')[0].length >= this.MAX_LENGTH)
            || (this.hasCharsAfterDot(value) && this.endIndex < 3)
        )
    }

    private hasCharsAfterDot(str: string, num: number = 2): boolean {
        const pattern = new RegExp(`\\.\\w{${num}}$`);
        return pattern.test(str);
    }
}

customElements.define('number-input', NumberInput)