const OutputBad = ({ gameCodeTooLong }) => {
  return (
    <div className="generator__bad-codes">
      {gameCodeTooLong?.length > 0 ? (
        <ul>
          <h2>Contact config-db for these codes:</h2>
          {gameCodeTooLong.map((gameCode, i) => (
            <li key={i}>{gameCode}</li>
          ))}
        </ul>
      ) : (
        <p className="generator__code-item--placeholder">
          If a game code is too long, it will be generated here. <br />
          Please ask the <b>config-db team</b> to generate such codes for you.
        </p>
      )}
    </div>
  )
}

export default OutputBad
