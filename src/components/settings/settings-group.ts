import { appToast } from ".."
import { LocalBiometricAuth } from "../../utils/biometric"
import { CustomToggle } from "./custom-toggle"


export class SettingsGroup extends HTMLElement {
    private readonly SHOWN_PROMPT = 'shownPrompt'
    private installPrompt: HTMLElement | null
    private observer?: IntersectionObserver

    constructor() {
        super()
        this.installPrompt = document.getElementById('installPrompt')
        this.onClick = this.onClick.bind(this)
    }

    connectedCallback() {
        if (!LocalBiometricAuth.isAvailable()) {
            const elem = this.querySelector('#biometricToggle')
            elem?.remove()
        } else {
            const elem = this.querySelector('#biometricToggle custom-toggle')
            const value = LocalBiometricAuth.isEnabled()
            elem?.setAttribute('value', value ? 'on' : 'off')
        }

        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.showStatus()
                    this.observer?.disconnect()
                }
            }
        }, {
            threshold: 0.5,
        })

        this.observer.observe(this)

        if (this.isInStandaloneMode() || !this.isMobile())
            this.removeButton()

        this.addEventListener('click', this.onClick)
    }

    disconnectedCallback() {
        this.observer?.disconnect()
        this.removeEventListener('click', this.onClick)
    }

    private showStatus() {
        const status = this.getLocalStatus()
        if (!status) {
            this.installPrompt?.setAttribute('ready', '')
            // this.setLocalStatus('done')
        }
    }

    private removeButton() {
        const elem = this.querySelector('#installHelp')
        elem?.remove()
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === 'install-prompt')
            this.installPrompt?.setAttribute('show', '')
        if (target.dataset.button === 'toggle') {
            const toogelEl = target.querySelector<CustomToggle>('custom-toggle')
            if (toogelEl) {
                const value = toogelEl.getAttribute('value') || 'off'
                const status = value === 'on' ? 'off' : 'on'
                this.toggleBiometric(toogelEl, status)
            }
        }
    }

    protected setLocalStatus(status: string) {
        localStorage.setItem(this.SHOWN_PROMPT, status)
    }

    private getLocalStatus(): string | null {
        return localStorage.getItem(this.SHOWN_PROMPT)
    }

    private isMobile() {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
        const isAndroid = /android/i.test(navigator.userAgent)

        return (isIOS && isSafari) || isAndroid
    }

    private isInStandaloneMode(): boolean {
        return (
            (window.navigator as any).standalone === true || // ✅ iOS Safari
            window.matchMedia?.('(display-mode: standalone)').matches // ✅ Other platforms
        )
    }

    private async toggleBiometric(toogelEl: HTMLElement, status: 'on' | 'off') {
        if (status === 'on') {
            if (LocalBiometricAuth.isRegistered()) {
                toogelEl.setAttribute('value', status)
            } else {
                try {
                    await LocalBiometricAuth.register()
                    LocalBiometricAuth.setBiometric(true)
                    toogelEl.setAttribute('value', status)
                } catch(e) {
                    appToast.showMessage('Register error', null, true)
                }
            }
        } else {
            LocalBiometricAuth.unregister()
            LocalBiometricAuth.setBiometric(false)
            toogelEl.setAttribute('value', status)
        }
    }
}

customElements.define('settings-group', SettingsGroup)