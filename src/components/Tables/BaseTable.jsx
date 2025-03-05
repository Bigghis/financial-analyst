import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel } from '@tanstack/react-table';
import PropTypes from 'prop-types';
import { useSettings } from '../../context/SettingsContext';
import { useMemo, useState, useEffect } from 'react';
import { drawLines, createCellDrawingsParts } from './util/drawOperations';

export function BaseTable({ 
    data = [], 
    columns, 
    title = "",
    noDataMessage = "No data available.",
    pagination = false,
    params = {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
    },
    onParamsChange,
    pageSizeOptions = [10, 25, 50, 75, 100],
    showCounter = true,
    isLoading = false,
    serverSideSorting = false,
    onRowClick = null
}) {
    const { unitFormat, period } = useSettings();
    const [sorting, setSorting] = useState([]);

    // Memoize the counter column
    const counterColumn = useMemo(() => ({
        id: 'counter',
        header: '#',
        align: 'right',
        cell: ({ row }) => {
            const counter = pagination
                ? params.pageSize * params.pageIndex + row.index + 1
                : row.index + 1;
            return <span>{counter}</span>;
        },
        size: 40,
    }), [pagination, params.pageSize, params.pageIndex]);

    // Memoize all columns
    const allColumns = useMemo(() => {
        const providedColumns = columns(unitFormat);
        return showCounter 
            ? [counterColumn, ...providedColumns]
            : providedColumns;
    }, [columns, unitFormat, showCounter, counterColumn]);

    // Create table instance
    const table = useReactTable({
        data: data, // || [],
        columns: allColumns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: serverSideSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);
            if (serverSideSorting && onParamsChange) {
                const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
                onParamsChange({
                    ...params,
                    sorting: newSorting
                });
            }
        },
        ...(pagination ? {
            manualPagination: true,
            pageCount: params.pageCount,
            state: {
                pagination: {
                    pageIndex: params.pageIndex,
                    pageSize: params.pageSize,
                },
                sorting,
            },
        } : {}),
    });

    const handlePaginationChange = (newParams) => {
        if (onParamsChange) {
            onParamsChange({
                ...params,
                ...newParams
            });
        }
    };

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

    const applyCell = (cell) => {
        return (
            <td 
                key={cell.id} 
                className={`${cell.column.columnDef.align || 'right'}`}
            >
                {
                    flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                    )
                }
            </td>
        );
    };

    return (
        <>
            <div className="table-section">
                {title && <h2>{title}</h2>}
                <div className="table-container basetable">
                {isLoading && (
                    <div className="table-loader">
                        <div className="loader-spinner" />
                    </div>
                )}
                <div className={`table-content ${isLoading ? 'loading' : ''}`}>
                    <table>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{ cursor: 'pointer' }}
                                            className={header.column.columnDef.headerAlign || header.column.columnDef.align || 'right'}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted()] ?? null}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => {
                                const visibleCells = row.getVisibleCells();
                                return [
                                    <tr 
                                        key={row.id} 
                                        // className={}
                                        onClick={() => onRowClick !== null && onRowClick(row.original)}
                                        style={onRowClick !== null ? { cursor: 'pointer' } : undefined}
                                    >
                                        {visibleCells.map(cell => applyCell(cell))}
                                    </tr>
                                ];
                            })}
                        </tbody>
                    </table>
                    {pagination && (
                        <div className="pagination">
                            <div className="pagination-controls">
                                <button
                                    onClick={() => handlePaginationChange({ 
                                        ...params,
                                        pageIndex: params.pageIndex - 1 
                                    })}
                                    disabled={params.pageIndex === 0 || isLoading}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {params.pageIndex + 1} of {params.pageCount}
                                </span>
                                <button
                                    onClick={() => handlePaginationChange({ 
                                        ...params,
                                        pageIndex: params.pageIndex + 1 
                                    })}
                                    disabled={params.pageIndex >= params.pageCount - 1 || isLoading}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="page-size-selector">
                                <select
                                    value={params.pageSize}
                                    onChange={e => {
                                        const newSize = Number(e.target.value);
                                        handlePaginationChange({
                                            pageIndex: 0,
                                            pageSize: newSize
                                        });
                                    }}
                                >
                                    {pageSizeOptions.map(size => (
                                        <option key={size} value={size}>
                                            Show {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
}

BaseTable.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.func.isRequired,
    title: PropTypes.string,
    noDataMessage: PropTypes.string,
    pagination: PropTypes.bool,
    params: PropTypes.shape({
        pageIndex: PropTypes.number,
        pageSize: PropTypes.number,
        pageCount: PropTypes.number,
        sorting: PropTypes.array,
    }),
    onParamsChange: PropTypes.func,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    showCounter: PropTypes.bool,
    isLoading: PropTypes.bool,
    serverSideSorting: PropTypes.bool,
    highlightedMetrics: PropTypes.array,
    settingOptions: PropTypes.array,
    onRowClick: PropTypes.func
};
