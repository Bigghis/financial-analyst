import { regionMapping } from '../../../utilities/utils';

export function RegionCell({ props }) {
    const value = props.getValue();
    const region = regionMapping[value.toLowerCase()];
    if (!value) return <span>-</span>;

    return <span title={region.name}>{region.flag}</span>
  }
  