export function getValue(data, key) {
    if (!data) {
        return 0;
    }
    return data[key] || 0;
}
