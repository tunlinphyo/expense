import { appToast } from ".";
import { css } from "../utils"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const hostStyle = css`
    :host {
        translate: -50% 110%;

        transition-behavior: allow-discrete;
        transition-duration: .3s;
        transition-timing-function: ease;
        transform: translateZ(0);


        @starting-style {
            translate: -50% 50%;
        }
    }

    :host(:popover-open) {
        translate: -50% 0%;

        @starting-style {
            translate: -50% 50%;
        }
    }
`

class InstallPrompt extends HTMLElement {
    private renderRoot: ShadowRoot
    private deferredPrompt: BeforeInstallPromptEvent | null = null

    static get observedAttributes() {
        return ['ready', 'show']
    }

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'open'})
        this.renderRoot.adoptedStyleSheets = [hostStyle]

        this.onClick = this.onClick.bind(this)
    }

    attributeChangedCallback(name: string) {
        if (name === 'ready' && !this.isInStandaloneMode()) {
            if (this.hasAttribute(name)) {
                this.updateAndroidUi()
                this.addListeners()
            } else {
                this.removeListeners()
            }
        }
        if (name === 'show') {
            if (this.hasAttribute(name)) {
                this.updateAndroidUi(false)
                this.addListeners()
            } else {
                this.removeListeners()
            }
        }
    }

    connectedCallback() {
        this.render()

        if (this.isIos()) {
            this.renderTemplate(true)
        } else if (this.isAndroid()) {
            this.renderTemplate(false)
        }

        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault()
            this.deferredPrompt = e as BeforeInstallPromptEvent
        }, { once: true })
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    private updateAndroidUi(isPrompt: boolean = true) {
        if (!this.isAndroid()) return
        const installButton = this.querySelector<HTMLElement>('#installButton')
        const installInstruction = this.querySelector<HTMLElement>('#installInstruction')

        if (!(installButton && installInstruction)) return

        if (isPrompt) {
            installButton.style.display = 'flex'
            installInstruction.style.display = 'none'
        } else {
            installButton.style.display = 'none'
            installInstruction.style.display = 'block'
        }
    }

    private addListeners() {
        this.showPopover()
        this.addEventListener('click', this.onClick)
    }

    private removeListeners() {
        this.hidePopover()
        this.removeEventListener('click', this.onClick)
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.hasAttribute('data-button')) {
            const btn = target.dataset.button
            if (btn === 'prompt-close') {
                this.hide()
            } 
            if (btn === 'install') {
                this.triggerInstall()
            }
        }
    }

    private renderTemplate(iOS: boolean = true) {
        const template = this.querySelector<HTMLTemplateElement>(iOS ? "#iOSInstall" : "#andoridInstall")!

        const clone = template.content.cloneNode(true) as HTMLElement

        this.appendChild(clone)
    }

    private async triggerInstall() {
        if (!this.deferredPrompt) return

        try {
            this.deferredPrompt.prompt()
            const result = await this.deferredPrompt.userChoice
    
            if (result.outcome === 'accepted') {
                this.hide()
                this.deferredPrompt = null
            }
        } catch(_) {
            appToast.showMessage('Error', null, true)
        }
    }

    private render() {
        const slot = document.createElement('slot')
        this.setAttribute('popover', 'manual')
        this.renderRoot.appendChild(slot)
    }

    private isIos() {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

        return isIOS && isSafari
    }

    private isAndroid() {
        return /android/i.test(navigator.userAgent)
    }

    private isInStandaloneMode(): boolean {
        return (
            (window.navigator as any).standalone === true || // ✅ iOS Safari
            window.matchMedia?.('(display-mode: standalone)').matches // ✅ Other platforms
        )
    }

    private hide() {
        this.removeAttribute('ready')
        this.removeAttribute('show')
    }
}

customElements.define('install-prompt', InstallPrompt)