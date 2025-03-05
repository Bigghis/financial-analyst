import { useEffect, useState } from 'react';
import { BaseFinancialTable } from './BaseFinancialTable';
import { NumberCell, PercentCell, TooltipCell } from './Cells/Cells';
import { useSettings } from '../../context/SettingsContext';
import { 
  getEbitda, 
  getEbitdaMargin, 
  getEbt, 
  getGrossMargin, 
  getOperatingExpenses, 
  getOperatingMargin,
  getEffectiveTaxRate,
  verticalCommonAnalysisLogic
} from '../../utilities/formula/income';
import { getDateHeader } from '../../utilities/locale';

const settingOptions = [
  {
    id: 'operations',
    groupLabel: 'Operations',
    options: [
      { value: 0, label: 'Hide All', default: true },
      { value: 1, label: 'Show Adjacent' }
    ]
  },
  {
    id: 'vertical',
    groupLabel: 'Vertical Analysis',
    options: [
      { value: 'Total Revenue', label: 'Total Revenue' },
      { value: 'Cost Of Revenue', label: 'Cost of Goods Sold (COGS)' },
      { value: 'Operating Expense', label: 'Operating Expense' },
      { value: 'EBITDA', label: 'EBITDA' },
      { value: 'Net Income', label: 'Net Income' }
    ]
  },
  {
    id: 'horizontal',
    groupLabel: 'Horizontal Analysis',
    options: ['revenue', 'expenses', 'gains', 'losses', 'net income']
  }
];

const highlightedMetrics = [
  {
    operands: ["Total Revenue", "Cost Of Revenue"],
    result: "Gross Profit",
    operator: "−",
    type: "adjacent"
  },
  {
    operands: ["Selling General And Administration", "Selling And Marketing Expense", "Interest Expense"],
    result: "Operating Expense", 
    operator: "+",
    type: "adjacent"
  },
  {
    operands: ["EBIT", "Reconciled Depreciation"],
    result: "EBITDA",
    operator: "+",
    type: "adjacent"
  },
  {
    operands: ["Tax Provision", "EBT"],
    result: "Effective Tax Rate",
    operator: "/",
    type: "adjacent"
  }
]

const excludeData = [
  "__separator__",
  "Gross Margin",
  "Operating Margin",
  "EBITDA Margin",
  "Effective Tax Rate",
  "Basic Average Shares",
  "Diluted Average Shares",
  "Basic EPS",
  "Diluted EPS"
];

