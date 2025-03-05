import { useMemo } from 'react';

const MARKET_CAP_CATEGORIES = [
    { name: 'Mega', threshold: 200000, color: '#22c55e' },  // Green
    { name: 'Large', threshold: 10000, color: '#84cc16' },  // Light green
    { name: 'Mid', threshold: 2000, color: '#eab308' },     // Yellow
    { name: 'Small', threshold: 300, color: '#f97316' },    // Orange
    { name: 'Micro', threshold: 50, color: '#ef4444' },     // Red
    { name: 'Nano', threshold: 0, color: '#dc2626' },       // Dark red
];

function getCategoryDescription(categoryName) {
    switch (categoryName) {
        case 'Mega':
            return '($200bln and more)';
        case 'Large':
            return '($10bln to $200bln)';
        case 'Mid':
            return '($2bln to $10bln)';
        case 'Small':
            return '($300mln to $2bln)';
        case 'Micro':
            return '($50mln to $300mln)';
        case 'Nano':
            return '(under $50mln)';
        default:
            return '';
    }
}

export function generateMarketCapTooltip() {
    return MARKET_CAP_CATEGORIES.map(cat => {
        const description = getCategoryDescription(cat.name);
        return `${cat.name} ${description}`;
    }).join('\n');
}

export function MarketCapCategory({ marketCap }) {
    const category = useMemo(() => {
        // Convert to millions for easier comparison
        if (marketCap) {
            const capInMillions = marketCap / 1000000;
            return MARKET_CAP_CATEGORIES.find(cat => capInMillions >= cat.threshold) || MARKET_CAP_CATEGORIES[MARKET_CAP_CATEGORIES.length - 1];
        }
        return "-"
    }, [marketCap]);

    return (
        <div className="market-cap-category">
            <span 
                className="category-label"
                style={{ color: category.color }}
            >
                {category.name}
            </span>
        </div>
    );
}
