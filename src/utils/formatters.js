
// Date Formatters
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC' // Ensure consistency if data comes as UTC
        });
    } catch (e) {
        return dateString;
    }
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
            // timeZone: 'UTC' // Usually backend returns UTC ISO, browser converts to local
        });
    } catch (e) {
        return dateString;
    }
};

// Carteirinha Helpers
// Standard: 0064.8000.400948.00-5 (21 chars)
// Structure: 4 digits + '.' + 4 digits + '.' + 6 digits + '.' + 2 digits + '-' + 1 digit

export const maskCarteirinha = (value) => {
    if (!value) return '';

    // 1. Remove non-digits
    const digits = value.replace(/\D/g, '');

    // 2. Limit to 17 digits (total without separators)
    const truncated = digits.slice(0, 17);

    // 3. Apply formatting
    let result = '';

    if (truncated.length > 0) {
        result = truncated.slice(0, 4);
    }
    if (truncated.length > 4) {
        result += '.' + truncated.slice(4, 8);
    }
    if (truncated.length > 8) {
        result += '.' + truncated.slice(8, 14);
    }
    if (truncated.length > 14) {
        result += '.' + truncated.slice(14, 16);
    }
    if (truncated.length > 16) {
        result += '-' + truncated.slice(16, 17);
    }

    return result;
};

export const validateCarteirinha = (value) => {
    if (!value) return false;

    // Check total length with mask
    if (value.length !== 21) return false;

    // Check specific separators
    // 0000.0000.000000.00-0
    //     ^    ^      ^  ^
    // 012345678901234567890
    if (value[4] !== '.') return false;
    if (value[9] !== '.') return false;
    if (value[16] !== '.') return false;
    if (value[19] !== '-') return false;

    // Check if others are digits
    const digitsOnly = value.replace(/[\.\-]/g, '');
    if (digitsOnly.length !== 17) return false;
    if (!/^\d+$/.test(digitsOnly)) return false;

    return true;
};
