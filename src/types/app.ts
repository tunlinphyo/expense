import type { CategoryType } from "./firebase"

export type ExpenseContext = {
    year: number
    month: number
    categories: string[]
}

export type CategoryTotal = {
    id: string;
    category: CategoryType;
    total: number;
}

export type TotalExpense = {
    id: string; // Date string in format YYYY || YYYY-MM
    date: Date;
    total: number;
}
