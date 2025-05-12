import { createContext } from "../context"
import type { ExpenseContext, KeyboardContext, OverviewContext } from "../types"

export const expenseContext = createContext<ExpenseContext>('expense-context')
export const overviewContext = createContext<OverviewContext>('overview-context')
export const keyboardContext = createContext<KeyboardContext>('keyboard-context')