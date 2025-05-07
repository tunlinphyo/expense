export class AppDate {
    public static Date(dateString: string | Date): Date {
        if (typeof dateString === 'string' && !dateString.includes('T')) {
            const parts = dateString.split('-').map(Number);
            const year = parts[0];
            const month = (parts[1] ?? 1) - 1; // zero-based
            const day = parts[2] ?? 1;
            return new Date(year, month, day);
        }

        return new Date(dateString); // it's already a Date
    }

    public static getLocalISODate(dateString?: string | Date) {
        const date = dateString ? AppDate.Date(dateString) : new Date()
        return date.toLocaleDateString("sv-SE") // "sv-SE" gives YYYY-MM-DD format
    }

    public static yearMonth(dateString: string | Date) {
        const date = AppDate.Date(dateString)
        const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' })
        return formatter.format(date)
    }

    public static formatDate(dateString: string | Date) {
        const date = AppDate.Date(dateString)
        const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
        return formatter.format(date)
    }

    public static monthDay(dateString: string | Date) {
        const date = new Date(dateString)
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
        return formatter.format(date)
    }

    public static addTimeToDate(date: Date, now: Date = new Date()): Date {
        const result = new Date(date) // clone original date
        result.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
        return result
    }

    public static isToday(date: Date | string): boolean {
        const target = new Date(date)
        const today = new Date()

        return (
            target.getFullYear() === today.getFullYear() &&
            target.getMonth() === today.getMonth() &&
            target.getDate() === today.getDate()
        )
    }

    public static isThisMonth(date: Date | string): boolean {
        const target = new Date(date)
        const now = new Date()

        return (
            target.getFullYear() === now.getFullYear() &&
            target.getMonth() === now.getMonth()
        )
    }

    public static getYesterday(): Date {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday
    }

    public static getLastMonth(): Date {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }

    public static isYesterday(date: Date | string): boolean {
        const target = new Date(date)
        const today = new Date()

        today.setHours(0, 0, 0, 0)
        target.setHours(0, 0, 0, 0)

        const diff = today.getTime() - target.getTime()

        // 1 day = 86400000 milliseconds
        return diff === 86400000
    }
}