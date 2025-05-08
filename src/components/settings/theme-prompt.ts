import { BasePrompt } from "../../elements"
import { LocalStorageHandler } from "../../store/storage"

type Theme = 'light' | 'dark' | 'auto'

export class ThemePrompt extends BasePrompt {
    private fieldsetEl: HTMLFieldSetElement | null
    private mediaQuery: MediaQueryList

    constructor() {
        super()
        this.fieldsetEl = this.querySelector('fieldset')
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        this.onRadioChange = this.onRadioChange.bind(this)
        this.onMediaChange = this.onMediaChange.bind(this)
    }

    connectedCallback() {
        super.connectedCallback()

        const theme = LocalStorageHandler.getStorage<Theme>(LocalStorageHandler.LS_THEME)
        this.setTheme(theme || 'auto')

        this.mediaQuery.addEventListener('change', this.onMediaChange)
        this.fieldsetEl?.addEventListener('change', this.onRadioChange)
    }

    disconnectedCallback() {
        this.mediaQuery.removeEventListener('change', this.onMediaChange)
        this.fieldsetEl?.removeEventListener('change', this.onRadioChange)
    }

    private onRadioChange(e: Event) {
        const target = e.target as HTMLInputElement
        const theme = target.value as Theme
        LocalStorageHandler.setStorage(LocalStorageHandler.LS_THEME, theme)
        this.setTheme(theme)
    }

    private onMediaChange(e: MediaQueryListEvent) {
        if (e.matches) this.setMeta('dark')
        else this.setMeta('light')
    }

    private setTheme(theme: Theme) {
        this.setMeta(theme)
        this.setValue(theme)
        document.documentElement.setAttribute('theme', theme)

        const radio = this.fieldsetEl?.querySelector<HTMLInputElement>(`input[value=${theme}]`)
        if (radio) radio.checked = true
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

customElements.define('theme-prompt', ThemePrompt)