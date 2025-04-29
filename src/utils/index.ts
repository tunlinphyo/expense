export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null)
        return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false
    }

    return true
}

export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(target: T, source: U): T & U {
    const result: Record<string, any> = { ...target }

    for (const key in source) {
        if (
            Object.prototype.hasOwnProperty.call(source, key) &&
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key])
        ) {
            result[key] = deepMerge(result[key] || {}, source[key])
        } else {
            result[key] = source[key]
        }
    }

    return result as T & U
}

export class RawHTML {
    constructor(public readonly value: string) {}
}

export function raw(value: string): RawHTML {
    return new RawHTML(value)
}

export function html(strings: TemplateStringsArray, ...values: any[]): Node {
    const template = document.createElement('template')
    const htmlString = strings.reduce((acc, str, i) => {
        const val = values[i];
        if (val instanceof RawHTML) {
            return acc + str + val.value
        } else {
            return acc + str + serialize(val)
        }
    }, '')

    template.innerHTML = htmlString
    return template.content.cloneNode(true)
}

export function css(strings: TemplateStringsArray, ...values: any[]): CSSStyleSheet {
    const cssString = strings.reduce((acc, str, i) => {
        const val = values[i]
        return acc + str + serialize(val)
    }, '')

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(cssString)

    return sheet
}

export function serialize(value: any): string {
    if (value == null) return ''
    return String(value)
        .replace(/&/g, '&amp')
        .replace(/</g, '&lt')
        .replace(/>/g, '&gt')
        .replace(/"/g, '&quot')
        .replace(/'/g, '&#039')
}

export function getDates(year: number, month: number): string[] {
    const result = new Array(35).fill('') // Start with 35 empty slots
    const firstDay = new Date(year, month - 1, 1)
    const startIndex = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

    const daysInMonth = new Date(year, month, 0).getDate()

    let index = startIndex
    for (let day = 1; day <= daysInMonth; day++) {
        if (index < 35) {
            result[index] = day.toString()
        } else {
            // Overflow: wrap back to beginning and fill empty slots
            for (let i = 0; i < startIndex; i++) {
                if (result[i] === '') {
                    result[i] = day.toString()
                    break
                }
            }
        }
        index++
    }

    return result
}

export function isEmptyObject(obj: unknown): obj is Record<string, never> {
    return typeof obj === "object" && obj !== null && Object.keys(obj).length === 0
}

export function isDarkMode(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}