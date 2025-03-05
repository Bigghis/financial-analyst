import { formatNumber, toLocaleString } from '../../../utilities/numbers';

export function RatioCell({ props, unitFormat, measure="x" }) {
    let value = props.getValue();

    if (!value && value !== 0) return <span>-</span>;

    const absValue = Math.abs(value);
    
    if (unitFormat) {
        const formattedValue = formatNumber(absValue, unitFormat);
        if (formattedValue === '-') return <span>-</span>;
        return value < 0 
        ? <span style={{color: 'red'}}>{`(${formattedValue}${measure})`}</span> 
        : <span>{formattedValue}{measure}</span>
    }
    return <span>{toLocaleString(value, 1)}{measure}</span>
  }
  