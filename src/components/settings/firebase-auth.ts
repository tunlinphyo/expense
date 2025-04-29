import { User } from "firebase/auth"
import { loginWithGoogle, logout, observeAuthState } from "../../firebase/authService"

export class FirebaseAuth extends HTMLElement {
    private userTemplate?: HTMLTemplateElement
    private guestTemplate?: HTMLTemplateElement
    private handleClick = this.onClick.bind(this)

    connectedCallback() {
        this.userTemplate = this.querySelector<HTMLTemplateElement>("#user")!
        this.guestTemplate = this.querySelector<HTMLTemplateElement>("#guest")!

        observeAuthState((user) => {
            if (user) {
                this.renderUser(user)
            } else {
                this.renderGuest()
            }
        })

        this.addEventListener("click", this.handleClick)
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.handleClick)
    }

    private onClick(e: Event) {
        const target = e.target as HTMLElement
        if (target.dataset.button === "login") {
            loginWithGoogle()
        } else if (target.dataset.button === "logout") {
            logout()
        }
    }

    private renderUser(user: User) {
        if (!this.userTemplate) return
        const clone = this.userTemplate.content.cloneNode(true) as HTMLElement

        const placeholder = clone.querySelector<HTMLImageElement>("img[data-user-photo]")
        const name = clone.querySelector("[data-user-name]")
        const email = clone.querySelector("[data-user-email]")

        if (placeholder && user.photoURL) {
            const img = new Image()
            img.src = user.photoURL
            console.log(user.photoURL)
            img.width = placeholder.width
            img.height = placeholder.height
            img.alt = "User photo"
            placeholder.replaceWith(img)
        }

        if (name) name.textContent = user.displayName || "No Name"
        if (email) email.textContent = user.email || "No Email"

        this.replaceChildren(clone)
    }

    private renderGuest() {
        if (!this.guestTemplate) return
        const clone = this.guestTemplate.content.cloneNode(true)
        this.replaceChildren(clone)
    }
}

customElements.define("firebase-auth", FirebaseAuth)