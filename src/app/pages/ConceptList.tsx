import { FunctionComponent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";
import InputField from "../components/InputField";

import Lightbulb from '../assets/icons/lightbulb.svg?react';
import DownloadIcon from '../assets/icons/Download';
import ArrowRight from '../assets/icons/ArrowRight';
import FilterLines from '../assets/icons/FilterLines';
import ignite from "../assets/icons/ignite.svg";

import { IConceptResponse } from "../../libs/api/typings/ignite-concepts";
import styles from '../assets/styles/pages/concept-list.module.scss';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import api from "../../libs/api";
import Loading from "../components/Loading";
import { setSelectedConcept } from "../../features/concepts/concept.slice";


const columnHelper = createColumnHelper<IConceptResponse>()

const ConceptList: FunctionComponent = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [data, setData] = useState<IConceptResponse[]>([])
  const [fetchComplete, setFetchComplete] = useState<boolean>(false)

  const query = useQuery({
    queryKey: 'saved/concepts',
    retry: 3,
    queryFn: async () => await api.igniteConcept.getAllSavedConcepts(),
    onSuccess: (response) => {
      setData(response)
      setFetchComplete(true)
    },
    onError: (error) => {
      setFetchComplete(true)
    }
  })


  const columns = useMemo(() => ([
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
      cell: info => (
        <button
          onClick={() => {
            dispatch(setSelectedConcept(info.getValue()))
            navigate(`/concept/${info.getValue()}`)
          }}
          className={styles.reviewConceptLink}
        >
          <ArrowRight height={20} width={20} stroke="" />
        </button>),
      header: () => <span></span>,
    }),
  ]), [dispatch, navigate])




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
              <DownloadIcon height={20} width={20} stroke="" />
              Export
            </button>
            <button className="btn btn-primary"
              onClick={() => {
                navigate(AppPath.IgniteConcept)
              }}
            >
              <Lightbulb height={20} width={20} stroke="" />
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
            <FilterLines height={20} width={20} stroke="" />
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

            {query.isLoading ?

              <div className={styles.tableMessageContainer}>
                <Loading />
              </div>

              :

              fetchComplete && (!data || data.length <= 0) ?
                <div className={styles.tableMessageContainer}>
                  <img
                    alt="Ignite your Concept"
                    src={ignite}
                  />
                </div>
                :

                table.getRowModel().rows.map(row => (
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
        </table>
      </div>
    </div>
  )
}

export default ConceptList


