import { formatNumber } from '../../../utilities/numbers';
import { MarketCapCategory } from '../../UI/MarketCapCategory';

export function MarketCapCell({ props, unitFormat }) {
    const value = props.getValue();
    if (!value && value !== 0) return <span>-</span>;

    const absValue = Math.abs(value);
    return (<div className="market-cap-info">
        <MarketCapCategory marketCap={absValue} />
        <span>{` (${formatNumber(absValue, unitFormat)} ${props.row.original.currency})`}</span>
    </div>)
  }
  