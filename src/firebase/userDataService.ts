import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    writeBatch
} from "firebase/firestore"
import { db } from "./firebase"

export class UserDataService {
    static async deleteAllUserData(userId: string): Promise<void> {
        const userDocRef = doc(db, "users", userId)

        // Batch delete subcollections
        const deleteSubcollection = async (sub: "categories" | "expenses") => {
            const colRef = collection(db, "users", userId, sub)
            const snapshot = await getDocs(colRef)

            const batch = writeBatch(db)
            snapshot.forEach((docSnap) => {
                batch.delete(docSnap.ref)
            })

            if (!snapshot.empty) {
                await batch.commit()
            }
        }

        // Delete categories and expenses
        await deleteSubcollection("categories")
        await deleteSubcollection("expenses")

        // Delete app document if exists
        try {
            await deleteDoc(doc(db, "users", userId, "app"))
        } catch (err) {
            console.warn("No app document to delete:", err)
        }

        // Delete user root document
        try {
            await deleteDoc(userDocRef)
        } catch (err) {
            console.error("Failed to delete user document:", err)
        }
    }
}