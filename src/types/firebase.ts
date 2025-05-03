export interface ColorType {
    id: string;
    name: string;
    codes: [string, string]; // [light, dark]
    order: number;
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

export interface ExpenseType {
    id: string;
    categoryId: string;
    category: CategoryType;
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
    id: string
    data: string
}

export type AppData =
    | { id: "currency"; data: string }
    | { id: "noti"; data: Noti[] }


export type Currency = {
    id: string;
    name: string;
    sign: string;
    flag: string;
    order: number;
}
