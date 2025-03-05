import { Tooltip } from '../../UI/Tooltip';  

export function DataSummaryRow({ label, value, tooltip }) {
    return (
        <div className="data-summary-row">
            <div className="label-container">
                {tooltip ? (
                    <Tooltip content={tooltip}>
                        <span className="label tooltip-trigger">{label}</span>
                    </Tooltip>
                ) : (
                    <span className="label">{label}</span>
                )}
            </div>
            <span className="value">{value}</span>
        </div>
    );
} 