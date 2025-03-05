import { useEffect, useState } from 'react';
import { BaseFinancialTable } from './BaseFinancialTable';
import { NumberCell, PercentCell, TooltipCell } from './Cells/Cells';
import { 
  // getEbit, 
  getEbitda, 
  getEbitdaMargin, 
  getEbt, 
  getGrossMargin, 
  getOperatingExpenses, 
  getOperatingMargin,
  getEffectiveTaxRate 
} from '../../utilities/formula/income';
import { getDateHeader } from '../../utilities/locale';

const settingOptions = [
  {
    id: 'operations',
    groupLabel: 'Operations',
    options: [
      { value: 0, label: 'Hide All', default: true },
      { value: 1, label: 'Show Adjacent' },
      { value: 2, label: 'Show Level 1' },
      { value: 3, label: 'Show Level 2' }
    ]
  }
];

const highlightedMetrics = [
  {
    operands: [
        "Change In Receivables",
        "Change In Inventory",
        "Change In Prepaid Assets",
        "Change In Payables And Accrued Expense",
        "Change In Other Current Liabilities",
        "Change In Other Working Capital"
    ],
    result: "Change In Working Capital",
    operator: "+",
    type: "adjacent"
  },
  {
    operands: [
        "Net Income From Continuing Operations",
        "Operating Gains Losses",
        "Provision & Write of Assets",
        "Provisionand Write Offof Assets",
        "Depreciation Amortization Depletion",
        "Deferred Tax",
        "Asset Impairment Charge",
        "Stock Based Compensation",
        "Dividends Received Cfi",
        "Other Non Cash Items",
        "Change In Working Capital"
    ],
    result: "Cash Flow From Continuing Operating Activities",
    operator: "+",
    type: "distant",
    level: 1
  },
  {
    operands:[
        // "Capital Expenditure Reported",
        "Capital Expenditure",
        "Net PPE Purchase And Sale",
        "Net Business Purchase And Sale",
        "Net Other Investing Changes",
        "Net Investment Purchase And Sale",
        "Dividends Received CFI",
        "Net Other Investing Changes"
    ],
    result: "Cash Flow From Continuing Investing Activities",
    operator: "+",
    type: "distant",
    level: 1
  },
  {
    operands:[
        "Net Issuance Payments Of Debt",
        "Net Common Stock Issuance",
        "Cash Dividends Paid",
        "Proceeds From Stock Option Exercised",
        "Net Other Financing Charges",
    ],
    result: "Financing Cash Flow",
    operator: "+",
    type: "distant",
    level: 1
  },
  {
    operands: ["Cash Flow From Continuing Operating Activities", "Capital Expenditure"],
    result: "Free Cash Flow",
    operator: "-",
    type: "distant",
    level: 2
  }
]

