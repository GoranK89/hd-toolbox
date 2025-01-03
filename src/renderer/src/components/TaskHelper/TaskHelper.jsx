import { useState } from 'react'
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

  // TODO: color missing fields, exceptions per GP

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
      <button className="button button--large button--primary" onClick={seperateByGp}>
        Process Rows
      </button>
      <div className="task-helper__table-container">
        <h3>Formated tables</h3>
        {/* <p>Configure on Environments: PRODCOPY, PROD_RGS, PROD_RGHR</p>
        <p>
          Please enable the games for: <b>PRODCOPY, PROD_RGS, PROD_RGHR</b>
        </p> */}
        {Object.keys(formatedData).map((key) => (
          <div key={key}>
            <h4>{key}</h4>
            <Table data={formatedData[key]} />
          </div>
        ))}
      </div>
    </div>
  )
}
