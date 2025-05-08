const X = 100
const Y = 150
const duration = 300

export function modalIn(elem: HTMLElement, deltaY: number = 0, isMini: boolean = false) {
    const y = Y * (isMini ? 0.5 : 1)
    return elem.animate([
        { translate: `0 ${deltaY || y}px` },
        { translate: '0 0' },
    ], {
        duration,
        easing: 'ease'
    })
}

export function modalOut(elem: HTMLElement, deltaY: number = 0, isMini: boolean = false) {
    const y = Y * (isMini ? 0.5 : 1)
    const startY = Math.max(deltaY, elem.clientHeight - y)
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: `0 ${window.innerHeight}px` },
    ], {
        duration,
        easing: 'ease-in'
    })
}

export function modalCustomOut(elem: HTMLElement, deltaY: number = 0) {
    const startY = Math.max(window.innerHeight * 0.25, deltaY)
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: `0 ${startY + (Y * 1.5)}px` },
    ], {
        duration,
        easing: 'ease-in'
    })
}

export function pageIn(elem: HTMLElement, deltaX: number = 0, deltaY: number = 0) {
    const computed = getComputedStyle(elem)
    const scale = computed.scale
    const borderRadius = computed.borderRadius

    elem.removeAttribute('style')

    return elem.animate([
        { translate: `${deltaX || X}px ${deltaY}px`, scale, borderRadius },
        { translate: '0 0', scale: 1, borderRadius: 0 },
    ], {
        duration,
        easing: 'ease-out'
    })
}

export function pageOut(elem: HTMLElement, deltaX: number = 0, deltaY: number = 0) {
    const computed = getComputedStyle(elem)
    const scale = computed.scale
    const borderRadius = computed.borderRadius

    elem.removeAttribute('style')

    return elem.animate([
        { translate: `${deltaX}px ${deltaY}px`, opacity: 1, scale, borderRadius },
        { translate: `${deltaX}px 0`, opacity: 0, scale, borderRadius },
    ], {
        duration,
        easing: 'ease'
    })
}