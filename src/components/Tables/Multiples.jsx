import { useEffect, useState } from 'react';
import { BaseFinancialTable } from './BaseFinancialTable';
import { NumberCell, RatioCell, PercentCell, TooltipCell } from './Cells/Cells';
import { useSettings } from '../../context/SettingsContext';
import { 
  calculateROA, 
  calculateROE, 
  calculateROIC, 
  calculateROCE,
  calculatePE,
  calculatePB,
  calculateCurrentRatio,
  calculateQuickRatio,
  calculateDaysSalesOutstanding,
  calculateDebtToEquity,
  calculateDebtToAsset,
  calculateEquityRatio,
  calculateDaysInventoryOutstanding,
  calculateInventoryTurnoverRatio,
  calculateAssetTurnoverRatio
} from '../../utilities/formula/multiples';

import { getDateHeader } from '../../utilities/locale';


export function MultiplesTable({ incomeData = [], balanceData = [], historicalData = [] }) {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { period } = useSettings();

  // console.log('incomeData', incomeData);
  // console.log('balanceData', balanceData);
  useEffect(() => {
    // Check if all required data is available and not empty
    if (!incomeData || !balanceData || !historicalData || 
        Object.keys(incomeData).length === 0 || 
        Object.keys(balanceData).length === 0 || 
        historicalData.length === 0) {
      console.log("MultiplesTable useEffect");
      setIsLoading(true);
     // return;
    }

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

      Object.keys(incomeData).forEach(date => {
        if (calculate) {
          row[date] = calculate(date);        
        }
      });

      return row;
    });
    setTableData(transformedData);
    setIsLoading(false);
  }, [incomeData, balanceData, historicalData]);

  const cellFormat = (props, unitFormat) => {
    const _unitFormat = !props.row.original.metric.includes('EPS') ? unitFormat : null;
    if (props.row.original.label.includes('%')) {
      return <PercentCell props={props} />
    }
    if (props.row.original.label.includes('Ratio')) {
      return <RatioCell props={props} unitFormat={_unitFormat} measure="x" />
    }
    if (props.row.original.label.includes('Days')) {
      return <RatioCell props={props} unitFormat={_unitFormat} measure="d" />
    }
    return <NumberCell props={props} unitFormat={_unitFormat} />
  }
  // Function to get columns based on the dates in the data
  const getColumns = (unitFormat) => {
    const dates = Object.keys(incomeData).sort();    
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
        cell: (props) => cellFormat(props, unitFormat),
        accessorFn: (row) => row[date],
        align: 'right',
      }))
    ];
  };

  // Define the rows we want to display and their order
  const metrics = [
    { metric: "__separator__", label: "Returns" },
    { 
      metric: "ROA", 
      label: "Return on Assets (ROA) %", 
      tooltip: "Net Income / Total Assets",
      calculate: (date) => calculateROA(incomeData[date], balanceData[date])
    },
    { 
      metric: "ROE", 
      label: "Return on Equity (ROE) %", 
      tooltip: "Net Income / Total Equity",
      calculate: (date) => calculateROE(incomeData[date], balanceData[date])
    },
    { 
      metric: "ROIC", 
      label: "Return on Invested Capital (ROIC) %", 
      tooltip: "Net Income / Invested Capital",
      calculate: (date) => calculateROIC(incomeData[date], balanceData[date])
    },
    { 
      metric: "ROCE", 
      label: "Return on Capital Employed (ROCE) %", 
      tooltip: "Net Income / Capital Employed",
      calculate: (date) => calculateROCE(incomeData[date], balanceData[date])
    },
    { metric: "__separator__", label: "Valuation" },
    { metric: "P/E", label: "Price to Earnings Ratio (P/E)", tooltip: "Price / Earnings per Share (EPS)",
      calculate: (date) => calculatePE(incomeData, historicalData, date, period === 'QUARTERLY')
    },
    { metric: "P/B", label: "Price to Book Ratio (P/B)", tooltip: "Price / Book Value per Share",
      calculate: (date) => calculatePB(incomeData, balanceData, historicalData, date)
    },


    { metric: "__separator__", label: "Short Term Liquidity" },
    
    { metric: "Current Ratio", label: "Current Ratio", tooltip: "Current Assets / Current Liabilities",
      calculate: (date) => calculateCurrentRatio(balanceData[date])
    },
    {
      metric: "Quick Ratio",
      label: "Quick Ratio",
      tooltip: "Current Assets - Inventory / Current Liabilities",
      calculate: (date) => calculateQuickRatio(balanceData[date])
    },
    {
      metric: "Days Sales Outstanding",
      label: "Days Sales Outstanding",
      tooltip: "Accounts Receivable / Revenue",
      calculate: (date) => calculateDaysSalesOutstanding(incomeData[date], balanceData[date], period === 'QUARTERLY')
    },

    { metric: "__separator__", label: "Long Term Solvency" },
    
    { metric: "Equity Ratio", label: "Equity Ratio", tooltip: "Shareholders Equity / Total Assets, above > 1.0 is good..",
      calculate: (date) => calculateEquityRatio(balanceData[date])
    },
    { metric: "Debt to Equity", label: "Debt to Equity %", tooltip: "Total Debt / Total Equity",
      calculate: (date) => calculateDebtToEquity(balanceData[date])
    },
   { metric: "Debt to Asset", label: "Debt to Asset %", tooltip: "Total Debt / Total Assets",
      calculate: (date) => calculateDebtToAsset(balanceData[date])
    },
    // { metric: "Interest Coverage Ratio", label: "Interest Coverage Ratio", tooltip: "EBIT / Interest Expense",
    //   calculate: (date) => calculateInterestCoverageRatio(incomeData[date])
    // },
    /*{ metric: "Debt to EBITDA", label: "Debt to EBITDA", tooltip: "Total Debt / EBITDA",
      calculate: (date) => calculateDebtToEbitda(incomeData[date], balanceData[date])
    },
    { metric: "Debt to EBIT", label: "Debt to EBIT", tooltip: "Total Debt / EBIT",
      calculate: (date) => calculateDebtToEbit(incomeData[date], balanceData[date])
    },*/
    { metric: "__separator__", label: "Efficiency" },
    {
      metric: "Asset Turnover Ratio",
      label: "Asset Turnover Ratio",
      tooltip: "Total Revenue / Total Assets, shows how efficiently a company uses its assets to generate revenue. A higher asset turnover ratio means the company's management is using its assets more efficiently",
      calculate: (date) => calculateAssetTurnoverRatio(incomeData, balanceData, date)
    },
    { 
      metric: "Days Inventory Outstanding",
      label: "Days Inventory Outstanding",
      tooltip: "Inventory / Cost of Goods Sold, is the average number of days it takes for a firm to sell off inventory.",
      calculate: (date) => calculateDaysInventoryOutstanding(incomeData[date], balanceData[date], period === 'QUARTERLY')
    },
    { 
      metric: "Inventory Turnover Ratio",
      label: "Inventory Turnover Ratio",
      tooltip: "Cost of Goods Sold / Inventory, show how many times a company turned over its inventory in a given period.",
      calculate: (date) => calculateInventoryTurnoverRatio(incomeData[date], balanceData[date], period === 'QUARTERLY')
    },    
  ];


  return (
    <BaseFinancialTable
      data={tableData}
      columns={getColumns}
      showCounter={false}
      isLoading={isLoading}
    />
  );
}
