import { CustomInput } from "../../elements"

export class NumberInput extends CustomInput {
    private readonly MAX_LENGTH = 6

    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
        console.log('NUMBER_INPUT_CONNECTED')
    }

    disconnectCallback(): void {
        super.disconnectCallback()
    }

    verifyValue(value: string, key: string) {
        return (
            (value.includes('.') && key === '.')
            || (!value.includes('.') && value.length === this.MAX_LENGTH && key !== '.')
            || (this.hasCharsAfterDot(value))
        )
    }

    private hasCharsAfterDot(str: string, num: number = 2): boolean {
        const pattern = new RegExp(`\\.\\w{${num}}$`);
        return pattern.test(str);
    }
}

customElements.define('number-input', NumberInput)