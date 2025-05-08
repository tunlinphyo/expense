const X = 150
const Y = 150
// const easingX = 'cubic-bezier(.25,0,.4,1)'
// const easingY = 'cubic-bezier(.50,0,1,1)'
const easingX = 'ease'
const easingY = 'ease-in'

export function modalIn(elem: HTMLElement, deltaY: number = 0, isMini: boolean = false) {
    const y = Y * (isMini ? 0.5 : 1)
    return elem.animate([
        { translate: `0 ${deltaY || y}px` },
        { translate: '0 0' },
    ], {
        duration: 200,
        easing: easingX
    })
}

export function modalOut(elem: HTMLElement, deltaY: number = 0, isMini: boolean = false) {
    const y = Y * (isMini ? 0.5 : 1)
    const startY = Math.max(deltaY, elem.clientHeight - (y * 1.5))
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: `0 ${window.innerHeight}px` },
    ], {
        duration: 200,
        easing: easingY
        // easing: 'cubic-bezier(0.15, 0, 0.6, 0)'
    })
}

export function modalCustomOut(elem: HTMLElement, deltaY: number = 0) {
    const startY = Math.max(window.innerHeight * 0.25, deltaY)
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: `0 ${startY + (Y * 1.5)}px` },
    ], {
        duration: 200,
        easing: easingY
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
        duration: 200,
        easing: easingX
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
        duration: 200,
        easing: easingX
    })
}