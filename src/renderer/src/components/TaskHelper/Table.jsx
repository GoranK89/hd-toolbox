function Table({ formatedData }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Game Name</th>
          <th>Game ID</th>
          <th>Game Type</th>
          <th>Platform</th>
          <th>Module ID</th>
          <th>Nekineki</th>
          <th>Free Rounds</th>
          <th>CUR</th>
          <th>MGA</th>
          <th>DE</th>
          <th>BE</th>
          <th>Release Date</th>
        </tr>
      </thead>
      <tbody>
        {formatedData?.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
