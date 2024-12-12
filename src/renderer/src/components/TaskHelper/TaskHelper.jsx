import { useState } from 'react'
import { sheetHeaderCols, alwaysExcludeHeaderCols } from './sheetHeaderRow'
import Table from './Table'

export default function TaskHelper() {
  const [inputData, setInputData] = useState('')
  const [formatedData, setFormatedData] = useState({})

  const handleInputChange = (e) => {
    setInputData(e.target.value)
  }

  const seperateByGp = () => {
    const rows = inputData.split('\n')
    const cols = rows.map((row) => row.split('\t'))

    function groupByGpAndRgs() {
      const groupedByGpAndRgs = {}

      cols.forEach((col) => {
        const gameProvider = col[0]
        const rgsProvider = col[1]
        const compositeKey = `${gameProvider}-${rgsProvider}`

        if (!groupedByGpAndRgs[compositeKey]) {
          groupedByGpAndRgs[compositeKey] = []
        }
        groupedByGpAndRgs[compositeKey].push(col)
      })
      setFormatedData(groupedByGpAndRgs)
      console.log(formatedData)
    }

    groupByGpAndRgs()
  }

  // const processData = () => {
  //   // 1.) split input by lines
  //   const rows = inputData.split('\n')

  //   // 2.) filter columns with list of excluded columns
  //   const formattedRows = rows.map((row) => {
  //     const columns = row.split('\t')
  //     columns.forEach((col, i) => !col.includes(alwaysExcludeHeaderCols[i]))

  //     return columns.filter(
  //       (col, index) => !alwaysExcludeHeaderCols.includes(sheetHeaderCols[index])
  //     )
  //   })

  //   setFormatedData(formattedRows)
  // }

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
      <button className="button button--large button--gradient-green" onClick={seperateByGp}>
        Process Rows
      </button>
      <div className="task-helper__table-container">
        <h3>Formated table</h3>
        <p>Configure on Environments: PRODCOPY, PROD_RGS, PROD_RGHR</p>
        <p>
          Please enable the games for: <b>PRODCOPY, PROD_RGS, PROD_RGHR</b>
        </p>
        {Object.keys(formatedData).map((key) => (
          <div key={key}>
            <h2>{key}</h2>
            <Table data={formatedData[key]} />
          </div>
        ))}
      </div>
    </div>
  )
}
