// context.ts
export type Context<T> = symbol & { __contextType?: T }
export type ContextCallback<T> = (value: T, oldValue: T) => void

interface ContextRequestDetail<T> {
    listener: HTMLElement
    context: Context<T>
    callback: ContextCallback<T>
}

export function createContext<T>(name: string) {
    return Symbol(name) as Context<T>
}

export class ContextProvider<T> {
    private _value: T
    private listeners = new Set<HTMLElement>()
    private callbacks = new WeakMap<HTMLElement, Set<ContextCallback<T>>>()

    get value(): T {
        return this._value
    }

    constructor(
        private host: HTMLElement,
        private context: Context<T>,
        options: { initial?: T } = {}
    ) {
        this._value = options.initial ?? ({} as T)
        this._init()
    }

    setValue(val: T): void {
        const oldValue = { ...this._value }
        this._value = val
        this._notifyChange(oldValue)
    }

    subscribe(callback: ContextCallback<T>): () => void {
        return this.childSubscribe(this.host, callback)
    }

    unsubscribe(): void {
        this.childUnsubscribe(this.host)
    }

    private childSubscribe(host: HTMLElement, callback: ContextCallback<T>): () => void {
        this._register(host, callback)
        callback(this._value, this._value) // immediately push

        // Return unsubscribe function
        return () => {
            this._unregisterCallback(host, callback)
        }
    }

    private childUnsubscribe(host: HTMLElement): void {
        this.listeners.delete(host)
        this.callbacks.delete(host)
    }

    private _init(): void {
        this.host.addEventListener('context-subscribe', (e: Event) => {
            const event = e as CustomEvent<ContextRequestDetail<T>>
            if (event.detail.context !== this.context) return
            e.stopPropagation()
            this.childSubscribe(event.detail.listener, event.detail.callback)
        })

        this.host.addEventListener('context-unsubscribe', (e: Event) => {
            const event = e as CustomEvent<{ context: Context<T>; listener: HTMLElement }>
            if (event.detail.context !== this.context) return
            e.stopPropagation()
            this.childUnsubscribe(event.detail.listener)
        })
    }

    private _register(host: HTMLElement, callback: ContextCallback<T>) {
        this.listeners.add(host)

        let set = this.callbacks.get(host)
        if (!set) {
            set = new Set()
            this.callbacks.set(host, set)
        }
        set.add(callback)
    }

    private _unregisterCallback(host: HTMLElement, callback: ContextCallback<T>) {
        const set = this.callbacks.get(host)
        if (!set) return

        set.delete(callback)
        if (set.size === 0) {
            this.callbacks.delete(host)
            this.listeners.delete(host)
        }
    }

    private _notifyChange(oldValue: T): void {
        for (const host of this.listeners) {
            const set = this.callbacks.get(host)
            if (!set) continue
            for (const cb of set) {
                cb(this._value, oldValue)
            }
        }
    }
}

export class ContextConsumer<T> {
    private subscriptions = new Set<() => void>()

    constructor(
        private host: HTMLElement,
        private context: Context<T>
    ) { }

    /**
     * Subscribes to the context value and returns an unsubscribe function.
     */
    subscribe(callback: ContextCallback<T>): () => void {
        const unsubscribe = () => {
            const event = new CustomEvent<{ context: Context<T>; listener: HTMLElement }>(
                'context-unsubscribe',
                {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        context: this.context,
                        listener: this.host
                    }
                }
            )
            this.host.dispatchEvent(event)
        }

        // Dispatch a context-request
        const requestEvent = new CustomEvent<ContextRequestDetail<T>>('context-subscribe', {
            bubbles: true,
            composed: true,
            cancelable: false,
            detail: {
                listener: this.host,
                context: this.context,
                callback
            }
        })

        this.host.dispatchEvent(requestEvent)

        // Store the unsubscribe function (this unsubscribes *all* callbacks from this host)
        this.subscriptions.add(unsubscribe)
        return () => {
            unsubscribe()
            this.subscriptions.delete(unsubscribe)
        }
    }

    /**
     * Unsubscribes all callbacks for this host.
     */
    unsubscribe(): void {
        for (const unsub of this.subscriptions) {
            unsub()
        }
        this.subscriptions.clear()
    }
}