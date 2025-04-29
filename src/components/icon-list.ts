import { DynamicList } from "../elements"
import { IconService } from "../firebase/iconService"
import { iconsSignal } from "../store/signal"
import { IconType } from "../types"

type IconWithName = {
    id: string
    icon: IconType & { name: string }
}

export class IconList extends DynamicList<IconWithName> {
    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
                    this.loadIcons()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
    }

    private async loadIcons() {
        const icons = await IconService.getAllIcons()
        iconsSignal.set(icons)
        this.renderIcons()
    }

    private renderIcons() {
        const icons = iconsSignal.get()
        this.list = icons.map(item => ({
            id: item.id,
            icon: {
                ...item,
                name: item.id.replace(/-/g, ' ')
            }
        }))
    }
}

customElements.define('icon-list', IconList)