import { useState } from 'react'

const columnHeaders = [
  'GAME PROVIDER',
  'RGS PROVIDER',
  'GAME NAME',
  'RGS code 1',
  'RGS code 2',
  'GAME TYPE',
  'BRANDED',
  'JACKPOT',
  'FR',
  'max_paylines',
  'min_bet',
  'min_coin',
  'PLATFORM',
  'RELEASE DATE',
  'CURACAO',
  'MGA',
  'DE',
  'NL',
  'RO',
  'SGA',
  'CRO',
  'CRO cert',
  'MOF',
  'JJTW',
  'GAME ICONS',
  'PRODCOPY',
  'PRODUCTION',
  'ORYX GAME CODE',
  'TASK',
  'TASK NL',
  'notes',
  'Liinoo'
]

export default function TaskHelper() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleInputChange = (event) => {
    setInput(event.target.value)
  }

  const handleButtonClick = () => {
    let cells = input.split('\t')

    if (cells.length > 32) {
      cells = cells.slice(0, 32)
    } else if (cells.length < 32) {
      console.error('Error: Not enough cells in input')
      return
    }

    console.log(cells)
  }

  return (
    <div className="task-helper-container">
      <h1>Task helper</h1>
      <textarea value={input} onChange={handleInputChange} placeholder="Paste row here" />
      <button onClick={handleButtonClick}>Clean up row</button>
      <textarea value={output} readOnly />
    </div>
  )
}
