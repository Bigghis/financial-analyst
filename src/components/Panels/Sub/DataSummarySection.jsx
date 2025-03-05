export function DataSummarySection({ title, children }) {
    return (
        <div className="data-summary-section">
            <h3 className="section-title">{title}</h3>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
} 