import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    Timestamp,
    onSnapshot,
    updateDoc,
    deleteDoc,
    DocumentChangeType
} from "firebase/firestore"
import { QueryConstraint, limit, orderBy, startAfter } from "firebase/firestore"
import { db } from "./firebase"
import type { ExpenseType, ExpenseQuery, CategoryType, MonthlyResult } from "../types"
import { v4 as uuidv4 } from "uuid"
import { CategoryService } from "./categoryService"

export class ExpenseService {
    static collectionRef(userId: string) {
        return collection(db, "users", userId, "expenses")
    }

    static categoryCollectionRef(userId: string) {
        return collection(db, "users", userId, "categories")
    }

    static async addExpense(userId: string, data: Omit<ExpenseType, "id" | "category">): Promise<string> {
        try {
            const id = uuidv4()
            const expense: Omit<ExpenseType, "category"> = {
                ...data,
                id,
            }
            const ref = doc(this.collectionRef(userId), id)
            await setDoc(ref, expense)
            return id
        } catch (err) {
            console.log(err)
            return 'error'
        }
    }

    static async setExpense(userId: string, expense: ExpenseType) {
        const ref = doc(this.collectionRef(userId), expense.id)
        const { id, ...rest } = expense
        await setDoc(ref, {
            ...rest,
            date: Timestamp.fromDate(expense.date)
        })
    }

    static async updateExpense(userId: string, expenseId: string, updates: Partial<Omit<ExpenseType, "id">>) {
        const ref = doc(this.collectionRef(userId), expenseId)
        await updateDoc(ref, updates)
    }

    static async getAll(userId: string): Promise<ExpenseType[]> {
        const snap = await getDocs(this.collectionRef(userId))
        return snap.docs.map(doc => {
            const data = doc.data()
            return {
                ...data,
                id: doc.id,
                date: (data.date as Timestamp).toDate()
            } as ExpenseType
        })
    }

    static async getExpense(userId: string, expenseId: string): Promise<ExpenseType | null> {
        const ref = doc(this.collectionRef(userId), expenseId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
            const data = snap.data()
            const category = await CategoryService.getCategory(userId, data.categoryId)
            return {
                ...data,
                category,
                date: (data.date as Timestamp).toDate(),
                id: expenseId,
            } as ExpenseType
        }
        return null
    }

    static async deleteExpense(userId: string, id: string): Promise<void> {
        const ref = doc(this.collectionRef(userId), id)
        await deleteDoc(ref)
    }

    static async queryExpenses(userId: string, q: ExpenseQuery): Promise<ExpenseType[]> {
        let expensesQuery = query(this.collectionRef(userId))

        if (q.date) {
            const start = Timestamp.fromDate(new Date(q.date))
            const end = Timestamp.fromDate(new Date(q.date))
            expensesQuery = query(expensesQuery, where("date", ">=", start), where("date", "<=", end))
        } else if (q.year && q.month) {
            const start = Timestamp.fromDate(new Date(q.year, q.month - 1, 1))
            const end = Timestamp.fromDate(new Date(q.year, q.month, 0, 23, 59, 59))
            expensesQuery = query(expensesQuery, where("date", ">=", start), where("date", "<=", end))
        } else if (q.year) {
            const start = Timestamp.fromDate(new Date(q.year, 0, 1))
            const end = Timestamp.fromDate(new Date(q.year, 11, 31, 23, 59, 59))
            expensesQuery = query(expensesQuery, where("date", ">=", start), where("date", "<=", end))
        }

        if (q.categories?.length) {
            expensesQuery = query(expensesQuery, where("categoryId", "in", q.categories.slice(0, 10)))
        }

        const snap = await getDocs(expensesQuery)
        return snap.docs.map(doc => {
            const data = doc.data()
            return {
                ...data,
                id: doc.id,
                date: (data.date as Timestamp).toDate()
            } as ExpenseType
        })
    }

    static async getTotal(userId: string, q: ExpenseQuery): Promise<number> {
        const items = await this.queryExpenses(userId, q)
        return items.reduce((sum, e) => sum + e.amount, 0)
    }

