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
}