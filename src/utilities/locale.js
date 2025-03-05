export function getDateHeader(date) {
    return new Date(date).toLocaleDateString(navigator.language, { month: 'numeric', day: 'numeric', year: 'numeric' });
}