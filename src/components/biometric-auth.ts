import { LocalBiometricAuth } from "../utils/biometric"


export class BiometricsAuth extends HTMLElement {
    private initTemplate?: HTMLTemplateElement
    private errorTemplate?: HTMLTemplateElement
    private renderRoot: ShadowRoot
    private dialog: HTMLDialogElement

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.dialog = this.createDialog()
        this.initTemplate = this.querySelector<HTMLTemplateElement>("#authInit")!
        this.errorTemplate = this.querySelector<HTMLTemplateElement>("#authError")!
    }

    connectedCallback() {
        this.render()
        this.renderElem(this.initTemplate)
    }

    openAuth(): Promise<boolean> {
        this.openModal();

        return new Promise(async (resolve, reject) => {
            if (!await LocalBiometricAuth.isAvailable() || !LocalBiometricAuth.isEnabled()) {
                this.closeModal();
                return resolve(true);
            }

            try {
                await this.performAuth();
                this.closeModal();
                resolve(true);
            } catch (e) {
                this.renderElem(this.errorTemplate);
                this.tryAgain(resolve, reject);
            }
        });
    }

    private async tryAgain(
        resolve: (value: boolean) => void,
        reject: (reason?: any) => void,
    ): Promise<void> {
        this.addEventListener('click', async (e: Event) => {
            const target = e.target as HTMLElement
            if (target.dataset.button) {
                try {
                    await this.performAuth();
                    this.closeModal();
                    resolve(true);
                } catch (e) {
                    this.renderElem(this.errorTemplate);
                    this.tryAgain(resolve, reject);
                }
            }
        }, { once: true })
    }

    private async performAuth(): Promise<void> {
        if (LocalBiometricAuth.isRegistered()) {
            await LocalBiometricAuth.authenticate();
        } else {
            await LocalBiometricAuth.register();
        }
    }

    private openModal() {
        this.dialog.showModal()
        this.dialog.setAttribute('part', 'dialog opened')
    }

    private closeModal() {
        this.dialog.close()
        this.dialog.setAttribute('part', 'dialog')
        // this.remove()
    }

    private render() {
        const slot = document.createElement('slot')
        this.dialog.appendChild(slot)
        this.renderRoot.appendChild(this.dialog)
    }

    private createDialog() {
        const elem = document.createElement('dialog')
        elem.setAttribute('part', 'dialog')
        return elem
    }


    private renderElem(elem?: HTMLTemplateElement) {
        if (!elem) return
        const clone = elem.content.cloneNode(true)
        this.replaceChildren(clone)
    }
}

customElements.define('biometrics-auth', BiometricsAuth)