export function IncomeStatementTable({ data = [], isLoading }) {
  const { period } = useSettings();
  const [incomeStatementData, setIncomeStatementData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mode, setMode] = useState(false);
  // const [pivot, setPivot] = useState(false);

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
    });
    setIncomeStatementData(transformedData);
    setTableData(transformedData);
  }, [data]);

  useEffect(() => {
    setMode("operations");
  }, [period]);

  const cellFormat = (props, unitFormat) => {
    const _unitFormat = !props.row.original.metric.includes('EPS') ? unitFormat : null;
    const cellContent = props.row.original.label.includes('%') ? (
      <PercentCell props={props} />
    ) : (
      <NumberCell props={props} unitFormat={_unitFormat} />
    );
    return cellContent;
  }
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
          if (mode && mode !== 'operations' /* && mode !== 'period'*/) {
            if (!excludeData.includes(props.row.original.metric)) {
              return <PercentCell props={props} />
            }
            return cellFormat(props, unitFormat);
          } 
          return cellFormat(props, unitFormat);
      },
        accessorFn: (row) => row[date], // Simplified accessor
        align: 'right',
      }))
    ];
  };

  // Define the rows we want to display and their order
  const metrics = [
    // Revenue
    { metric: "__separator__", label: "Revenue" },
    { metric: "Total Revenue", label: "Total Revenue"},
    { metric: "Cost Of Revenue", label: "Cost of Goods Sold (COGS)", tooltip: "Cost of Goods Sold (COGS)" },
    { metric: "Gross Profit", label: "Gross Profit", tooltip: "Total Revenue - Cost of Goods Sold (COGS)" },
    { 
      metric: "Gross Margin", 
      label: "Gross Margin %", 
      tooltip: "Gross Profit / Total Revenue",
      calculate: (date) => getGrossMargin(data[date])
    },
    { 
      metric: "Operating Margin", 
      label: "Operating Margin %", 
      tooltip: "Operating Income / Total Revenue",
      calculate: (date) => getOperatingMargin(data[date])
    },
    { metric: "__separator__", label: "Expenses" },
    // Expenses
    { metric: "Selling General And Administration", label: "Selling, General and Administrative Expenses"},
    { metric: "Selling And Marketing Expense", label: "Selling and Marketing Expense"},
    { metric: "Interest Expense", label: "Interest Expense"},
    { 
      metric: "Operating Expense", 
      label: "Total Operating Expense", 
      tooltip: "Selling, General and Administrative Expenses + Selling And Marketing Expense + Interest Expense",
      calculate: (date) => getOperatingExpenses(data[date])
    },
    { metric: "Other Non Operating Income Expenses", label: "Other Non Operating Income Expenses"},
    { metric: "Depreciation And Amortization In Income Statement", label: "Depreciation & Amortization Expense (D&A)"},
    // Gains and Losses
    { metric: "__separator__", label: "Gains and Losses" },

    { metric: "Operating Income", label: "Operating Income", tooltip: "Is a company's gross income less operating expenses and other business-related expenses, such as SG&A and depreciation."},
    { metric: "EBIT", label: "EBIT", tooltip: "Similar to Operating Income, but includes non-operating income, non-operating expenses, and other income.",
      //calculate: (date) => getEbit(data[date])
    },
    { metric: "Reconciled Depreciation", label: "Reconciled Depreciation"},
    { metric: "EBITDA",
      label: "EBITDA",
      tooltip: "EBIT + Depreciation & Amortization Expense (Reconciled Depreciation)",
      calculate: (date) => getEbitda(data[date])
    },
    { metric: "EBITDA Margin", label: "EBITDA Margin %", tooltip: "EBITDA / Total Revenue",
      calculate: (date) => getEbitdaMargin(data[date])
    },
    { metric: "Tax Provision", label: "Income Tax"},
    { metric: "EBT", label: "EBT", tooltip: "EBIT - Interest Expense",
      calculate: (date) => getEbt(data[date])
    },
    { metric: "Effective Tax Rate", label: "Effective Tax Rate %", tooltip: "Income Tax / EBT",
      calculate: (date) => getEffectiveTaxRate(data[date])
    },
    { metric: "__separator__", label: "Net Income" },

    
    { metric: "Net Income", label: "Net Income"},
    { metric: "Basic Average Shares", label: "Basic Average Shares", tooltip: "Average number of preferred shares that include the stock held by all the shareholders"},
    { metric: "Diluted Average Shares", label: "Diluted Average Shares", tooltip: "Average number of shares that would be outstanding if all convertible securities were exercised"},
    { metric: "Basic EPS", label: "Basic EPS", tooltip: "Net Income / Basic Average Shares (TODO:: compare with eps industry.."},
    { metric: "Diluted EPS", label: "Diluted EPS", tooltip: "Net Income / Diluted Average Shares"}
  ];


  const settingButtonCallback = (groupId, value, settings) => {

    console.log('income statement groupId = ', groupId);
    console.log('income statement value = ', value);
    if (value === 0 || value === '') {
      setMode(false);
      setTableData(incomeStatementData);
      return;
    }
    const [group, type] = groupId.split('-');
    setMode(group);
    
    // Handle period changes through context
    // if (group === 'period') {
    //   setPeriod(value);
    //   return;
    // }

    if (group === 'operations') {
      setTableData(incomeStatementData);
    }

    if (group === 'vertical') {
      setTableData(verticalCommonAnalysisLogic(tableData, value, excludeData));
    }

    // if (group !== mode) {
    //   if (!type) {
    //     setPivot(false);
    //   } else if (type === 'select' && value !== '0') { 
    //     setPivot(value);
    //   }
    // }
    console.log('tableData', tableData);
    // if (groupId === 'vertical') {
     // console.log('vertical', value);
    // }
  }

  return (
    <BaseFinancialTable
      data={tableData}
      columns={getColumns}
      showCounter={false}
      isLoading={isLoading}
      settingOptions={settingOptions}
      highlightedMetrics={highlightedMetrics}
      settingButtonCallback={settingButtonCallback}
    />
  );
}
