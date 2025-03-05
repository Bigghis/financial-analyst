import { toLocaleString } from '../../../utilities/numbers';

export function CurrencyCell({ props }) {
  const value = props.getValue();
  const currency = props.row.original.currency;


  if (!value && value !== 0) return '-';
  
  return (
    <span>
      {toLocaleString(value)} {currency}
    </span>
  );
}
