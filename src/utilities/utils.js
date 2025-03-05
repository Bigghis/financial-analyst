
export const regionMapping = {
    ar: { name: "Argentina", flag: "🇦🇷" },
    at: { name: "Austria", flag: "🇦🇹" },
    au: { name: "Australia", flag: "🇦🇺" },
    be: { name: "Belgium", flag: "🇧🇪" },
    br: { name: "Brazil", flag: "🇧🇷" },
    ca: { name: "Canada", flag: "🇨🇦" },
    ch: { name: "Switzerland", flag: "🇨🇭" },
    cl: { name: "Chile", flag: "🇨🇱" },
    cn: { name: "China", flag: "🇨🇳" },
    cz: { name: "Czech Republic", flag: "🇨🇿" },
    de: { name: "Germany", flag: "🇩🇪" },
    dk: { name: "Denmark", flag: "🇩🇰" },
    ee: { name: "Estonia", flag: "🇪🇪" },
    eg: { name: "Egypt", flag: "🇪🇬" },
    es: { name: "Spain", flag: "🇪🇸" },
    fi: { name: "Finland", flag: "🇫🇮" },
    fr: { name: "France", flag: "🇫🇷" },
    gb: { name: "United Kingdom", flag: "🇬🇧" },
    gr: { name: "Greece", flag: "🇬🇷" },
    hk: { name: "Hong Kong", flag: "🇭🇰" },
    hu: { name: "Hungary", flag: "🇭🇺" },
    id: { name: "Indonesia", flag: "🇮🇩" },
    ie: { name: "Ireland", flag: "🇮🇪" },
    il: { name: "Israel", flag: "🇮🇱" },
    in: { name: "India", flag: "🇮🇳" },
    is: { name: "Iceland", flag: "🇮🇸" },
    it: { name: "Italy", flag: "🇮🇹" },
    jp: { name: "Japan", flag: "🇯🇵" },
    kr: { name: "South Korea", flag: "🇰🇷" },
    kw: { name: "Kuwait", flag: "🇰🇼" },
    lk: { name: "Sri Lanka", flag: "🇱🇰" },
    lt: { name: "Lithuania", flag: "🇱🇹" },
    lv: { name: "Latvia", flag: "🇱🇻" },
    mx: { name: "Mexico", flag: "🇲🇽" },
    my: { name: "Malaysia", flag: "🇲🇾" },
    nl: { name: "Netherlands", flag: "🇳🇱" },
    no: { name: "Norway", flag: "🇳🇴" },
    nz: { name: "New Zealand", flag: "🇳🇿" },
    pe: { name: "Peru", flag: "🇵🇪" },
    ph: { name: "Philippines", flag: "🇵🇭" },
    pk: { name: "Pakistan", flag: "🇵🇰" },
    pl: { name: "Poland", flag: "🇵🇱" },
    pt: { name: "Portugal", flag: "🇵🇹" },
    qa: { name: "Qatar", flag: "🇶🇦" },
    ro: { name: "Romania", flag: "🇷🇴" },
    ru: { name: "Russia", flag: "🇷🇺" },
    sa: { name: "Saudi Arabia", flag: "🇸🇦" },
    se: { name: "Sweden", flag: "🇸🇪" },
    sg: { name: "Singapore", flag: "🇸🇬" },
    sr: { name: "Serbia", flag: "🇷🇸" },
    th: { name: "Thailand", flag: "🇹🇭" },
    tr: { name: "Turkey", flag: "🇹🇷" },
    tw: { name: "Taiwan", flag: "🇹🇼" },
    us: { name: "United States", flag: "🇺🇸" },
    ve: { name: "Venezuela", flag: "🇻🇪" },
    vn: { name: "Vietnam", flag: "🇻🇳" },
    za: { name: "South Africa", flag: "🇿🇦" }
  };

// export const operators = {
//     gt: ">",
//     lt: "<",
//     eq: "=",
//     btwn: "btwn"
// }

