import { createColumnHelper } from '@tanstack/react-table';
import { 
    CurrencyCell, 
    MarketCapCell, 
    NumberCell, 
    PercentCell,
    RegionCell, 
    TextCell,
    RangeCell
 } from './Cells/Cells';
import { BaseTable } from './BaseTable';

const columnHelper = createColumnHelper();

const columns = (unitFormat) => [
    columnHelper.accessor('region', {
        header: 'Region',
        cell: (props) => <RegionCell props={props} />,
    }),
    columnHelper.accessor('exchange', {
        header: 'Exchange',
        cell: (props) => <TextCell props={props} />,
    }),
    columnHelper.accessor('symbol', {
        header: 'Symbol',
        cell: (props) => <TextCell props={props} />,
    }),
    columnHelper.accessor('shortName', {
        header: 'Name',
        enableSorting: true,
        sortingFn: 'text',
        cell: (props) => <TextCell props={props} />,
    }),
    columnHelper.accessor('marketCap', {
        header: 'Market Cap',
        cell: (props) => <MarketCapCell props={props} unitFormat={unitFormat} />,
    }),
    columnHelper.accessor('regularMarketPrice', {
        header: 'Price',
        cell: (props) => <CurrencyCell props={props} />,
    }),
    columnHelper.accessor('trailingPE', {
        header: 'P/E (trailing)',
        cell: (props) => <NumberCell props={props} />,
    }),
    columnHelper.accessor('forwardPE', {
        header: 'P/E (fwd)',
        cell: (props) => <NumberCell props={props} />,
    }),
    columnHelper.accessor('dividendYield', {
        header: 'Dividend Yield',
        cell: (props) => <NumberCell props={props} />,
    }),
    columnHelper.accessor('twoHundredDayAverageChangePercent', {
        header: '200D Change',
        cell: (props) => <PercentCell props={props} />,
    }),
    columnHelper.accessor('fiftyTwoWeekChangePercent', {
        header: '52W Change',
        cell: (props) => <PercentCell props={props} />,
    }),
    columnHelper.accessor('regularMarketPrice', {
        id: "regularMarketPrice-52weekRange", // necessary to remove a warning
        header: '52 Week Range',
        cell: (props) => <RangeCell props={props} />,
    }),
  // ... other columns
//   "region": quote.get("region", ""),
//                     "exchange": quote.get("exchange", ""),
//                     "marketCap": quote.get("marketCap", ""),
//                     "trailingPE": quote.get("trailingPE", ""),
//                     "forwardPE": quote.get("forwardPE", ""),
//                     "regularMarketPrice": quote.get("regularMarketPrice", ""),
//                     "dividendYield": quote.get("dividendYield", ""),
//                     "currency": quote.get("currency", ""),
//                     "fiftyTwoWeekChangePercent": quote.get("fiftyTwoWeekChangePercent", ""),
//                     "twoHundredDayAverageChangePercent": quote.get("twoHundredDayAverageChangePercent", ""),
//                     "fiftyTwoWeekLow": quote.get("fiftyTwoWeekLow", ""),
//                     "fiftyTwoWeekHigh": quote.get("fiftyTwoWeekHigh", "")
];

export function ScreenerTable({ data = [], isLoading, params, onParamsChange }) {
  return (
    <BaseTable 
      data={data}
      columns={columns}
      title="Screener results"
      noDataMessage="No screener data available."
      pagination={true}
      serverSideSorting={false}
      params={params}
      onParamsChange={onParamsChange}
      isLoading={isLoading}
    />
  );
}

