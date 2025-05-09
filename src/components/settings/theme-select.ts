import { CustomSelect } from "../../elements"
import { LocalStorageHandler } from "../../store/storage"

type Theme = 'light' | 'dark' | 'auto'

export class ThemeSelect extends CustomSelect {
    private mediaQuery: MediaQueryList

    constructor() {
        super()
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        super.attributeChangedCallback(name, oldValue, newValue)
        if (name === 'value' && oldValue !== newValue) {
            LocalStorageHandler.setStorage(LocalStorageHandler.LS_THEME, newValue)
            this.setTheme(newValue as Theme)
        }
    }

    connectedCallback() {
        super.connectedCallback()

        const theme = LocalStorageHandler.getStorage<Theme>(LocalStorageHandler.LS_THEME)
        this.setTheme(theme || 'auto')

        this.mediaQuery.addEventListener('change', this.onMediaChange)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.mediaQuery.removeEventListener('change', this.onMediaChange)
    }

    private onMediaChange(e: MediaQueryListEvent) {
        if (e.matches) this.setMeta('dark')
        else this.setMeta('light')
    }

    private setTheme(theme: Theme) {
        this.setMeta(theme)
        this.setValue(theme)
        document.documentElement.setAttribute('theme', theme)

        this.value = theme
    }

    private setMeta(theme: Theme) {
        const themeColor = document.querySelector<HTMLMetaElement>('#themeColor')
        if (themeColor) {
            let t = theme
            let isDark = this.mediaQuery.matches
            if (theme === 'auto') t = isDark ? 'dark' : 'light'
            themeColor.content = t === 'dark' ? '#000000' : '#dbdbe0'
        }
    }

    private setValue(theme: Theme) {
        const themeValue = document.getElementById('themeValue')
        if (themeValue) {
            themeValue.style.textTransform = 'capitalize'
            themeValue.textContent = theme === 'auto' ? 'device' : theme
        }
    }
}

customElements.define('theme-select', ThemeSelect)