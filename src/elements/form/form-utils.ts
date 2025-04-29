
export type TypedValue = string | number | boolean | null | string[]

export type FormDataType = Record<string, any>

export function collectInitialFormData(form: HTMLElement): FormDataType {
    const data: FormDataType = {}

    const elements = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input[name], select[name], textarea[name]'
    )

    // Track radio groups
    const radioGroups = new Set<string>()

    elements.forEach((el) => {
        const name = el.name
        if (!name) return

        const value = parseFormValue(el)

        if (el instanceof HTMLInputElement && el.type === 'radio') {
            radioGroups.add(name)
            if (!el.checked) return // only take checked radio
        }

        if (value !== null) {
            const existing = data[name]
            if (Array.isArray(existing) && Array.isArray(value)) {
                const list = new Set([...existing, ...value])
                data[name] = Array.from(list)
            } else {
                data[name] = value
            }
        }
    })

    // Add empty string for unchecked radio groups
    radioGroups.forEach((name) => {
        if (!(name in data)) {
            data[name] = ''
        }
    })

    return data
}

export function setFormValues(form: HTMLElement, initData: FormDataType) {
    const elements = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[name]')
    elements.forEach((el) => {
        const val = initData[el.name]
        if (val !== undefined) {
            serializeFormValue(el, val)
        }
    })
}

export function resetFormValues(form: HTMLElement) {
    const elements = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[name]')
    elements.forEach((el) => {
        serializeFormValue(el, "")
    })
}

export function parseFormValue(
    el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    root?: HTMLElement
): TypedValue {
    if (el instanceof HTMLSelectElement && el.multiple) {
        return Array.from(el.selectedOptions).map(o => o.value)
    }

    if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox') {
            if (!el.name) return null

            // Check for multiple checkboxes with the same name
            const group = (root || el.ownerDocument).querySelectorAll<HTMLInputElement>(
                `input[type="checkbox"][name="${el.name}"]`
            )

            if (group.length > 1) {
                return Array.from(group)
                    .filter(input => input.checked)
                    .map(input => input.value)
            } else {
                return el.checked
            }
        }

        if (el.type === 'radio') {
            return el.checked ? el.value : null
        }

        if (el.type === 'number') {
            return isNaN(Number(el.value)) ? null : Number(el.value)
        }

        return el.value
    }

    return el.value
}

export function serializeFormValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: TypedValue): void {
    if (el instanceof HTMLSelectElement && el.multiple && Array.isArray(value)) {
        if (value.every(v => typeof v === 'string')) {
            const options = Array.from(el.options)
            for (const option of options) {
                option.selected = value.includes(option.value)
            }
        }
        return
    }
    if (el instanceof HTMLInputElement) {
        switch (el.type) {
            case 'checkbox':
                el.checked = Array.isArray(value) ? value.includes(el.value) : Boolean(value)
                return
            case 'radio':
                el.checked = el.value === value
                return
            case 'number':
                el.value = value != null ? String(value) : ''
                return
            default:
                el.value = value != null ? String(value) : ''
                return
        }
    }
    el.value = value != null ? String(value) : ''
}
