import { useState } from 'react'

const GameCodesForm = () => {
  const [gameCodes, setGameCodes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    try {
      if (!gameCodes || !gameCodes.includes('_'))
        throw new Error(`Invalid game codes: ${gameCodes}`)

      const codesArray = gameCodes
        .split('\n')
        .map((code) => code.replace(/\s/g, ''))
        .filter((code) => code !== '')

      // store the cleaned up codes array
      window.api.storeGameCodes(codesArray)

      setGameCodes('')
    } catch (error) {
      console.error('Error submitting game codes', error)
    }
  }

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <textarea
        className="game-form__textarea"
        value={gameCodes}
        onChange={(e) => setGameCodes(e.target.value)}
        placeholder="Enter game codes, one per line"
        rows="10"
        cols="30"
      />
      <button className="game-form__submit-button" type="submit">
        Submit
      </button>
    </form>
  )
}

export default GameCodesForm
