import Sortable from 'sortablejs'

export class SortableDirective {
    private sortableInstance?: Sortable
    private attrObserver: MutationObserver

    constructor(private host: HTMLElement) {
        // Initial state
        if (host.hasAttribute('sortable')) {
            this.enable()
        }

        // Watch for attribute changes
        this.attrObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'sortable') {
                    if (host.hasAttribute('sortable')) {
                        this.enable()
                    } else {
                        this.disable()
                    }
                }
            }
        })

        this.attrObserver.observe(host, { attributes: true })
    }

    private enable() {
        if (this.sortableInstance) return

        this.sortableInstance = new Sortable(this.host, {
            animation: 150,
            ghostClass: "sortable-ghost",
            // handle: '[draggable]', // optional: limit drag to elements with draggable attribute
            onEnd: () => this.emitSortChange(),
        })

        this.host.setAttribute('aria-dropeffect', 'move')
        this.toggleChildItems(true)
    }

    private disable() {
        if (!this.sortableInstance) return

        this.sortableInstance.destroy()
        this.sortableInstance = undefined

        this.host.removeAttribute('aria-dropeffect')
        this.toggleChildItems(false)
    }

    private toggleChildItems(enable: boolean) {
        const items = this.host.querySelectorAll('dynamic-list-item')
        items.forEach(item => {
        if (enable) {
            item.setAttribute('sortable', '')
        } else {
            item.removeAttribute('sortable')
        }
        })
    }

    private emitSortChange() {
        const order = Array.from(this.host.children).map(
            el => (el as HTMLElement).dataset.id || ''
        )

        this.host.dispatchEvent(
            new CustomEvent('sortchange', {
                detail: { order },
                bubbles: true,
                composed: true,
            })
        )
    }

    destroy() {
        this.disable()
        this.attrObserver.disconnect()
    }
}