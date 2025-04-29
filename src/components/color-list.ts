import { DynamicList } from "../elements"
import { effect } from "../signal"
import { colorsSignal } from "../store/signal"
import { ColorType } from "../types"

type ColorItem = {
    id: string
    color: ColorType
}

export class ColorList extends DynamicList<ColorItem> {
    private unsubscribe?: () => void

    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
        this.unsubscribe = effect(() => {
            this.renderColors()
        }, [colorsSignal])
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
    }

    private renderColors() {
        const colors = colorsSignal.get().map(item => ({
            id: item.id,
            color: item
        }))
        this.list = colors
    }
}

customElements.define('color-list', ColorList)