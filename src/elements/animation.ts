const duration = 300
const easeOut = 'cubic-bezier(0.2, 1, 0.8, 1)'

export function modalIn(elem: HTMLElement, deltaY: number = 0) {
    return elem.animate([
        { translate: `0 ${deltaY || elem.clientHeight}px` },
        { translate: '0 0' },
    ], {
        duration,
        easing: easeOut
    })
}

export function modalCustomIn(elem: HTMLElement, deltaY: number = 0) {
    const startY = Math.max((elem.clientHeight * 0.5), deltaY)
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: '0 0' },
    ], {
        duration,
        easing: easeOut
    })
}

export function modalOut(elem: HTMLElement, deltaY: number = 0) {
    return elem.animate([
        { translate: `0 ${deltaY}px` },
        { translate: `0 ${elem.clientHeight + 50}px` },
    ], {
        duration,
        easing: easeOut
    })
}

export function modalCustomOut(elem: HTMLElement, deltaY: number = 0) {
    const halfY = window.innerHeight * 0.5
    return elem.animate([
        { translate: `0 ${deltaY}px` },
        { translate: `0 ${halfY + 50}px` },
    ], {
        duration,
        easing: easeOut
    })
}

export function pageIn(elem: HTMLElement, deltaX: number = 0, deltaY: number = 0) {
    const computed = getComputedStyle(elem)
    const scale = computed.scale
    const borderRadius = computed.borderRadius

    elem.removeAttribute('style')

    return elem.animate([
        { translate: `${deltaX || elem.clientWidth}px ${deltaY}px`, scale, borderRadius },
        { translate: '0 0', scale: 1, borderRadius: 0 },
    ], {
        duration,
        easing: easeOut
    })
}

export function pageOut(elem: HTMLElement, deltaX: number = 0, deltaY: number = 0) {
    const computed = getComputedStyle(elem)
    const scale = computed.scale
    const borderRadius = computed.borderRadius

    elem.removeAttribute('style')

    // const startX = Math.max(window.innerWidth - X, deltaX)

    return elem.animate([
        { translate: `${deltaX}px ${deltaY}px`, opacity: 1, scale, borderRadius },
        { translate: `${elem.clientWidth}px 0`, opacity: 1, scale, borderRadius },
    ], {
        duration,
        easing: easeOut
    })
}

export function keyboardEnter(elem: HTMLElement) {
    return elem.animate([
        { transform: `translateY(${elem.clientHeight}px)` },
        { translate: `translateY(0px)` },
    ], {
        duration,
        easing: easeOut
    })
}

export function keyboardLeave(elem: HTMLElement) {
    return elem.animate([
        { translate: `translateY(0px)` },
        { transform: `translateY(${elem.clientHeight}px)` },
    ], {
        duration,
        easing: easeOut
    })
}