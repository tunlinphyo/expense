import { createContext } from "../context"
import { ExpenseContext } from "../types"

export const expenseContext = createContext<ExpenseContext>('expense-context')