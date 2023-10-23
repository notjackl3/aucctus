import { FunctionComponent, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'


import styles from "../assets/styles/pages/concept-list.module.scss"
import { IConcepts } from "../../libs/api/typings/ignite-concepts";
import { useQuery } from "react-query";

export interface IGeneratedConcept {
  id: string;
  title: string;
  summary: string;
  score: number
}



const columnHelper = createColumnHelper<IGeneratedConcept>()


const columns = [
  columnHelper.accessor(row => row.title, {
    id: 'title',
    cell: (info) => <span> {info.getValue()}

    </span>,
    // footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.score, {
    id: 'score',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Venture Score</span>,
    // footer: info => info.column.id,

  }),
  // columnHelper.accessor('age', {
  //   header: () => 'Age',
  //   cell: info => info.renderValue(),
  //   footer: info => info.column.id,
  // }),
  // columnHelper.accessor('visits', {
  //   header: () => <span>Visits</span>,
  //   footer: info => info.column.id,
  // }),
  // columnHelper.accessor('status', {
  //   header: 'Status',
  //   footer: info => info.column.id,
  // }),
  // columnHelper.accessor('progress', {
  //   header: 'Profile Progress',
  //   footer: info => info.column.id,
  // }),
]


const ConceptTable: FunctionComponent = () => {
  const [data, setData] = useState<IGeneratedConcept[]>([])

  // const query = useQuery({
  //   queryKey: 'concepts',
  //   retry:
  // })



  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })


  return (
    <div className={styles.tableContainer}>
      <table>

        {/* Header */}
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* Footer */}
        <tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}

        </tfoot>
      </table>

    </div>
  )
}

export default ConceptTable;