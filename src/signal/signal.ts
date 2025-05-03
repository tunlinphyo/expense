export interface Signal<T> {
    get(): T
}

export namespace Signal {
    export interface SignalOptions<T> {
        equals?: (this: Signal<T>, a: T, b: T) => boolean
        [subtle.watched]?: (this: Signal<T>) => void
        [subtle.unwatched]?: (this: Signal<T>) => void
    }

    type Subscriber = Computed<any> | subtle.Watcher

    let currentComputation: Computed<any> | null = null

    abstract class BaseSignal<T> implements Signal<T> {
        protected subscribers = new Set<Subscriber>()
        abstract get(): T

        getSubscribers(): Set<Subscriber> {
            return this.subscribers
        }

        protected notifySubscribers(): void {
            for (const sub of this.subscribers) {
                if (sub instanceof Computed) {
                    sub.markDirty()
                } else {
                    sub.invalidate(this)
                }
            }
        }

        protected trackDependency() {
            if (currentComputation) {
                this.subscribers.add(currentComputation)
                currentComputation.sources.add(this)
            }
        }
    }

    export class State<T> extends BaseSignal<T> {
        private _value: T
        private _equals: (a: T, b: T) => boolean
        private watchedHook?: () => void
        private unwatchedHook?: () => void
        private watcherCount = 0

        constructor(value: T, options?: SignalOptions<T>) {
            super()
            this._value = value
            this._equals = options?.equals?.bind(this) ?? Object.is
            this.watchedHook = options?.[subtle.watched]?.bind(this)
            this.unwatchedHook = options?.[subtle.unwatched]?.bind(this)
        }

        get(): T {
            this.trackDependency()
            return this._value
        }

        set(newValue: T): void {
            if (!this._equals(this._value, newValue)) {
                this._value = newValue
                this.notifySubscribers()
            }
        }

        _addWatcher() {
            if (++this.watcherCount === 1) {
                this.watchedHook?.()
            }
        }

        _removeWatcher() {
            if (--this.watcherCount === 0) {
                this.unwatchedHook?.()
            }
        }
    }

    export class Computed<T = unknown> extends BaseSignal<T> {
        private computeFn: () => T
        private cachedValue!: T
        private dirty = true
        readonly sources = new Set<BaseSignal<any>>()

        constructor(cb: (this: Computed<T>) => T, _options?: SignalOptions<T>) {
            super()
            this.computeFn = cb.bind(this)
        }

        get(): T {
            this.trackDependency()
            if (this.dirty) {
                this.evaluate()
            }
            return this.cachedValue
        }

        private evaluate() {
            for (const src of this.sources) {
                src.getSubscribers().delete(this)
            }
            this.sources.clear()

            const prev = currentComputation
            currentComputation = this
            this.cachedValue = this.computeFn()
            currentComputation = prev

            this.dirty = false
        }

        markDirty(): void {
            if (!this.dirty) {
                this.dirty = true
                this.notifySubscribers()
            }
        }
    }

    export namespace subtle {
        export const watched = Symbol("watched")
        export const unwatched = Symbol("unwatched")

        export function untrack<T>(cb: () => T): T {
            const prev = currentComputation
            currentComputation = null
            const result = cb()
            currentComputation = prev
            return result
        }

        export function currentComputed(): Computed | null {
            return currentComputation
        }

        export function introspectSources(s: Computed | Watcher): (State<any> | Computed<any>)[] {
            return [...s.sources].filter((source): source is State<any> | Computed<any> =>
                source instanceof State || source instanceof Computed
            )
        }

        export function introspectSinks(s: State<any> | Computed<any>): (Computed<any> | Watcher)[] {
            return [...s.getSubscribers()]
        }

        export function hasSinks(s: State<any> | Computed<any>): boolean {
            return s.getSubscribers().size > 0
        }

        export function hasSources(s: Computed<any> | Watcher): boolean {
            return s.sources.size > 0
        }

        export class Watcher<T = unknown> {
            private notify: () => void
            readonly sources = new Set<BaseSignal<any>>()
            private dirtySources = new Set<BaseSignal<any>>()

            constructor(notify: () => void) {
                this.notify = notify
            }

            watch(...signals: Signal<any>[]) {
                this.clear()
                for (const s of signals) {
                    if (s instanceof BaseSignal) {
                        s.getSubscribers().add(this)
                        this.sources.add(s)
                        if (s instanceof State) s._addWatcher()
                    }
                }
            }

            unwatch(...signals: Signal<any>[]) {
                for (const s of signals) {
                    if (s instanceof BaseSignal) {
                        s.getSubscribers().delete(this)
                        this.sources.delete(s)
                        if (s instanceof State) s._removeWatcher()
                    }
                }
            }

            getPending(): Signal<T>[] {
                return [...this.dirtySources]
            }

            invalidate(source: BaseSignal<any>) {
                this.dirtySources.add(source)
                queueMicrotask(() => {
                    if (this.dirtySources.size > 0) {
                        this.dirtySources.clear()
                        this.notify.call(this)
                    }
                })
            }

            private clear() {
                for (const s of this.sources) {
                    s.getSubscribers().delete(this)
                    if (s instanceof State) s._removeWatcher()
                }
                this.sources.clear()
                this.dirtySources.clear()
            }
        }

        // export function effect(callback: () => void, signals: Signal<any>[]): () => void {
        //     const watcher = new Watcher(() => {
        //         runEffect()
        //     })

        //     function runEffect() {
        //         untrack(() => {
        //             watcher.watch(...signals) // Reset all old subscriptions
        //             callback()      // Run and track dependencies
        //         })
        //     }

        //     runEffect() // Initial run

        //     return () => watcher.unwatch(...signals) // Dispose function
        // }
        
        export function effect(callback: () => void, signals: Signal<any>[], runImmediately = true): () => void {
            let isInitial = true
        
            const watcher = new Watcher(() => {
                if (isInitial && !runImmediately) {
                    isInitial = false
                    return
                }
                runEffect()
            })
        
            function runEffect() {
                untrack(() => {
                    watcher.watch(...signals) // Reset subscriptions
                    callback()                // Track and run
                })
            }
        
            if (runImmediately) {
                runEffect()
            } else {
                // Track without executing the callback
                untrack(() => watcher.watch(...signals))
            }
        
            return () => watcher.unwatch(...signals)
        }
    }
}