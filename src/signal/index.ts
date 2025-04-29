import { Signal } from "./signal"

export function signal<T>(value: T) {
    return new Signal.State<T>(value)
}

export function computed<T>(computeFn: (this: Signal.Computed<T>) => T) {
    return new Signal.Computed<T>(computeFn)
}

export function effect(callback: () => void, signals: Signal<any>[]) {
    return Signal.subtle.effect(callback, signals)
}
