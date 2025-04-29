import { ActionDialog, DynamicList } from '../elements'
import { v4 as uuidv4 } from "uuid"

export type Action = {
    buttonText: string
    action: () => Promise<void> | void
}

export type ActionConfig = {
    title?: string
    actions: Action[]
    cancelText?: string
}

type ActionItem = {
    id: string
    button: string
    buttonText: string
}

export class ActionSheet extends ActionDialog {
    private headerEl: HTMLElement | null
    private cancelBtn: HTMLButtonElement | null
    private dynamicList: DynamicList<ActionItem> | null

    private actions: Map<string, () => void> = new Map()

    constructor() {
        super()
        this.headerEl = this.querySelector('header')
        this.cancelBtn = this.querySelector('button[data-button=close]')
        this.dynamicList = this.querySelector<DynamicList<ActionItem>>('dynamic-list')
    }

    openSheet(config: ActionConfig) {
        if (this.headerEl) 
            this.headerEl.textContent = config.title || 'You can not undo this action'

        if (this.cancelBtn)
            this.cancelBtn.textContent = config.cancelText || 'Close'

        if (this.dynamicList) {
            this.actions.clear()

            const list = config.actions.map(item => {
                const id = uuidv4()
                this.actions.set(id, item.action)
                return {
                    id: id,
                    button: id,
                    buttonText: item.buttonText
                }
            })

            this.dynamicList.list = list
        }

        this.openModal()
    }

    async buttonClick(e: Event) {
        const target = e.target as HTMLElement
        const id = target.dataset.button || ''
        const action = this.actions.get(id)
        await action?.()
        this.closeModal()
    }
}

customElements.define('action-sheet', ActionSheet)