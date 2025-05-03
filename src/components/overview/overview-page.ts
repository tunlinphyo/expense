import { ContextProvider } from "../../context"
import { PageDialog } from "../../elements"
import { overviewContext } from "../../store/context"
import { OverviewContext } from "../../types"

export class OverviewPage extends PageDialog {
    private provider: ContextProvider<OverviewContext>

    static get observedAttributes() {
        return ['page-open']
    }

    constructor() {
        super()
        this.provider = new ContextProvider(this, overviewContext, {
            initial: { open: false }
        })
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'page-open' && oldValue != newValue) {
            const open = this.hasAttribute(name)
            this.provider.setValue({ open })
        }
    }
}

customElements.define('overview-page', OverviewPage)