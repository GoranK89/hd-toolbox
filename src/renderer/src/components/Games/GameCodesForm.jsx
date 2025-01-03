import { useEffect, useState } from 'react'
import { useUploadFolder } from '../../contexts/UploadFolderContext'

const GameCodesForm = () => {
  const [gameCodes, setGameCodes] = useState('')
  const [transferIconsDisabled, setTransferIconsDisabled] = useState(true)

  const { state, storeGameCodes, checkIconsInBrowser, transferIcons } = useUploadFolder()

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
      await storeGameCodes(codesArray)
      setGameCodes('')
    } catch (error) {
      console.error('Error submitting game codes', error)
    }
  }

  function checkCdnHandler() {
    checkIconsInBrowser()
  }

  function transferIconsHandler() {
    transferIcons()
  }

  // disable transfer icons button if icons are in folders
  useEffect(() => {
    isDisabled()
  }, [state])

  function isDisabled() {
    state.map((item) => {
      if (item.iconsExist === false) setTransferIconsDisabled(false)
    })
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
            Move Icons
          </button>
        </div>
      </form>
      <button className="button button--large button--tertiary" onClick={checkCdnHandler}>
        Check CDN
      </button>
    </div>
  )
}

export default GameCodesForm
