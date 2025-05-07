import { BasePrompt } from "../../elements"
import { LocalStorageHandler } from "../../store/storage"

export class ThemePrompt extends BasePrompt {
    connectedCallback() {
        super.connectedCallback()

        const theme = LocalStorageHandler.getStorage<string>(LocalStorageHandler.LS_THEME)
        if (theme)
            document.documentElement.setAttribute('theme', theme)
    }
    protected onClick(e: Event) {
        super.onClick(e)
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            const btn = target.dataset.button || ''
            if (['light', 'dark', 'auto'].includes(btn)) {
                LocalStorageHandler.setStorage(LocalStorageHandler.LS_THEME, btn)
                document.documentElement.setAttribute('theme', btn)
            }
        }
    }
}

customElements.define('theme-prompt', ThemePrompt)