import { useState } from 'react';
import { BaseTable } from '../../Tables/BaseTable';
import Input from '../../UI/Input';
import Select from '../../UI/Select';

const futureYears = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1)
}));

const discountRates = Array.from({ length: 11 }, (_, i) => ({
    value: i * 0.05,
    label: `${i * 5}%`
}));

const growthRates = Array.from({ length: 21 }, (_, i) => ({
    value: i * 0.05,
    label: `${i * 5}%`
}));

export function DCF({ data }) {
    const [inputs, setInputs] = useState({
        cashFlow: 414713760,
        totalDebt: 33131000,
        sharesOutstanding: 113735000,
        futureYears: 5,
        discountRate: 0.10,
        growthRate: 0.15,
        terminalGrowthRate: 0.02
    });

    const [result, setResult] = useState({
        forecastPrice: 115.53,
        safetyMargin: 48.00,
        currentPrice: 78.21
    });

    const calculateDCF = () => {
        // Calculate future cash flows
        let futureCashFlows = [];
        let currentCashFlow = inputs.cashFlow;
        
        // Project cash flows for future years using growth rate
        for (let i = 1; i <= inputs.futureYears; i++) {
            currentCashFlow *= (1 + inputs.growthRate);
            futureCashFlows.push(currentCashFlow);
        }
        
        // Calculate terminal value using Gordon Growth Model
        const terminalValue = futureCashFlows[futureCashFlows.length - 1] * 
            (1 + inputs.terminalGrowthRate) / 
            (inputs.discountRate - inputs.terminalGrowthRate);
        
        // Add terminal value to future cash flows
        futureCashFlows.push(terminalValue);
        
        // Calculate present value of all cash flows
        let presentValue = 0;
        futureCashFlows.forEach((cashFlow, index) => {
            presentValue += cashFlow / Math.pow(1 + inputs.discountRate, index + 1);
        });
        
        // Subtract debt and divide by shares outstanding to get per share value
        const equityValue = presentValue - inputs.totalDebt;
        const perShareValue = equityValue / inputs.sharesOutstanding;
        
        // Calculate safety margin as percentage difference from current price
        const safetyMargin = ((perShareValue - result.currentPrice) / result.currentPrice) * 100;
        
        setResult({
            ...result,
            forecastPrice: perShareValue.toFixed(2),
            safetyMargin: safetyMargin.toFixed(2)
        });
    };

    const columns = (unitFormat) => [
        { 
            header: 'Stock',
            accessorKey: 'stock',
            align: 'left'
        },
        {
            header: 'Free Cash Flow',
            accessorKey: 'cashFlow',
            cell: ({ row }) => (row.original.cashFlow / 1000000).toFixed(2)
        },
        {
            header: 'Total Debt',
            accessorKey: 'totalDebt',
            cell: ({ row }) => (row.original.totalDebt / 1000000).toFixed(2)
        },
        {
            header: 'Shares Outstanding',
            accessorKey: 'sharesOutstanding',
            cell: ({ row }) => (row.original.sharesOutstanding / 1000000).toFixed(2)
        },
        {
            header: 'Future Years',
            accessorKey: 'futureYears'
        },
        {
            header: 'Discount Rate',
            accessorKey: 'discountRate',
            cell: ({ row }) => `${(row.original.discountRate * 100)}%`
        },
        {
            header: 'Growth Rate',
            accessorKey: 'growthRate',
            cell: ({ row }) => `${(row.original.growthRate * 100)}%`
        },
        {
            header: 'TV Growth Rate',
            accessorKey: 'terminalGrowthRate',
            cell: ({ row }) => `${(row.original.terminalGrowthRate * 100)}%`
        },
        {
            header: 'Price',
            accessorKey: 'currentPrice',
            cell: ({ row }) => `$${row.original.currentPrice}`
        },
        {
            header: 'Forecast Price',
            accessorKey: 'forecastPrice',
            cell: ({ row }) => `$${row.original.forecastPrice}`
        },
        {
            header: 'Safety Margin',
            accessorKey: 'safetyMargin',
            cell: ({ row }) => `${row.original.safetyMargin}%`
        }
    ];

    const tableData = [{
        stock: 'MLI',
        ...inputs,
        ...result
    }];

    return (
        <div className="valuation-method-container">
            <h2>Discounted Cash Flow Method</h2>
            
            <div className="main-row">
                    <Input
                        label="Cash Flow"
                        value={inputs.cashFlow}
                        onChange={(value) => setInputs({...inputs, cashFlow: value})}
                        type="number"
                    />
                    <Input
                        label="Total Debt"
                        value={inputs.totalDebt}
                        onChange={(value) => setInputs({...inputs, totalDebt: value})}
                        type="number"
                    />
                    <Input
                        label="Shares Outstanding"
                        value={inputs.sharesOutstanding}
                        onChange={(value) => setInputs({...inputs, sharesOutstanding: value})}
                        type="number"
                    />
                    <Select
                        label="Future Years"
                        options={futureYears}
                        value={inputs.futureYears}
                        selectedLabel={inputs.futureYears}
                        onChange={(value) => setInputs({...inputs, futureYears: value})}
                    />
                    <Select
                        label="Discount Rate"
                        options={discountRates}
                        value={inputs.discountRate}
                        selectedLabel={inputs.discountRate}
                        onChange={(value) => setInputs({...inputs, discountRate: value})}
                    />

                    <Select
                        label="Growth Rate"
                        options={growthRates}
                        value={inputs.growthRate}
                        selectedLabel={inputs.growthRate}
                        onChange={(value) => setInputs({...inputs, growthRate: value})}
                    />

                <Select
                    label="Terminal Growth Rate"
                    options={[0.02, 0.03, 0.04, 0.05].map(rate => (
                        <option key={rate} value={rate}>{(rate * 100)}%</option>
                    ))}
                    value={inputs.terminalGrowthRate}
                    selectedLabel={inputs.terminalGrowthRate}
                    onChange={(value) => setInputs({...inputs, terminalGrowthRate: value})}
                />
            </div>
                       

            <button 
                onClick={calculateDCF}
                className="action-button apply-button"
            >
                Calculate DCF
            </button>

            <BaseTable 
                data={tableData}
                columns={columns}
                showCounter={false}
            />
        </div>
    );
}