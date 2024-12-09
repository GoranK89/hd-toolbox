import { useState } from 'react'

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
      return columns.slice(0, 11).filter((col, index) => index < 10 || col.trim() !== '')
    })

    setFormatedData(formattedRows)
  }

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
      <button onClick={processData} style={{ marginBottom: '1rem' }}>
        Process Rows
      </button>
      <div>
        <h3>Formated game info</h3>
        <p>Configure on Environments: PRODCOPY, PROD_RGS, PROD_RGHR</p>
        <br />
        <p>
          Please enable the games for: <b>PRODCOPY, PROD_RGS, PROD_RGHR</b>
        </p>
        <br />
        <table>
          <thead>
            <tr>
              <th>Game Name</th>
              <th>Game ID</th>
              <th>Game Type</th>
              <th>Platform</th>
              <th>Free Rounds</th>
              <th>Module ID</th>
              <th>CUR</th>
              <th>MGA</th>
              <th>DE</th>
              <th>BE</th>
              <th>Release Date</th>
            </tr>
          </thead>
          <tbody>
            {formatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
