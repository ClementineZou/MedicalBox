import { ref } from 'vue'

export interface ValidationRule {
    (value: any): boolean | string
}

export interface ValidationRules {
    [key: string]: ValidationRule[]
}

export function useFormValidation<T extends Record<string, any>>(initialForm: T, rules: ValidationRules) {
    const errors = ref<Record<string, string>>({})

    const validateField = (field: string, value: any) => {
        const fieldRules = rules[field]
        if (!fieldRules) return true

        for (const rule of fieldRules) {
            const result = rule(value)
            if (result !== true) {
                errors.value[field] = typeof result === 'string' ? result : 'Invalid value'
                return false
            }
        }

        delete errors.value[field]
        return true
    }

    const validateForm = (form: T) => {
        let isValid = true
        errors.value = {}

        for (const field in rules) {
            if (!validateField(field, form[field])) {
                isValid = false
            }
        }

        return isValid
    }

    const clearErrors = () => {
        errors.value = {}
    }

    const setError = (field: string, message: string) => {
        errors.value[field] = message
    }

    return {
        errors,
        validateField,
        validateForm,
        clearErrors,
        setError
    }
}

// Common validators
export const validators = {
    required: (message = '此项必填') => (value: any) => {
        if (value === null || value === undefined || value === '') return message
        if (Array.isArray(value) && value.length === 0) return message
        return true
    },
    numeric: (message = '必须是数字') => (value: any) => {
        if (!value && value !== 0) return true // Allow empty if not required
        return !isNaN(parseFloat(value)) && isFinite(value) || message
    },
    positive: (message = '必须大于0') => (value: any) => {
        if (!value && value !== 0) return true
        return parseFloat(value) > 0 || message
    },
    nonNegative: (message = '不能小于0') => (value: any) => {
        if (!value && value !== 0) return true
        return parseFloat(value) >= 0 || message
    },
    minLength: (min: number, message?: string) => (value: any) => {
        if (!value) return true
        return String(value).length >= min || (message || `长度不能少于 ${min} 位`)
    },
    maxLength: (max: number, message?: string) => (value: any) => {
        if (!value) return true
        return String(value).length <= max || (message || `长度不能超过 ${max} 位`)
    }
}
