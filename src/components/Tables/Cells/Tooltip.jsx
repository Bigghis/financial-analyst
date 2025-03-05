import { Tooltip } from '../../UI/Tooltip';

export function TooltipCell({ props }) {
    const { label, tooltip} = props.row.original;

    if (!label) return <span>-</span>;

    return (
        <div className="tooltip-container">
            {tooltip ? (
                <Tooltip content={tooltip}>
                    <span className="label tooltip-trigger">{label}</span>
                </Tooltip>
            ) : (
                <span className="label">{label}</span>
            )}
        </div>
    )
}
  