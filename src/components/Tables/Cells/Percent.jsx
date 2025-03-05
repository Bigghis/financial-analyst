import { toLocaleString } from '../../../utilities/numbers';

export function PercentCell({ props }) {
    const value = props.getValue();
    if (!value) return <span>-</span>;
    return <span>{toLocaleString(value, 2)}%</span>
  }
  