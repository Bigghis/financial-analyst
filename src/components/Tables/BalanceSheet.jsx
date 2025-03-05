import { useEffect, useState } from 'react';
import { BaseFinancialTable } from './BaseFinancialTable';
import { NumberCell, TooltipCell } from './Cells/Cells';
import { 
  getTotalCashAndShortTermInvestments,
} from '../../utilities/formula/balance';
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
        operands: ["Cash And Cash Equivalents", "Other Short Term Investments"],
        result: "Total Cash And Short Term Investments",
        operator: "+",
        type: "adjacent"
    },
   {
      operands: ["Gross Accounts Receivable", "Allowance For Doubtful Accounts Receivable", "Loans Receivable", "Taxes Receivable", "Other Receivables"], 
      result: "Receivables",
      operator: "+",
      type: "adjacent"
    },

    {
      operands: ["Raw Materials", "Work In Process", "Finished Goods", "Other Inventories", "Inventories Adjustments Allowances"],
      result: "Inventory",
      operator: "+",
      type: "adjacent"
    },
    
    {
      operands:["Gross PPE","Accumulated Depreciation"],
      result: "Net PPE",
      operator: "+",
      type: "adjacent"
    },
    {
      operands: ["Current Debt", "Current Capital Lease Obligation", "Other Current Borrowings"],
      result: "Current Debt And Capital Lease Obligation",
      operator: "+",
      type: "adjacent"
    },
    {
      operands: ["Long Term Debt", "Long Term Capital Lease Obligation"],
      result: "Long Term Debt And Capital Lease Obligation",
      operator: "+",
      type: "adjacent"
    },
    {
      operands: ["Common Stock", "Additional Paid In Capital", "Retained Earnings", "Treasury Stock", "Other Equity Adjustments", "Other Equity Interest", "Minority Interest"],
      result: "Total Equity Gross Minority Interest",
      operator: "+",
      type: "adjacent"
    },
   {
      operands: [
        "Total Cash And Short Term Investments",
        "Receivables",
        "Inventory",
        "Prepaid Assets",
        "Hedging Assets Current",
        "Restricted Cash",
        "Other Current Assets"
      ],
      result: "Current Assets", 
      operator: "+",
      type: "distant",
      level: 1
    },
    {
      operands: ["Net PPE", "Investments And Advances", "Goodwill", "Other Intangible Assets", "Non Current Deferred Assets","Non Current Note Receivables", "Other Non Current Assets"],
      type: "distant",
      level: 1,
      operator: "+",
      result: "Total Non Current Assets"
    },
    {
      operands: ["Current Assets", "Total Non Current Assets"],
      result: "Total Assets",
      operator: "+",
      type: "distant",
      level: 2
      
    },
    {
      operands: [
        "Payables And Accrued Expenses",
        "Current Accrued Expenses",
        "Current Debt And Capital Lease Obligation",
        "Current Deferred Liabilities",
        "Current Provisions",
        "Pensionand Other Post Retirement Benefit Plans Current",
        "Other Current Liabilities"
      ],
      level: 1,
      type: "distant",
      operator: "+",
      result: "Current Liabilities",
    },
    {
      operands: ["Long Term Debt And Capital Lease Obligation", "Non Current Deferred Liabilities", "Employee Benefits", "Long Term Provisions", "Preferred Securities Outside Stock Equity", "Other Non Current Liabilities"],
      result: "Total Non Current Liabilities Net Minority Interest",
      operator: "+",
      type: "distant",
      level: 1
    },
    {
      operands: ["Current Liabilities", "Total Non Current Liabilities Net Minority Interest"],
      result: "Total Liabilities Net Minority Interest",
      operator: "+",
      type: "distant",
      level: 2
    }

]