    static async getTotalsByGroup(
        userId: string,
        groupBy: "month" | "year" | "category"
    ): Promise<Record<string, number>> {
        const all = await this.getAll(userId)
        const grouped: Record<string, number> = {}

        for (const e of all) {
            const key =
                groupBy === "month"
                    ? `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
                    : groupBy === "year"
                        ? `${e.date.getFullYear()}`
                        : e.categoryId

            grouped[key] = (grouped[key] ?? 0) + e.amount
        }

        return grouped
    }

    // static onExpenseChange(
    //     userId: string,
    //     callback: () => void
    // ): () => void {
    //     return onSnapshot(this.collectionRef(userId), () => {
    //         callback()
    //     })
    // }

    static onExpenseChange(
        userId: string,
        callback: (type: DocumentChangeType) => void
    ): () => void {
        let isFirstSnapshot = true

        return onSnapshot(this.collectionRef(userId), async (snapshot) => {
            if (isFirstSnapshot) {
                isFirstSnapshot = false
                return
            }

            const changes = snapshot.docChanges().map(change => {
                return change.type
            })

            if (changes.length > 0) {
                const data = changes[0]
                callback(data)
            }
        })
    }

    static async getTotalAmount(userId: string, q: ExpenseQuery): Promise<number> {
        const constraints: any[] = [
            orderBy("date", "desc")
        ]

        if (q.year) {
            const start = new Date(q.year, q.month ?? 1, 1)
            const end = q.month != null
                ? new Date(q.year, q.month + 1, 0, 23, 59, 59)
                : new Date(q.year, 11, 31, 23, 59, 59)

            constraints.push(
                where("date", ">=", Timestamp.fromDate(start)),
                where("date", "<=", Timestamp.fromDate(end))
            )
        }

        if (q.categories?.length) {
            constraints.push(where("categoryId", "in", q.categories.slice(0, 10)))
        }

        const ref = this.collectionRef(userId)
        const snap = await getDocs(query(ref, ...constraints))

        return snap.docs.reduce((total, doc) => {
            const data = doc.data()
            return total + (data.amount || 0)
        }, 0)
    }

    static async paginatedQuery(
        userId: string,
        q: ExpenseQuery,
        pageSize = 20,
        lastDoc?: any // last document from previous page
    ): Promise<{ data: ExpenseType[], docSnap: any, hasMore: boolean }> {
        const constraints: QueryConstraint[] = [
            orderBy("date", "desc"),
            limit(pageSize)
        ]

        if (lastDoc) constraints.push(startAfter(lastDoc))

        if (q.year) {
            const start = Timestamp.fromDate(new Date(q.year, q.month ?? 1, 1))
            const end = Timestamp.fromDate(
                q.month
                    ? new Date(q.year, q.month + 1, 0, 23, 59, 59)
                    : new Date(q.year, 11, 31, 23, 59, 59)
            )
            constraints.push(where("date", ">=", start), where("date", "<=", end))
        }

        if (q.categories?.length) {
            constraints.push(where("categoryId", "in", q.categories.slice(0, 10)))
        }

        const ref = this.collectionRef(userId)
        const expenseSnap = await getDocs(query(ref, ...constraints))

        const data: ExpenseType[] = expenseSnap.docs.map(doc => {
            const d = doc.data()
            return {
                ...d,
                id: doc.id,
                date: (d.date as Timestamp).toDate()
            } as ExpenseType
        })

        const hasMore = expenseSnap.docs.length === pageSize

        return {
            data,
            docSnap: expenseSnap.docs.at?.(-1) || null,
            hasMore
        }
    }

    static async monthlyTotal(userId: string, year: number): Promise<Record<string, number>> {
        const start = new Date(year, 0, 1) // Jan 1
        const end = new Date(year, 11, 31, 23, 59, 59) // Dec 31

        const expensesRef = this.collectionRef(userId)
        const snap = await getDocs(query(
            expensesRef,
            where("date", ">=", Timestamp.fromDate(start)),
            where("date", "<=", Timestamp.fromDate(end))
        ))

        const monthlyTotals: Record<string, number> = {}

        for (const docSnap of snap.docs) {
            const data = docSnap.data() as ExpenseType
            const date = (data.date as any as Timestamp).toDate()

            const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}` // "2025-01", "2025-02", etc.

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0
            }

            monthlyTotals[monthKey] += data.amount
        }

        return monthlyTotals
    }

    static async categoryTotal(userId: string, year: number, month: number): Promise<MonthlyResult> {
        const start = new Date(year, month - 1, 1)
        const end = new Date(year, month, 0, 23, 59, 59)

        const expensesRef = this.collectionRef(userId)
        const snap = await getDocs(query(
            expensesRef,
            where("date", ">=", Timestamp.fromDate(start)),
            where("date", "<=", Timestamp.fromDate(end))
        ))

        const rawExpenses = snap.docs.map(doc => {
            const d = doc.data()
            return {
                id: doc.id,
                categoryId: d.categoryId,
                amount: d.amount,
                date: (d.date as Timestamp).toDate()
            }
        })

        const categoryIds = [...new Set(rawExpenses.map(e => e.categoryId))]

        let categoryMap: Record<string, CategoryType> = {}

        if (categoryIds.length > 0) {
            const catSnap = await getDocs(query(
                this.categoryCollectionRef(userId),
                where("id", "in", categoryIds.slice(0, 10)) // Firestore 'in' max 10 limit
            ))

            categoryMap = Object.fromEntries(
                catSnap.docs.map(doc => {
                    const data = doc.data() as CategoryType
                    return [data.id, data]
                })
            )
        }

        const categoryTotals: MonthlyResult = {}

        for (const expense of rawExpenses) {
            const category = categoryMap[expense.categoryId]
            if (!category) continue

            if (!categoryTotals[expense.categoryId]) {
                categoryTotals[expense.categoryId] = { category, total: 0 }
            }

            categoryTotals[expense.categoryId].total += expense.amount
        }

        return categoryTotals
    }
}