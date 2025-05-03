import { createContext } from "../context"
import type { ExpenseContext, OverviewContext } from "../types"

export const expenseContext = createContext<ExpenseContext>('expense-context')
export const overviewContext = createContext<OverviewContext>('overview-context')