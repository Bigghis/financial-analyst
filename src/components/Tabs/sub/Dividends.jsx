import { useEffect, useMemo, useState } from 'react';
import { SimpleChart } from "../../Charts/SimpleChart";
import { MultiLineChart } from "../../Charts/MultiLineChart";
import { useAsset } from '../../../context/AssetContext';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const PRICES_TIME_FRAME = "max";

const DIVIDEND_STATES = {
    INITIAL: 'INITIAL',
    NO_DIVIDENDS: 'NO_DIVIDENDS',
    FETCHING_COMPETITORS: 'FETCHING_COMPETITORS',
    COMPETITORS_READY: 'COMPETITORS_READY',
    FETCHING_PRICES: 'FETCHING_PRICES',
    PRICES_READY: 'PRICES_READY',
    FETCHING_DIVIDENDS: 'FETCHING_DIVIDENDS',
    READY: 'READY',
    ERROR: 'ERROR'
};

export function Dividends({ data, isLoading }) {
    const { assetData, fetchAssetPrices, fetchDividends, fetchAssetCompetitors } = useAsset();
    const [allSymbols, setAllSymbols] = useState([]);
    const [dividendState, setDividendState] = useState(DIVIDEND_STATES.INITIAL);
    const storage = useLocalStorage('dividend_yields_');

    // Handle competitors fetching
    useEffect(() => {
        if (data?.data?.length === 0) {
            setDividendState(DIVIDEND_STATES.NO_DIVIDENDS);
        } else {
                if (dividendState === DIVIDEND_STATES.INITIAL && !assetData.competitors?.length) {
                    fetchAssetCompetitors();
                    setDividendState(DIVIDEND_STATES.FETCHING_COMPETITORS);
                } else if (dividendState === DIVIDEND_STATES.FETCHING_COMPETITORS && assetData.competitors?.length) {
                    setAllSymbols([assetData.symbol, ...assetData.competitors.map(competitor => competitor.symbol)]);
                    setDividendState(DIVIDEND_STATES.COMPETITORS_READY);
                }
        }
    }, [data, dividendState, assetData.competitors, fetchAssetCompetitors, assetData.symbol]);

    // Handle price fetching
    useEffect(() => {
        if (dividendState === DIVIDEND_STATES.COMPETITORS_READY && allSymbols.length > 0) {
            fetchAssetPrices(PRICES_TIME_FRAME, allSymbols);
            setDividendState(DIVIDEND_STATES.FETCHING_PRICES);
        } else if (dividendState === DIVIDEND_STATES.FETCHING_PRICES && assetData.historicalData) {
            setDividendState(DIVIDEND_STATES.PRICES_READY);
        }
    }, [dividendState, allSymbols, assetData.historicalData, fetchAssetPrices]);

    // Handle dividend fetching
    useEffect(() => {
        if (dividendState === DIVIDEND_STATES.PRICES_READY) {
            fetchDividends(allSymbols);
            setDividendState(DIVIDEND_STATES.FETCHING_DIVIDENDS);
        } else if (dividendState === DIVIDEND_STATES.FETCHING_DIVIDENDS && assetData.dividends) {
            setDividendState(DIVIDEND_STATES.READY);
        }
    }, [dividendState, allSymbols, assetData.dividends, fetchDividends]);

    const calculateDividendYields = useMemo(() => {
        // Try to get from cache first
        const cachedData = storage.get(assetData.symbol);
        if (cachedData) {
            return cachedData;
        }
        // If not in cache, calculate as before
        const mainSymbolDividends = assetData.dividends?.[assetData.symbol];
        if (!mainSymbolDividends?.data?.length) {
            return [];
        }

        const results = Object.entries(assetData.dividends).map(([symbol, dividendData]) => {
            const dividends = dividendData.data || [];

            if (dividends.length === 0 || assetData?.historicalData?.length === 0) {
                return { symbol, dataSeries: [] };
            }

            const dataSeries = dividends.map(dividend => {
                const dividendDate = new Date(dividend.date);
                const priceKey = `Close,${symbol}`;
                
                const priceOnDividendDate = assetData?.historicalData?.find(price => 
                    new Date(price.Date).toDateString() === dividendDate.toDateString()
                )?.[priceKey];

                if (!priceOnDividendDate) return null;

                const dividendYield = (dividend.amount * 4 / priceOnDividendDate) * 100;
                
                return {
                    date: dividend.date,
                    value: Number(dividendYield.toFixed(2))
                };
            }).filter(item => item !== null);

            return {
                symbol,
                dataSeries
            };
        });

        // Save results to cache
        storage.set(assetData.symbol, results);
        return results;
    }, [assetData.dividends, assetData.historicalData, assetData.symbol, storage]);

    const renderContent = () => {
        switch (dividendState) {
            case DIVIDEND_STATES.FETCHING_COMPETITORS:
                return <div>Loading competitor data...</div>;
            
            case DIVIDEND_STATES.FETCHING_PRICES:
                return <div>Loading price history...</div>;
            
            case DIVIDEND_STATES.FETCHING_DIVIDENDS:
                return <div>Loading dividend data...</div>;
            
            case DIVIDEND_STATES.NO_DIVIDENDS:
                return (
                    <div className="no-dividends-message">
                        <div>No dividend history available for {assetData.symbol}</div>
                        <small>This could mean the company doesn't pay dividends or hasn't paid dividends in the recent past.</small>
                    </div>
                );
            
            case DIVIDEND_STATES.ERROR:
                return <div>Error loading dividends data</div>;
            
            case DIVIDEND_STATES.READY:
                return (
                    <div>            
                        <div className="dividend-charts">
                            <h3>Historical Dividends</h3>
                            {assetData.dividends && Object.entries(assetData.dividends)
                                .filter(([symbol]) => symbol === assetData.symbol)
                                .map(([symbol, { data: dividends }]) => (
                                    <div key={symbol}>
                                        <h4>{symbol}</h4>
                                        <SimpleChart 
                                            data={dividends}
                                            showHoverInfo={true}
                                            showCrosshair={true}
                                            showHoverLabel={true}
                                            showYearOverYear={true}
                                            amountLabel="Dividend"
                                            chartType="histogram"
                                        />
                                    </div>
                                ))}
                        </div>

                        <div className="dividend-yields-table">
                            <h3>Dividend Yields</h3>
                            <MultiLineChart 
                                data={calculateDividendYields}
                                showHoverInfo={true}
                                mainSymbol={assetData.symbol}
                            />
                        </div>
                    </div>
                );
            
            default:
                return <div>Initializing...</div>;
        }
    };

    return renderContent();
}