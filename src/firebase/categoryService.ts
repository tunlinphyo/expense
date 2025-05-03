import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, updateDoc, query, orderBy, writeBatch, where } from "firebase/firestore"
import { db } from "./firebase"
import type { CategoryType } from "../types"
import { v4 as uuidv4 } from "uuid"

export class CategoryService {
    static collectionRef(userId: string) {
        return collection(db, "users", userId, "categories")
    }

    static expensesRef(userId: string) {
        return collection(db, "users", userId, "expenses")
    }

    static async addCategory(userId: string, data: Omit<CategoryType, "id" | "order">): Promise<string> {
        const id = uuidv4()
        const category: CategoryType = {
            ...data,
            id,
            order: Date.now()
        }
        const ref = doc(this.collectionRef(userId), id)
        await setDoc(ref, category)
        return id
    }

    static async updateCategory(userId: string, categoryId: string, updates: Partial<Omit<CategoryType, "id">>) {
        const ref = doc(this.collectionRef(userId), categoryId)
        await updateDoc(ref, updates)
    }

    static async updateSort(userId: string, sortedCategories: { id: string, order: number }[]): Promise<void> {
        const batch = writeBatch(db)

        for (const { id, order } of sortedCategories) {
            const ref = doc(this.collectionRef(userId), id)
            batch.update(ref, { order })
        }

        await batch.commit()
    }

    static async setCategory(userId: string, category: CategoryType) {
        const ref = doc(this.collectionRef(userId), category.id)
        await setDoc(ref, category)
    }

    static async getAll(userId: string): Promise<CategoryType[]> {
        const q = query(this.collectionRef(userId), orderBy("order", "asc"))
        const snap = await getDocs(q)
        return snap.docs.map(doc => doc.data() as CategoryType)
    }

    static async getCategory(userId: string, categoryId: string): Promise<CategoryType | null> {
        const ref = doc(this.collectionRef(userId), categoryId)
        const snap = await getDoc(ref)
        return snap.exists() ? ({
            ...snap.data(),
            id: categoryId,
        } as CategoryType) : null
    }

    static async deleteCategory(userId: string, categoryId: string): Promise<null | string> {
        const q = query(this.expensesRef(userId), where("categoryId", "==", categoryId))
        const snap = await getDocs(q)

        if (!snap.empty) {
          return `Used in Expense`
        }

        await deleteDoc(doc(this.collectionRef(userId), categoryId))
        return null
    }

    // static onCategoryChange(
    //     userId: string,
    //     callback: (categories: CategoryType[]) => void
    // ): () => void {
    //     const q = query(this.collectionRef(userId), orderBy("order", "asc"))
    //     return onSnapshot(q, (snapshot) => {
    //         const categories = snapshot.docs.map(doc => doc.data() as CategoryType)
    //         callback(categories)
    //     })
    // }

    static onCategoryChange(
        userId: string,
        callback: () => void
    ): () => void {
        let isFirstSnapshot = true
        
        return onSnapshot(this.collectionRef(userId), () => {
            if (isFirstSnapshot) {
                isFirstSnapshot = false
                return
            }
            callback()
        })
    }
}