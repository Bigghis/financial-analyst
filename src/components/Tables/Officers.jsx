import { createColumnHelper } from '@tanstack/react-table';
import { NumberCell } from './Cells/Cells';
import { BaseTable } from './BaseTable';

const columnHelper = createColumnHelper();

const columns = (unitFormat) => [
  columnHelper.accessor('name', {
    header: 'Name',
    headerAlign: 'center',
    align: 'left',
    cell: info => {
      const row = info.row.original;
      return `${row.name} (${row.title})`;
    },
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('totalPay', {
    header: 'Total Pay',
    cell: (props) => <NumberCell props={props} values={props.column} unitFormat={unitFormat} />,
  }),
  columnHelper.accessor('exercisedValue', {
    header: 'Exercised',
    cell: (props) => <NumberCell props={props} values={props.column} unitFormat={unitFormat} />,
  }),
  columnHelper.accessor('unexercisedValue', {
    header: 'Unexercised',
    cell: (props) => <NumberCell props={props} values={props.column} unitFormat={unitFormat} />,
  })
]

export function OfficersTable({ data = [] }) {
  return (
    <BaseTable 
      data={data}
      columns={columns}
      title="Company Officers"
      noDataMessage="No officer data available."
    />
  );
}
