import { sheetHeaderCols, alwaysExcludeHeaderCols, headerMappingCols } from './sheetHeaderRow'

function Table({ data }) {
  // Filter out the columns that should be excluded
  const getFilteredHeaders = () => {
    return sheetHeaderCols.filter((header) => !alwaysExcludeHeaderCols.includes(header))
  }

  // Function to transform values
  const transformValue = (value, header) => {
    if (value === 'TRUE') return 'Y'
    if (value === 'FALSE') return 'N'
    if (header === 'JACKPOT' && value === '') return '/'
    if (header === 'launch_type' && value === '') return '/'
    return value
  }

  // Check if the game provider or RGS provider is "Games GLobal"
  const isGamesGlobal = data.some((row) => row[0] === 'Games GLobal' || row[1] === 'Games GLobal')

  // Conditionally filter out the "ModuleID-ClientID" column if not "Games GLobal"
  const getFinalHeaders = (filteredHeaders) => {
    if (isGamesGlobal) {
      const insertIndex = filteredHeaders.indexOf('RGS code 2') + 1
      return [
        ...filteredHeaders.slice(0, insertIndex),
        'ModuleID',
        'ClientID',
        ...filteredHeaders.slice(insertIndex).filter((header) => header !== 'ModuleID-ClientID')
      ]
    }
    return filteredHeaders.filter((header) => header !== 'ModuleID-ClientID')
  }

  const filteredHeaders = getFilteredHeaders()
  const finalHeaders = getFinalHeaders(filteredHeaders)

  const renderCell = (row, header, cellIndex) => {
    if (isGamesGlobal && header === 'ModuleID') {
      const [moduleID] = row[sheetHeaderCols.indexOf('ModuleID-ClientID')].split('-')
      return <td key={`${cellIndex}-moduleID`}>{transformValue(moduleID, 'ModuleID')}</td>
    }
    if (isGamesGlobal && header === 'ClientID') {
      const [, clientID] = row[sheetHeaderCols.indexOf('ModuleID-ClientID')].split('-')
      return <td key={`${cellIndex}-clientID`}>{transformValue(clientID, 'ClientID')}</td>
    }
    return <td key={cellIndex}>{transformValue(row[sheetHeaderCols.indexOf(header)], header)}</td>
  }

  return (
    <table>
      <thead>
        <tr>
          {finalHeaders.map((header, index) => (
            <th key={index}>{headerMappingCols[header] || header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {finalHeaders.map((header, cellIndex) => renderCell(row, header, cellIndex))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
