import { resetStyles } from "./styles"

export class SplashScreen extends HTMLElement {
    private renderRoot: ShadowRoot
    private removed: boolean = false

    constructor() {
        super()
        this.renderRoot = this.attachShadow({mode: 'closed'})
        this.renderRoot.adoptedStyleSheets = [resetStyles]
    }

    connectedCallback() {
        this.render()
    }

    removeSplash() {
        if (this.removed) return
        const animation = this.hideAnimation()
        animation.finished.then(() => {
            this.remove()
            this.removed = true
        })
    }

    private render() {
        const slot = document.createElement('slot')

        this.renderRoot.appendChild(slot)
    }

    private hideAnimation() {
        return this.animate([
            { opacity: 1, translate: '0 0' },
            { opacity: 0, translate: '0 -100px' }
        ], {
            duration: 500,
            easing: 'ease'
        })
    }
}

customElements.define('splash-screen', SplashScreen)