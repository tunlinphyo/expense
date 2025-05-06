

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

        if (this.isInStandaloneMode()) 
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
    }

    protected setLocalStatus(status: string) {
        localStorage.setItem(this.SHOWN_PROMPT, status)
    }

    private getLocalStatus(): string | null {
        return localStorage.getItem(this.SHOWN_PROMPT)
    }

    // private isAndroid() {
    //     return /android/i.test(navigator.userAgent)
    // }

    private isInStandaloneMode(): boolean {
        return (
            (window.navigator as any).standalone === true || // ✅ iOS Safari
            window.matchMedia?.('(display-mode: standalone)').matches // ✅ Other platforms
        )
    }
}

customElements.define('settings-group', SettingsGroup)