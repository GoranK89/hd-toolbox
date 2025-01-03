const Output = ({ gameCodes }) => {
  const copyCodesToClipboard = async () => {
    const codesString = gameCodes.join('\n')
    await navigator.clipboard.writeText(codesString)
  }

  return (
    <div className="generator__output">
      <div className="generator__title-wrapper">
        <h2 className="generator__output-title">Game codes</h2>
        {gameCodes?.length > 0 && (
          <button className="button button--small button--tertiary" onClick={copyCodesToClipboard}>
            Copy All
          </button>
        )}
      </div>
      {gameCodes?.length > 0 ? (
        <ul className="generator__codes-list">
          {gameCodes?.map((code, index) => (
            <li key={index} className="generator__code-item">
              {code}
            </li>
          ))}
        </ul>
      ) : (
        <p className="generator__code-item--placeholder">Game codes will be generated here</p>
      )}
    </div>
  )
}

export default Output
