import { signal } from "../signal"
import type { CategoryType, ColorType, IconType } from "../types"

export const currencySignal = signal('JPY')
export const userSignal = signal('guest')
export const colorsSignal = signal<ColorType[]>([])
export const iconsSignal = signal<IconType[]>([])
export const categorySignal = signal<Record<string, CategoryType>>({})
export const totalSignal = signal(0)