export function createScreenerOptions(validMaps) {
    const options = {
        equity: {
            name: "Equity",
            filters: [
                {
                    name: "Region",
                    key: "region",
                    values: Object.entries(regionMapping).map(([key, region]) => ({
                        name: `${region.name} (${region.flag})`,
                        key: key
                    }))
                },
                {
                    name: "Exchanges",
                    key: "exchanges",
                    values: validMaps.exchanges
                },
                {
                    name: "Sector",
                    key: "sector",
                    values: validMaps.sector
                },
                {
                    name: "Peer Group",
                    key: "peer_group",
                    values: validMaps.peer_group
                }
            ]
        },
        price: {
            name: "Price",
            filters: [
                {
                    name: "EOD Price",
                    key: "eodprice"
                },
                {
                    name: "52 Week Percent Change",
                    key: "fiftytwowkpercentchange"
                },
                {
                    name: "Intraday Market Cap",
                    key: "intradaymarketcap"
                },
                {
                    name: "Intraday Price",
                    key: "intradayprice"
                },
                {
                    name: "Intraday Price Change",
                    key: "intradaypricechange"
                },
                {
                    name: "Last Close 52 Week High",
                    key: "lastclose52weekhigh.lasttwelvemonths"
                },
                {
                    name: "Last Close 52 Week Low",
                    key: "lastclose52weeklow.lasttwelvemonths"
                },
                {
                    name: "Last Close Market Cap",
                    key: "lastclosemarketcap.lasttwelvemonths"
                },
                {
                    name: "Percent Change",
                    key: "percentchange"
                }
            ]
        },
        trading: {
            name: "Trading",
            filters: [
                {
                    name: "Avg Daily Vol 3M",
                    key: "avgdailyvol3m"
                },
                {
                    name: "Beta",
                    key: "beta"
                },
                {
                    name: "Day Volume",
                    key: "dayvolume"
                },
                {
                    name: "EOD Volume",
                    key: "eodvolume"
                },
                {
                    name: "Pct Held Insider",
                    key: "pctheldinst"
                }
            ]
        },
        short: {
            name: "Short Interest",
            filters: [
                {
                    name: "Days to Cover",
                    tooltip: "The number of days it would take to cover the short interest of a stock based on the average daily volume over the past 30 days.",
                    key: "days_to_cover_short.value"
                },
                {
                    name: "Short Interest",
                    tooltip: "The total number of shares that have been sold short.",
                    key: "short_interest.value"
                },
                {
                    name: "Short Interest Percentage Change",
                    tooltip: "The percentage change in the short interest of a stock over the past 30 days.",
                    key: "short_interest_percentage_change.value"
                },
                {
                    name: "Short Percentage of Float",
                    tooltip: "The percentage of the float that is currently short.",
                    key: "short_percentage_of_float.value"
                },
                {
                    name: "Short Percentage of Shares Outstanding",
                    tooltip: "The percent of shares that investors are currently short on a particular stock.",
                    key: "short_percentage_of_shares_outstanding.value"
                }
            ]
        },
        valuation: {
            name: "Valuation",
            filters: [
                {
                    name: "Book Value Per Share",
                    key: "bookvalueshare.lasttwelvemonths"
                },
                {
                    name: "Last Close Market Cap Total Revenue",
                    key: "lastclosemarketcaptotalrevenue.lasttwelvemonths"
                },
                {
                    name: "Last Close Price Earnings",
                    key: "lastclosepriceearnings.lasttwelvemonths"
                },
                {
                    name: "Last Close Price Tangible Book Value",
                    key: "lastclosepricetangiblebookvalue.lasttwelvemonths"
                },
                {
                    name: "Last Close TEV Total Revenue",
                    key: "lastclosetevtotalrevenue.lasttwelvemonths"
                },
                {
                    name: "PEG Ratio 5Y",
                    key: "pegratio_5y"
                },
                {
                    name: "PE Ratio",
                    key: "peratio.lasttwelvemonths"
                },
                {
                    name: "Price Book Ratio (Quarterly)",
                    key: "pricebookratio.quarterly"
                }
            ]
        },
        profitability: {
            name: "Profitability",
            filters: [
                {
                    name: "Consecutive Years of Dividend Growth Count",
                    key: "consecutive_years_of_dividend_growth_count"
                },
                {
                    name: "Forward Dividend Per Share",
                    key: "forward_dividend_per_share"
                },
                {
                    name: "Forward Dividend Yield",
                    key: "forward_dividend_yield"
                },
                {
                    name: "Return on Assets",
                    key: "returnonassets.lasttwelvemonths"
                },
                {
                    name: "Return on Equity",
                    key: "returnonequity.lasttwelvemonths"
                },
                {
                    name: "Return on Total Capital",
                    key: "returnontotalcapital.lasttwelvemonths"
                }
            ]
        },
        leverage: {
            name: "Leverage",
            filters: [
                {
                    name: "EBITDA Interest Expense",
                    key: "ebitdainterestexpense.lasttwelvemonths"
                },
                {
                    name: "Last Close TEV EBIT",
                    key: "lastclosetevebit.lasttwelvemonths"
                },
                {
                    name: "Last Close TEV EBITDA",
                    key: "lastclosetevebitda.lasttwelvemonths"
                },
                {
                    name: "Last Close LT Debt Equity",
                    key: "ltdebtequity.lasttwelvemonths"
                },
                {
                    name: "Net Debt EBITDA",
                    key: "netdebtebitda.lasttwelvemonths"
                },
                {
                    name: "Total Debt EBITDA",
                    key: "totaldebtebitda.lasttwelvemonths"
                },
                {
                    name: "Total Debt Equity",
                    key: "totaldebtequity.lasttwelvemonths"
                }
            ]
        },
        liquidity: {
            name: "Liquidity",
            filters: [
                {
                    name: "Altman Z-Score Using the Average Stock Information for a Period",
                    key: "altmanzscoreusingtheaveragestockinformationforaperiod.lasttwelvemonths"
                },
                {
                    name: "Current Ratio",
                    key: "currentratio.lasttwelvemonths"
                },
                {
                    name: "Operating Cash Flow to Current Liabilities",
                    key: "operatingcashflowtocurrentliabilities.lasttwelvemonths"
                },
                {
                    name: "Quick Ratio",
                    key: "quickratio.lasttwelvemonths"
                }
            ]
        },
        income: {
            name: "Income Statement",
            filters: [
                {
                    name: "Basic EPS Continuing Operations",
                    key: "basicepscontinuingoperations.lasttwelvemonths"
                },
                {
                    name: "Diluted EPS 1Yr Growth",
                    key: "dilutedeps1yrgrowth.lasttwelvemonths"
                },
                {
                    name: "Diluted EPS Continuing Operations",
                    key: "dilutedepscontinuingoperations.lasttwelvemonths"
                },
                {
                    name: "EBIT",
                    key: "ebit.lasttwelvemonths"
                },
                {
                    name: "EBITDA",
                    key: "ebitda.lasttwelvemonths"
                },
                {
                    name: "EBITDA 1Yr Growth",
                    key: "ebitda1yrgrowth.lasttwelvemonths"
                },
                {
                    name: "EBITDA Margin",
                    key: "ebitdamargin.lasttwelvemonths"
                },
                {
                    name: "EPS Growth",
                    key: "epsgrowth.lasttwelvemonths"
                },
                {
                    name: "Gross Profit",
                    key: "grossprofit.lasttwelvemonths"
                },
                {
                    name: "Gross Profit Margin",
                    key: "grossprofitmargin.lasttwelvemonths"
                },
                {
                    name: "Net EPS Basic",
                    key: "netepsbasic.lasttwelvemonths"
                },
                {
                    name: "Net Income 1Yr Growth",
                    key: "netincome1yrgrowth.lasttwelvemonths"
                },
                {
                    name: "Net Income IS",
                    key: "netincomeis.lasttwelvemonths"
                },
                {
                    name: "Net Income Margin",
                    key: "netincomemargin.lasttwelvemonths"
                },
                {
                    name: "Operating Income",
                    key: "operatingincome.lasttwelvemonths"
                },
                {
                    name: "Quarterly Revenue Growth",
                    key: "quarterlyrevenuegrowth.quarterly"
                },
                {
                    name: "Total Revenues",
                    key: "totalrevenues.lasttwelvemonths"
                },
                {
                    name: "Total Revenues 1Yr Growth",
                    key: "totalrevenues1yrgrowth.lasttwelvemonths"
                }
            ]
        },
        balance: {
            name: "Balance Sheet",
            filters: [
                {
                    name: "Total Assets",
                    key: "totalassets.lasttwelvemonths"
                },
                {
                    name: "Total Cash and Short Term Investments",
                    key: "totalcashandshortterminvestments.lasttwelvemonths"
                },
                {
                    name: "Total Common Equity",
                    key: "totalcommonequity.lasttwelvemonths"
                },
                {
                    name: "Total Common Shares Outstanding",
                    key: "totalcommonsharesoutstanding.lasttwelvemonths"
                },
                {
                    name: "Total Current Assets",
                    key: "totalcurrentassets.lasttwelvemonths"
                },
                {
                    name: "Total Current Liabilities",
                    key: "totalcurrentliabilities.lasttwelvemonths"
                },
                {
                    name: "Total Debt",
                    key: "totaldebt.lasttwelvemonths"
                },
                {
                    name: "Total Equity",
                    key: "totalequity.lasttwelvemonths"
                },
                {
                    name: "Total Shares Outstanding",
                    key: "totalsharesoutstanding"
                }
            ]
        },
        cash: {
            name: "Cash Flow",
            filters: [
                {
                    name: "Capital Expenditure",
                    key: "capitalexpenditure.lasttwelvemonths"
                },
                {
                    name: "Cash from Operations",
                    key: "cashfromoperations.lasttwelvemonths"
                },
                {
                    name: "Cash from Operations 1Yr Growth",
                    key: "cashfromoperations1yrgrowth.lasttwelvemonths"
                },
                {
                    name: "Forward Dividend Yield",
                    key: "forward_dividend_yield"
                },
                {
                    name: "Levered Free Cash Flow",
                    key: "leveredfreecashflow.lasttwelvemonths"
                },
                {
                    name: "Levered Free Cash Flow 1Yr Growth",
                    key: "leveredfreecashflow1yrgrowth.lasttwelvemonths"
                },
                {
                    name: "Unlevered Free Cash Flow",
                    key: "unleveredfreecashflow.lasttwelvemonths"
                }
            ]
        },
        esg: {
            name: "ESG",
            filters: [
                {
                    name: "Environmental Score",
                    key: "environmental_score"
                },
                {
                    name: "Governance Score",
                    key: "governance_score"
                },
                {
                    name: "Highest Controversy",
                    key: "highest_controversy"
                },
                {
                    name: "Social Score",
                    key: "social_score"
                }
            ]
        },
        all: {
            name: "All",
            filters: []
        }
    };

    return options;
}

