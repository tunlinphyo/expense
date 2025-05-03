export function modalIn(elem: HTMLElement, deltaY: number = 0) {
    return elem.animate([
        { translate: `0 ${deltaY || 100 }px` },
        { translate: '0 0' },
    ], {
        duration: 200,
        easing: 'ease'
    })
}

export function modalOut(elem: HTMLElement, deltaY: number = 0) {
    const startY = Math.max(deltaY, elem.clientHeight - 200)
    return elem.animate([
        { translate: `0 ${startY}px` },
        { translate: `0 ${window.innerHeight}px` },
    ], {
        duration: 200,
        easing: 'cubic-bezier(0.15, 0, 0.6, 0)'
    })
}