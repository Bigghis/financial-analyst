import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel } from '@tanstack/react-table';
import PropTypes from 'prop-types';
import { useSettings } from '../../context/SettingsContext';
import { useMemo, useState, useEffect } from 'react';
import { drawLines, createCellDrawingsParts } from './util/drawOperations';

export function BaseFinancialTable({ 
    data = [], 
    columns, 
    title = "",
    noDataMessage = "No data available.",
    isLoading = false,
    highlightedMetrics = [],
    settingOptions = [],
    onRowClick = null,
    settingButtonCallback = null
}) {
    const { unitFormat, period } = useSettings();
    const [settings, setSettings] = useState(() => {
        // Find any default options and create initial settings
        return settingOptions.reduce((acc, group) => {
            const defaultOption = group.options.find(opt => 
                typeof opt === 'object' && opt.default === true
            );
            if (defaultOption) {
                acc[group.id] = defaultOption.value;
            } else {
                acc[group.id] = 0;
            }
            return acc;
        }, {});
    });

    // Memoize all columns
    const allColumns = useMemo(() => {
        const providedColumns = columns(unitFormat);
        return providedColumns;
    }, [columns, unitFormat]);

    // Update the classifyRows logic to consider operation levels
    const classifyRows = useMemo(() => {
        if (!settings.operations || !data) return data;

        return data.map(row => {
            // Only process calculations that match or are below the current level
            const relevantMetrics = highlightedMetrics.filter(calc => 
                !calc.level || calc.level <= settings.operations
            );

            const isResult = relevantMetrics.some(calc => calc.result === row.metric);
            const isOperand = relevantMetrics.some(calc => 
                Array.isArray(calc.operands) && calc.operands.includes(row.metric)
            );

            return {
                ...row,
                isResultInstance: isResult,
                isOperandInstance: isOperand
            };
        });
    }, [data, settings.operations, highlightedMetrics]);

    // Create table instance
    const table = useReactTable({
        data: classifyRows || [],
        columns: allColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Update the useEffect for drawing lines to use settings.operations
    useEffect(() => {
        if (!settings.operations) return;
        // Create a mapping of metrics to labels from the visible rows
        const metricToLabelMap = data.reduce((map, row) => {
            if (row.metric && row.label) {
                map[row.metric] = row.label;
            }
            return map;
        }, {});
        drawLines(settings, highlightedMetrics, metricToLabelMap);
        window.addEventListener('resize', drawLines);
        return () => window.removeEventListener('resize', drawLines);
    }, [settings.operations, highlightedMetrics, data]);

    // Update renderOperationLines to use settings.operations
    const renderOperationLines = () => {
        if (!settings.operations) return null;
        return (
            <div className="operation-lines">
                <svg style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}/>
            </div>
        );
    };

    // Update the settings state handler to trigger re-render
    const handleSettingsChange = (groupId, value) => {
        if (settingButtonCallback) {
            settingButtonCallback(groupId, value, settings);
        }
        
        // If selecting the same value that's already active, reset all settings
        if (settings[groupId] === value) {
            setSettings(Object.keys(settings).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {}));
        } else {
            // Reset all settings except those in the same group
            const currentGroup = groupId.split('-')[0];
            const newSettings = Object.keys(settings).reduce((acc, key) => {
                // Reset value if key belongs to a different group
                const keyGroup = key.split('-')[0];
                acc[key] = keyGroup === currentGroup ? settings[key] : 0;
                return acc;
            }, {});
            
            setSettings({
                ...newSettings,
                [groupId]: value
            });
        }

        // Force table to re-render by getting a new row model
        table.getRowModel();
    };

    // Add useEffect to monitor period changes
    useEffect(() => {
        // Reset all settings when period changes
        setSettings(Object.keys(settings).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {}));
    }, [period]);

    // Early return for no data
    if (!data || data.length === 0) {
        return (
            <div className="table-section">
                {title && <h2>{title}</h2>}
                <p className="no-data">{noDataMessage}</p>
            </div>
        );
    }

    const renderSimplyCell = (cell) => {
        return (
            <td 
                key={cell.id}
                className={cell.column.columnDef.align || 'right'}
                style={onRowClick !== null ? { cursor: 'pointer' } : undefined}
            >
                {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                )}
            </td>
        )
    }

    const renderCalcCell = (cell, cellSign, calcType) => {
        const _render = (<>{flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
        )}</>);

        if (calcType === 'distant') {
            return (<div className="calc">
                <div className="wrap">
                    {_render}
                </div>
            </div>)
        }

        return (
            <div className="calc">
                {_render}
                {cellSign && settings.operations > 0 ? <span className="sign">{cellSign}</span> : null}
            </div>
        );
    };

    const applyCell = (visibleRows, cell) => {
        if (cell.column.id === 'metric') {
            return renderSimplyCell(cell);
        }

        const { cellClasses, cellSign, calcType } = createCellDrawingsParts(visibleRows, cell, settings, highlightedMetrics);

        return (
            <td 
                key={cell.id} 
                className={`${cellClasses} ${cell.column.columnDef.align || 'right'}`}
            >
                {cellClasses ? renderCalcCell(cell, cellSign, calcType) : (
                    flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                    )
                )}
            </td>
        );
    };

    const renderSettingButtons = () => {
        if (settingOptions.length === 0) return null;
        return (
            <div className="settings-group">
                {settingOptions.map(group => (
                    <div key={group.id} className="buttons-container">
                        <div className="group-label">{group.groupLabel}</div>
                        <select
                            value={settings[group.id] || ''}
                            onChange={(e) => handleSettingsChange(group.id, e.target.value)}
                        >
                            {group.options.find(opt => typeof opt === 'object' && opt.default) ? null : (
                                <option value="">Select {group.groupLabel}</option>
                            )}
                            {/* <option value="">Select {group.groupLabel}</option> */}
                            {group.options.map(option => {
                                const value = typeof option === 'object' ? option.value : option;
                                const label = typeof option === 'object' ? option.label : option.charAt(0).toUpperCase() + option.slice(1);
                                return (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {renderSettingButtons()}
            <div className="table-section">
                {title && <h2>{title}</h2>}
                <div className="table-container">
                {isLoading && (
                    <div className="table-loader">
                        <div className="loader-spinner" />
                    </div>
                )}
                <div className={`table-content ${isLoading ? 'loading' : ''}`}>
                    <table className={settings.operations > 0 ? 'show-operations' : ''}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id}
                                            style={{ cursor: 'pointer' }}
                                            className={header.column.columnDef.headerAlign || header.column.columnDef.align || 'right'}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => {
                                const isResultRow = row.original.isResultInstance;
                                const isSeparatorRow = row.original.isSeparatorRow;
                                const visibleCells = row.getVisibleCells();
                                
                                if (isSeparatorRow) {
                                    return (
                                        <tr key={row.id} className="separator-row">
                                            <td colSpan={visibleCells.length}>
                                                <div className="separator-content">
                                                    <div className="separator-label">{row.original.label}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                                return [
                                    <tr 
                                        key={row.id} 
                                        className={isResultRow ? 'result-row' : ''}
                                        onClick={() => onRowClick !== null && onRowClick(row.original)}
                                        style={onRowClick !== null ? { cursor: 'pointer' } : undefined}
                                    >
                                        {visibleCells.map(cell => applyCell(table.getRowModel().rows, cell))}
                                    </tr>,
                                    isResultRow && (
                                        <tr key={`${row.id}-empty`} className="empty-row">
                                            <td colSpan={visibleCells.length}>
                                            </td>
                                        </tr>
                                    )
                                ];
                            })}
                        </tbody>
                    </table>
                    {renderOperationLines()}
                    </div>
                </div>
            </div>
        </>
    );
}

BaseFinancialTable.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.func.isRequired,
    title: PropTypes.string,
    noDataMessage: PropTypes.string,
    onParamsChange: PropTypes.func,
    isLoading: PropTypes.bool,
    highlightedMetrics: PropTypes.array,
    settingOptions: PropTypes.array,
    onRowClick: PropTypes.func,
    settingButtonCallback: PropTypes.func
};
