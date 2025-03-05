import { formatNumber, toLocaleString } from '../../../utilities/numbers';

export function NumberCell({ props, unitFormat }) {
    let value = props.getValue();

    if (!value && value !== 0) return <span>-</span>;

    const absValue = Math.abs(value);
    
    if (unitFormat) {
        return value < 0 
        ? <span style={{color: 'red'}}>{`(${formatNumber(absValue, unitFormat)})`}</span> 
        : <span>{formatNumber(absValue, unitFormat)}</span>
    }
    return <span>{toLocaleString(value, 1)}</span>
  }
  