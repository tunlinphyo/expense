export interface ColorType {
    id: string;
    name: string;
    codes: [string, string] // [light, dark]
}

export interface IconType {
    id: string;
    icon: string;
}

export interface CategoryType {
    id: string;
    name: string;
    color: string;
    icon: string;
    order: number;
}

export interface SortOrder {
    id: string;
    order: number;
}

export interface ExpenseType {
    id: string;
    categoryId: string;
    category: CategoryType
    amount: number;
    date: Date;
    note: string;
}

export interface ExpenseQuery {
    year: number;
    month: number;
    categories: string[];
    date?: Date;
}

export interface Noti {
    id: string;
    data: string;
}

export type AppData =
    | { id: "currency", data: string }
    | { id: "noti", data: Noti[] }
    | { id: "modifiedTime", data: string }  // Date string
    | { id: "syncTime", data: string }  // Date string


export type DBEmitEvent = (action: string, store: string, data: any) => void

export interface DBData {
    categories: CategoryType[],
    expenses: ExpenseType[],
    appdatas: AppData[]
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

// export interface CategoryType {
//     id: string;
//     name: string;
//     color: string;
//     icon: string;
//     order: number;
//     createDate: Date;
//     updateDate: Date;
// }

// export interface ExpenseType {
//     id: string;
//     categoryId: string;
//     category: CategoryType
//     amount: number;
//     date: Date;
//     note: string;
//     createDate: Date;
//     updateDate: Date;
// }
