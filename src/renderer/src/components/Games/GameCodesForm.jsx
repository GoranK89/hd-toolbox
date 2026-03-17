import { useEffect, useState } from 'react'
import { useGames } from '../../hooks/useGames'

const GameCodesForm = () => {
  const [gameCodes, setGameCodes] = useState('')
  const [transferIconsDisabled, setTransferIconsDisabled] = useState(true)

  const { folders, storeGameCodes, checkIconsInBrowser, checkIconsHttps, transferIcons } = useGames()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!gameCodes || !gameCodes.includes('_'))
        throw new Error(`Invalid game codes: ${gameCodes}`)

      const codesArray = gameCodes
        .split('\n')
        .map((code) => code.replace(/\s/g, ''))
        .filter((code) => code !== '')

      // // store the cleaned up codes array
      storeGameCodes(codesArray)
      setGameCodes('')
    } catch (error) {
      console.error('Error submitting game codes', error)
    }
  }

   async function checkCdnHandler() {
    const res = await checkIconsInBrowser()
    console.log("GameCodesForm log: " + res)
  }

   async function checkIconsHttpHandler() {
    const res = await checkIconsHttps()
    console.log("GameCodesForm log: " + res)
  }

  function transferIconsHandler() {
    transferIcons()
  }

  // disable transfer icons button if icons are in folders
  useEffect(() => {
    isDisabled()
  }, [folders])

  function isDisabled() {
    folders.map((item) => {
      if (item.iconsExist === false) setTransferIconsDisabled(false)
    })

    // temporarily disabled, because move icons does not work
    // setTransferIconsDisabled(false)
  }

  return (
    <div className="form-layout">
      <form className="game-form" onSubmit={handleSubmit}>
        <textarea
          className="game-form__textarea"
          value={gameCodes}
          onChange={(e) => setGameCodes(e.target.value)}
          placeholder="Enter game codes, one per line"
          rows="10"
          cols="30"
        />
        <div className="form-layout__buttons">
          <button
            className={`${
              gameCodes
                ? 'button button--large button--primary'
                : 'button button--large button--disabled'
            }`}
            type="submit"
          >
            Submit
          </button>
          <button
            className={`${
              transferIconsDisabled
                ? 'button button--large button--disabled'
                : 'button button--large button--secondary'
            }`}
            disabled={transferIconsDisabled}
            onClick={transferIconsHandler}
          >
            Transfer Icons
          </button>
        </div>
      </form>
      <button className="button button--large button--tertiary" onClick={checkCdnHandler}>
        Check CDN
      </button>
      <button className="button button--large button--tertiary" onClick={checkIconsHttpHandler}>
        Check Icons - HTTPS
      </button>
    </div>
  )
}

export default GameCodesForm