export function BalanceSheetTable({ data = [], isLoading }) {
  // Move tableData to state
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Transform data into the format expected by BaseTable
    const transformedData = metrics
      .map(({ metric, label, calculate, tooltip }) => {
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
      })
      // Filter out rows that have no values (except separators)
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
        cell: (props) => <NumberCell props={props} unitFormat={unitFormat} />,
        accessorFn: (row) => row[date], // Simplified accessor
        align: 'right',
      }))
    ];
  };

  // Define the rows we want to display and their order
  const metrics = [
 
    { metric: "__separator__", label: "Assets" },
    { metric: "Cash And Cash Equivalents", label: "Cash And Cash Equivalents" },
    { metric: "Other Short Term Investments", label: "Other Short Term Investments" },
    { metric: "Total Cash And Short Term Investments", label: "Total Cash And Short Term Investments",
      calculate: (date) => getTotalCashAndShortTermInvestments(data[date])
     },


    { metric: "Gross Accounts Receivable", label: "Gross Accounts Receivable" },
    // { metric: "Accounts Receivable", label: "Accounts Receivable" },
    { metric: "Allowance For Doubtful Accounts Receivable", label: "Allowance For Doubtful Accounts Receivable" },
    { metric: "Taxes Receivable", label: "Taxes Receivable" },
    { metric: "Loans Receivable", label: "Loans Receivable" },
    { metric: "Other Receivables", label: "Other Receivables" },
    { metric: "Receivables", label: "Receivables" },


    { metric: "Raw Materials", label: "Raw Materials" },
    { metric: "Work In Process", label: "Work In Process" },
    { metric: "Finished Goods", label: "Finished Goods" },
    { metric: "Other Inventories", label: "Other Inventories" },
    { metric: "Inventories Adjustments Allowances", label: "Inventories Adjustments Allowances" },
    { metric: "Inventory", label: "Inventory" },


    { metric: "Prepaid Assets", label: "Prepaid Assets" },
    { metric: "Hedging Assets Current", label: "Hedging Assets Current" },
    { metric: "Other Current Assets", label: "Other Current Assets" },
    { metric: "Restricted Cash", label: "Restricted Cash" },

    { metric: "Current Assets", label: "Current Assets" },


    { metric: "Gross PPE", label: "Gross PPE" },
    { metric: "Accumulated Depreciation", label: "Accumulated Depreciation" },
    { metric: "Net PPE", label: "Net PPE" },
    { metric: "Investments And Advances", label: "Investments And Advances" },
    { metric: "Goodwill", label: "Goodwill" },
    { metric: "Other Intangible Assets", label: "Other Intangible Assets" },
    { metric: "Non Current Deferred Assets", label: "Non Current Deferred Assets" },
    { metric: "Non Current Note Receivables", label: "Non Current Note Receivables" },
    { metric: "Other Non Current Assets", label: "Other Non Current Assets" },
    { metric: "Total Non Current Assets", label: "Total Non Current Assets" },

    { metric: "Total Assets", label: "Total Assets" },


    { metric: "__separator__", label: "Liabilities" },
    { metric: "Payables And Accrued Expenses", label: "Payables And Accrued Expenses" },

    { metric: "Current Debt", label: "Current Debt" },
    { metric: "Current Capital Lease Obligation", label: "Current Capital Lease Obligation" },
    // { metric: "Other Current Borrowings", label: "Other Current Borrowings" },
    { metric: "Current Debt And Capital Lease Obligation", label: "Current Debt And Capital Lease Obligation" },

    { metric: "Current Deferred Liabilities", label: "Current Deferred Liabilities" },
    { metric: "Current Provisions", label: "Current Provisions" },
    { metric: "Pensionand Other Post Retirement Benefit Plans Current", label: "Pensionand Other Post Retirement Benefit Plans Current" },
    { metric: "Other Current Liabilities", label: "Other Current Liabilities" },
    { metric: "Current Liabilities", label: "Current Liabilities" },

    { metric: "Long Term Debt", label: "Long Term Debt" },
    { metric: "Long Term Capital Lease Obligation", label: "Long Term Capital Lease Obligation" },
    { metric: "Long Term Debt And Capital Lease Obligation", label: "Long Term Debt And Capital Lease Obligation" },

    { metric: "Non Current Deferred Liabilities", label: "Non Current Deferred Liabilities" },
    { metric: "Long Term Provisions", label: "Long Term Provisions" },
    { metric: "Employee Benefits", label: "Employee Benefits" },
    
    { metric: "Preferred Securities Outside Stock Equity", label: "Preferred Securities Outside Stock Equity" },
    // { metric: "Non Current Pension And Other Postretirement Benefit Plans", label: "Non Current Pension And Other Postretirement Benefit Plans" },
    { metric: "Other Non Current Liabilities", label: "Other Non Current Liabilities" },
    { metric: "Total Non Current Liabilities Net Minority Interest", label: "Total Non Current Liabilities Net Minority Interest" },
    { metric: "Total Liabilities Net Minority Interest", label: "Total Liabilities Net Minority Interest" },
    
    
    { metric: "__separator__", label: "Equity" },

    { metric: "Common Stock", label: "Common Stock" },
    { metric: "Additional Paid In Capital", label: "Additional Paid In Capital" },
    { metric: "Retained Earnings", label: "Retained Earnings" },
    { metric: "Treasury Stock", label: "Treasury Stock",
      calculate: (date) => -data[date]["Treasury Stock"]
    },
    { metric: "Other Equity Adjustments", label: "Other Equity Adjustments" },
    { metric: "Other Equity Interest", label: "Other Equity Interest" },
    { metric: "Minority Interest", label: "Minority Interest" },
    { metric: "Total Equity Gross Minority Interest", label: "Total Equity Gross Minority Interest" },
    { metric: "Total Equity", label: "Total Equity" },

    { metric: "__separator__", label: "Others" },
    { metric: "Total Capitalization", label: "Total Capitalization" },
    { metric: "Stockholders Equity", label: "Stockholders Equity" },
    { metric: "Treasury Shares Number", label: "Treasury Shares Number" },
    { metric: "Ordinary Shares Number", label: "Ordinary Shares Number" },
    { metric: "Tangible Book Value", label: "Tangible Book Value" },
    { metric: "Net Tangible Assets", label: "Net Tangible Assets" },
    { metric: "Capital Lease Obligations", label: "Capital Lease Obligations" },
    { metric: "Total Debt", label: "Total Debt" },
    { metric: "Net Debt", label: "Net Debt", tooltip: "Total Debt - Total Cash And Short Term Investments" },
    { metric: "Buildings And Improvements", label: "Buildings And Improvements" },
    { metric: "Land And Improvements", label: "Land And Improvements" },
    { metric: "Construction In Progress", label: "Construction In Progress" },
    { metric: "Other Properties", label: "Other Properties" },
    
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