export function CashFlowTable({ data = [], isLoading }) {
  // Move tableData to state
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Transform data into the format expected by BaseTable
    const transformedData = metrics.map(({ metric, label, calculate, tooltip }) => {
      if (metric === "__separator__") {
        return { 
          metric,
          label,
          isSeparatorRow: true 
        };
      }

      const row = {
        metric,
        label,
        tooltip
      };

      Object.keys(data).forEach(date => {
        if (calculate) {
          row[date] = calculate(date);        
        } else {
          row[date] = data[date][metric];
        }
      });

      return row;
    })      // Filter out rows that have no values (except separators)
    .filter(row => {
      if (row.isSeparatorRow) return true;
      const values = Object.keys(data).map(date => row[date]);
      return values.some(value => value !== null && value !== undefined);
    });

    setTableData(transformedData);
  }, [data]);

  // Function to get columns based on the dates in the data
  const getColumns = (unitFormat) => {
    const dates = Object.keys(data).sort();    
    return [
      {
        id: 'metric',
        header: 'Metric',
        accessorKey: 'metric',
        cell: (props) => <TooltipCell props={props} />,
        align: 'left',
      },
      ...dates.map(date => ({
        id: date,
        header: getDateHeader(date),
        cell: (props) => {
          const _unitFormat = !props.row.original.metric.includes('EPS') ? unitFormat : null;
          const cellContent = props.row.original.label.includes('%') ? (
            <PercentCell props={props} />
          ) : (
            <NumberCell props={props} unitFormat={_unitFormat} />
          );

          return cellContent
        },
        accessorFn: (row) => row[date], // Simplified accessor
        align: 'right',
      }))
    ];
  };

  // Define the rows we want to display and their order
  const metrics = [
    // Revenue
    { metric: "__separator__", label: "Operating" },
    { metric: "Net Income From Continuing Operations", label: "Net Income From Continuing Operations" },
    { metric: "Operating Gains Losses", label: "Operating Gains Losses" },
    { metric: "Provisionand Write Offof Assets", label: "Provision & Write of Assets" },
    { metric: "Depreciation Amortization Depletion", label: "Depreciation Amortization Depletion" },
    { metric: "Deferred Tax", label: "Deferred Tax" },
    { metric: "Asset Impairment Charge", label: "Asset Impairment Charge" },
    { metric: "Stock Based Compensation", label: "Stock Based Compensation" },
    { metric: "Other Non Cash Items", label: "Other Non Cash Items" },

    { metric: "Change In Receivables", label: "Change In Receivables" },
    { metric: "Change In Inventory", label: "Change In Inventory" },
    { metric: "Change In Prepaid Assets", label: "Change In Prepaid Assets" },
    { metric: "Change In Payables And Accrued Expense", label: "Change In Payables And Accrued Expense" },
    { metric: "Change In Other Current Liabilities", label: "Change In Other Current Liabilities" },
    { metric: "Change In Other Working Capital", label: "Change In Other Working Capital" },
    { metric: "Change In Working Capital", label: "Change In Working Capital" },
    { metric: "Cash Flow From Continuing Operating Activities", label: "Cash from Operating Activities" },

    { metric: "__separator__", label: "Investing" },
    // { metric: "Capital Expenditure Reported", label: "Capital Expenditure" },
    { metric: "Capital Expenditure", label: "Capital Expenditure" },
    { metric: "Net PPE Purchase And Sale", label: "Net PPE Purchase And Sale" },
    { metric: "Net Business Purchase And Sale", label: "Net Business Purchase And Sale" },
    { metric: "Net Investment Purchase And Sale", label: "Net Investment Purchase And Sale" },
    { metric: "Dividends Received Cfi", label: "Dividends Received CFI" },
    { metric: "Net Other Investing Changes", label: "Net Other Investing Changes" },
    { metric: "Cash Flow From Continuing Investing Activities", label: "Cash From Investing Activities" },


    { metric: "__separator__", label: "Financing" },
    { metric: "Net Issuance Payments Of Debt", label: "Net Issuance Payments Of Debt" },
    { metric: "Net Common Stock Issuance", label: "Net Common Stock Issuance" },
    { metric: "Cash Dividends Paid", label: "Cash Dividends Paid" },
    { metric: "Proceeds From Stock Option Exercised", label: "Proceeds From Stock Option Exercised" },
    { metric: "Net Other Financing Charges", label: "Net Other Financing Charges" },
    { metric: "Financing Cash Flow", label: "Cash From Financing Activities" },

    { metric: "__separator__", label: "Others" },
    { metric: "Net Cash Flow", label: "Net Cash Flow" },
    { metric: "Free Cash Flow", label: "Free Cash Flow", tooltip: "Cash from Operating Activities - Capital Expenditure" },

  ];

  return (
    <BaseFinancialTable
      data={tableData}
      columns={getColumns}
      showCounter={false}
      isLoading={isLoading}
      settingOptions={settingOptions}
      highlightedMetrics={highlightedMetrics}
    />
  );
}
