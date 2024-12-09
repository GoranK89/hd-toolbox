import { useState } from 'react'
import Table from './Table'

export default function TaskHelper() {
  const [inputData, setInputData] = useState('')
  const [formatedData, setFormatedData] = useState([])

  const handleInputChange = (e) => {
    setInputData(e.target.value)
  }

  const processData = () => {
    // 1.) split input by lines
    const rows = inputData.split('\n')

    // 2.) filter out any columns after index 11
    const formattedRows = rows.map((row) => {
      const columns = row.split('\t')
      return columns.slice(2, 14).filter((col, index) => index < 15 || col.trim() !== '')
    })

    setFormatedData(formattedRows)
  }

  // TODO: should make a table per GP, color missing fields, exceptions per GP

  return (
    <div className="task-helper">
      <h2>Task Helper</h2>
      <textarea
        value={inputData}
        onChange={handleInputChange}
        placeholder="Paste rows from Google Sheet here"
        rows="10"
        cols="50"
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <button className="button button--large button--gradient-green" onClick={processData}>
        Process Rows
      </button>
      <div className="task-helper__table-container">
        <h3>Formated table</h3>
        <p>Configure on Environments: PRODCOPY, PROD_RGS, PROD_RGHR</p>
        <p>
          Please enable the games for: <b>PRODCOPY, PROD_RGS, PROD_RGHR</b>
        </p>
        <Table formatedData={formatedData} />
      </div>
    </div>
  )
}
