class PropertyFormatter {
    static format(
        value?: unknown,
        postfix?: string,
    ): string {
        if (value === undefined || value === null) {
            return 'N/A'
        }
        return value.toString() + (postfix ? ` ${postfix}` : '')
    }

    static formatNumber(
        value: number | string | null = null,
        postfix?: string,
        precision?: number
    ): string {
        if (value === undefined || value === null) {
            return 'N/A'
        }
        if (typeof value === 'string') {
            value = parseFloat(value)
        }
        let valueString = precision !== undefined ? value.toFixed(precision) : value.toString()
        if (postfix) {
            valueString += ` ${postfix}`
        }
        return valueString
    }

    static formatBoolean(
        value: boolean | undefined | null,
        yes: string = 'Yes',
        no: string = 'No'
    ): string {
        if (value === undefined || value === null) {
            return 'N/A'
        }
        return value ? yes : no
    }
}

export default PropertyFormatter
