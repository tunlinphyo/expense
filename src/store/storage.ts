export class LocalStorageHandler {
    static LS_THEME = 'theme__'

    static setStorage<T>(key: string, value: T): void {
        try {
            const data = JSON.stringify(value)
            localStorage.setItem(key, data)
        } catch (e) {
            console.log(`Failed to setStorage for key "${key}":`, e)
        }
    }


    static getStorage<T>(key: string): T | null {
        try {
            const data = localStorage.getItem(key)
            return data ? JSON.parse(data) as T : null
        } catch (e) {
            console.log(`Failed to getStorage for key "${key}":`, e)
            return null
        }
    }


    static deleteStorage(key: string): void {
        localStorage.removeItem(key)
    }
}