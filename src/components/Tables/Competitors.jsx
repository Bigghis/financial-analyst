import { createColumnHelper } from '@tanstack/react-table';
import { MarketCapCell, TextCell, PercentCell } from './Cells/Cells';
import { BaseTable } from './BaseTable';
import { useAsset } from '../../context/AssetContext';
import { useSettings } from '../../context/SettingsContext';

const columnHelper = createColumnHelper();

const columns = (unitFormat) => [
  columnHelper.accessor('symbol', {
    header: 'Symbol',
    headerAlign: 'center',
    align: 'center',
    cell: (props) => <TextCell props={props} />,
}),
  columnHelper.accessor('exchange', {
    header: 'Exchange',
    headerAlign: 'center',
    align: 'center',
    cell: (props) => <TextCell props={props} />,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    headerAlign: 'center',
    align: 'center',
    cell: (props) => <TextCell props={props} />,
  }),
  columnHelper.accessor('market weight', {
    header: 'Market Weight',
    align: 'center',
    cell: (props) => <PercentCell props={props} values={props.column} unitFormat={unitFormat} />,
  }),
  columnHelper.accessor('marketCap', {
    header: 'Market Cap',
    headerAlign: 'center',
    align: 'center',
    cell: (props) => <MarketCapCell props={props} unitFormat={unitFormat} />,
  }),
  columnHelper.accessor('rating', {
    header: 'Rating',
    headerAlign: 'center',
    align: 'center',
    cell: (props) => <TextCell props={props} />,
  })
]

export function CompetitorsTable({ data = [] }) {
  const { fetchAssetInfo } = useAsset();
  const { setShowScreener, setSearchValue } = useSettings();

  const handleRowClick = (rowData) => {
    // Update asset info
    fetchAssetInfo(rowData.symbol);
    
    // Update search value in the context
    setSearchValue(rowData.symbol);
    
    // Switch to search view
    setShowScreener(false);
  };

  return (
    <BaseTable 
      columns={columns}
      data={data}
      title="Competitors"
      noDataMessage="No competitor data available."
      showCounter={false}
      onRowClick={handleRowClick}
    />
  );
}
