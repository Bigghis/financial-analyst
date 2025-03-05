import { toLocaleString } from '../../../utilities/numbers';

const RangeCell = ({ props }) => {
  const value = props.getValue();
  const row = props.row.original;
  const min = row.fiftyTwoWeekLow;
  const max = row.fiftyTwoWeekHigh;
  
  if (!value || !min || !max) return '-';

  // Calculate percentage position
  const range = max - min;
  const position = ((value - min) / range) * 100;

  // Format numbers
  const formattedValue = toLocaleString(value, 2);
  const formattedMin = toLocaleString(min, 2);
  const formattedMax = toLocaleString(max, 2);

  return (
    <div className="range-cell">
      <div className="range-container">
        <span className="min-value">{formattedMin}</span>
        <div className="range-bar-container">
          <div className="current-value-container" style={{ left: `${position}%` }}>
            {/*<span className="current-value">{formattedValue}</span>*/}
          </div>
          <div className="range-bar">
            <div 
              title={formattedValue}
              className="range-indicator" 
              style={{ left: `${position}%` }}
            />
          </div>
        </div>
        <span className="max-value">{formattedMax}</span>
      </div>
    </div>
  );
};

export { RangeCell }; 