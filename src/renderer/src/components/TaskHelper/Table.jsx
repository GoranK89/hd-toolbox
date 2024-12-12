import { sheetHeaderCols, alwaysExcludeHeaderCols, headerMappingCols } from './sheetHeaderRow'

function Table({ data }) {
  // Filter out the columns that should be excluded
  const filteredHeaders = sheetHeaderCols.filter(
    (header) => !alwaysExcludeHeaderCols.includes(header)
  )

  return (
    <table>
      <thead>
        <tr>
          {filteredHeaders.map((header, index) => (
            <th key={index}>{headerMappingCols[header] || header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {filteredHeaders.map((header, cellIndex) => (
              <td key={cellIndex}>{row[sheetHeaderCols.indexOf(header)]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
