import { FunctionComponent, ReactNode, useEffect, useMemo } from "react";
import {
  SortDirection,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import styles from "../assets/styles/pages/generated-concept.module.scss"
import { IConceptResponse } from "../../libs/api/typings/ignite-concepts";
import { useSelector } from "react-redux";
import { saveConcept, selectConceptList, selectIgniteConceptId } from "../../features/concepts/concept.slice";
import { useAppDispatch } from "../hooks";
import Icon from "./Icon";

const getSortIndicator = (value?: SortDirection | false): ReactNode => {
  switch (value) {
    case 'asc':
      return <Icon variant="arrowUp" height={20} width={20} stroke={"#7586A9"} />
    case 'desc':
      return <Icon variant="arrowUp" height={20} width={20} stroke={"#7586A9"} />
    default:
      return null
  }
}

const columnHelper = createColumnHelper<IConceptResponse>()



const ConceptTable: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const data = useSelector(selectConceptList)
  const igniteId = useSelector(selectIgniteConceptId)

  useEffect(() => {


    return () => {
      // if (igniteId) {
      //   dispatch(removedUnsavedConcepts(igniteId))
      // }

    }
  }, [igniteId, dispatch])


  const columns = useMemo(() => ([
    columnHelper.accessor(row => row.isSaved, {
      id: "save",
      header: () => null,

      cell: (data) => (
        <div
          className={styles.saveButton}
          onClick={() => {
            dispatch(saveConcept(data.row.original.id))
          }}
        >
          <Icon
            variant="saveStar"
            height={20}
            width={30}
            stroke={data.getValue() ? "#EAAA08" : "#98a2b3"}
            fill={data.getValue() ? "#FEF7C3" : "#ffffff"}
          />
        </div >)
    }),
    columnHelper.accessor(row => row.title, {
      id: 'title',
      header: () => <span className={styles.details}>Concept</span>,
      cell: (data) => (
        <div className={styles.details}>
          <span className={styles.title}>
            {data.row.original.title}
          </span>
          <span className={styles.summary}>
            {data.row.original.summary}
          </span>
        </div>),
    }),
    columnHelper.accessor(row => row.score, {
      id: 'score',
      cell: info => <i>{info.getValue()}</i>,
      header: (data) => <span>Score {getSortIndicator(data.column.getIsSorted())}</span>,
      enableSorting: true,
      sortingFn: "alphanumeric",
    }),
  ]), [])


  const table = useReactTable({
    data,
    columns,
    // state: {
    //   rowSelection,
    // },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    // onRowSelectionChange: setRowSelection,
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
            <tr key={row.id} onClick={
              row.getToggleSelectedHandler()
            }>
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