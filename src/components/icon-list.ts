import { DynamicList } from "../elements"
import { effect } from "../signal"
import { iconsSignal } from "../store/signal"
import { IconType } from "../types"

type IconWithName = {
    id: string
    icon: IconType & { name: string }
}

export class IconList extends DynamicList<IconWithName> {
    private unsubscribe?: () => void

    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
        this.unsubscribe = effect(() => {
            this.renderIcons()
        }, [iconsSignal])
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
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