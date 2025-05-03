

export class AppNumber {
    public static price(value: number, currency: string) {
        const result = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value)
        if (currency !== 'MMK') return result
        return result.replace(/\.\d+$/, "")
    }
    
    public static mapRange(
        value: number,
        inMin: number,
        inMax: number,
        outMin: number,
        outMax: number
    ): number {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
    }
    
    public static format(
        value: number,
        options: Intl.NumberFormatOptions = {},
        locale: string = "en-US"
    ): string {
        return new Intl.NumberFormat(locale, options).format(value)
    }
}