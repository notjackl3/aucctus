import { FunctionComponent, ReactNode, useState } from "react";
import {
  SortDirection,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'


import styles from "../assets/styles/pages/concept-list.module.scss"
import ArrowUp from '../assets/icons/arrowup.svg?react'
import ArrowDown from '../assets/icons/arrowdown.svg?react'
import Star from '../assets/icons/star-01.svg?react'


export interface IGeneratedConcept {
  id: string;
  title: string;
  summary: string;
  score: number
}


const mockData: IGeneratedConcept[] = [
  {
    id: '1',
    "title": "Telemedicine Platform",
    "summary": "Develop a digital platform that connects patients with healthcare professionals for virtual consultations and remote monitoring.",
    "score": 9
  },
  {
    id: '2',
    "title": "Healthcare Wearables",
    "summary": "Create wearable devices that track vital signs and provide real-time health data, enabling individuals to monitor their health and share it with healthcare providers.",
    "score": 8
  },
  {
    id: '3',
    "title": "Digital Health Records",
    "summary": "Build a secure and user-friendly system for storing and accessing electronic health records, allowing seamless data sharing among healthcare providers.",
    "score": 7
  },
  {
    id: '4',
    "title": "AI-Based Diagnostic Tools",
    "summary": "Develop artificial intelligence algorithms to analyze medical images, test results, and patient data, aiding in accurate and timely diagnosis.",
    "score": 9
  },
  {
    id: '5',
    "title": "Remote Patient Monitoring",
    "summary": "Create a system that remotely monitors patients' health conditions, detects abnormalities, and alerts healthcare providers for proactive intervention.",
    "score": 8
  },
  {
    id: '6',
    "title": "Healthcare Chatbot",
    "summary": "Design an AI-powered chatbot that provides reliable and personalized healthcare information, answers common medical questions, and assist in scheduling appointments.",
    "score": 7
  },
  {
    id: '7',
    "title": "Digital Mental Health Solutions",
    "summary": "Build an online platform that offers mental health support through virtual therapy sessions, guided meditation, and self-help resources.",
    "score": 8
  },
  {
    id: '8',
    "title": "Remote Surgical Training",
    "summary": "Create a virtual reality (VR) platform that allows surgeons to practice and receive training remotely, enhancing surgical skills and knowledge sharing.",
    "score": 7
  },
  {
    id: '9',
    "title": "Telepharmacy Services",
    "summary": "Establish a telepharmacy network that enables patients to consult with pharmacists remotely, obtain medication advice, and get prescriptions filled.",
    "score": 8
  },
  {
    id: '10',
    "title": "Digital Health Coaching",
    "summary": "Offer personalized digital coaching programs to help individuals achieve health goals through lifestyle changes, exercise routines, and nutrition plans.",
    "score": 7
  }
]


const getSortIndicator = (value?: SortDirection | false): ReactNode => {
  switch (value) {
    case 'asc':
      return <ArrowUp height={20} width={20} />
    case 'desc':
      return <ArrowDown height={20} width={20} />
    default:
      return null
  }
}


const columnHelper = createColumnHelper<IGeneratedConcept>()


const columns = [
  columnHelper.accessor(row => row.id, {
    id: "select",
    header: () => null,
    cell: (data) => (<Star
      height={20}
      width={30}
      stroke={data.row.getIsSelected() ? "#EAAA08" : "#98a2b3"}
      fill={data.row.getIsSelected() ? "#FEF7C3" : "#ffffff"}
    />)
  }),
  columnHelper.accessor(row => row.title, {
    id: 'title',
    header: () => <span className={styles.details}>Content Name</span>,
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
    header: (data) => <span>Venture Score {getSortIndicator(data.column.getIsSorted())}</span>,
    enableSorting: true,
    sortingFn: "alphanumeric",

  }),
]


const ConceptTable: FunctionComponent = () => {
  const [data, setData] = useState<IGeneratedConcept[]>(mockData)


  const [rowSelection, setRowSelection] = useState({})


  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
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