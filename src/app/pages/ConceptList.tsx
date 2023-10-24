import { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom";
import { AppPath } from "../../routes/routes";
import InputField from "../components/InputField";

import Lightbulb from '../assets/icons/lightbulb.svg?react';
import DownloadIcon from '../assets/icons/download.svg?react';
import ArrowRight from '../assets/icons/arrowright.svg?react';
import FilterLines from '../assets/icons/filter-lines.svg?react';

import styles from '../assets/styles/pages/concept-list.module.scss';



import {

  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'




interface IConcept {
  id: string;
  title: string;
  summary: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<IConcept>()


const columns = [
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
    header: (data) => <span>Score</span>,
    enableSorting: true,
    sortingFn: "alphanumeric",
  }),
  columnHelper.accessor(row => row.updatedAt, {
    id: 'updatedAt',
    cell: info => <i>{new Date(info.getValue()).toLocaleDateString("en-US", { year: "2-digit", month: "short", day: "numeric" })}</i>,
    header: (data) => <span>Last Updated</span>,
  }),
  columnHelper.accessor(row => row.id, {
    id: 'id',
    cell: info => <Link to={`/concept/${info.getValue()}`} className={styles.reviewConceptLink}><ArrowRight height={20} width={20} /></Link>,
    header: (data) => <span></span>,
  }),
]


const mockData: IConcept[] = [
  {
    id: '1',
    "title": "Telemedicine Platform",
    "summary": "Develop a digital platform that connects patients with healthcare professionals for virtual consultations and remote monitoring.",
    "score": 9,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  },
  {
    id: '2',
    "title": "Healthcare Wearables",
    "summary": "Create wearable devices that track vital signs and provide real-time health data, enabling individuals to monitor their health and share it with healthcare providers.",
    "score": 8,
    createdAt: Date.now().toLocaleString(),
    updatedAt: Date.now().toLocaleString(),
  },
  {
    id: '3',
    "title": "Digital Health Records",
    "summary": "Build a secure and user-friendly system for storing and accessing electronic health records, allowing seamless data sharing among healthcare providers.",
    "score": 7,
    createdAt: Date.now().toLocaleString(),
    updatedAt: Date.now().toLocaleString(),
  },
]

const ConceptList: FunctionComponent = () => {
  const [data, setData] = useState<IConcept[]>(mockData)

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  })


  return (
    <div className={styles.contentList}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>Concepts</h1>
          <div className={styles.actions}>
            <button className="btn btn-light disabled">
              <DownloadIcon height={20} width={20} />
              Export
            </button>
            <button className="btn btn-primary">
              <Lightbulb height={20} width={20} />
              Ignite Concept
            </button>


          </div>

        </div>
        <div className={styles.navbar}>
          <div className={`${styles.link} ${styles.active}`}>
            <Link to={AppPath.ConceptList}>
              Concepts
            </Link>
          </div>
          <div className={styles.link}>
            <Link to={AppPath.ConceptList} aria-disabled>
              Formula
            </Link>
          </div>
          <div className={styles.link}>
            <Link to={AppPath.ConceptList} aria-disabled>
              Inputs
            </Link>
          </div>
          <div className={styles.link}>
            <Link to={AppPath.ConceptList} aria-disabled>
              Sources
            </Link>
          </div>

        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tableControls}>
          <InputField label="" placeholder="Search" disabled name="searchbar" />
          <button className="btn btn-light disabled">
            <FilterLines height={20} width={20} />
            Filter
          </button>
        </div>

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
          {/* <tfoot>
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

          </tfoot> */}
        </table>




      </div>
    </div>
  )
}

export default ConceptList


