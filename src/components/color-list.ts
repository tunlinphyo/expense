import { DynamicList } from "../elements"
import { ColorService } from "../firebase/colorService"
import { colorsSignal } from "../store/signal"
import { ColorType } from "../types"

type ColorItem = {
    id: string
    color: ColorType
}

export class ColorList extends DynamicList<ColorItem> {
    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
                    this.loadColors()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
    }

    private async loadColors() {
        const colors = await ColorService.getAllColors()
        colorsSignal.set(colors)
        this.renderColors()
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