export type WithId = { id: string } & Record<string, any>

export type KeyboardContext = {
    focusElem: HTMLElement | null
    focusIndex: number 
    key: string
    status: 'open' | 'closed'
    type: 'number' | 'text'
}