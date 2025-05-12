export type WithId = { id: string } & Record<string, any>

export type KeyboardType = 'number' | 'text'

export type KeyboardContext = {
    focusElem: HTMLElement | null
    key: string
    status: 'open' | 'closed'
    type: KeyboardType
}