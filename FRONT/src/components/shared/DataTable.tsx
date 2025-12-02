import React from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
    data,
    columns,
    onRowClick,
    loading,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="data-table-loading">
                <p>Loading...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={String(column.key)}>{column.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((column) => (
                                <td key={String(column.key)}>
                                    {column.render
                                        ? column.render(item)
                                        : String(item[column.key as keyof T] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
