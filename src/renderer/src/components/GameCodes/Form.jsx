import { useState } from 'react'
import { gameProviders, specialGameProviders } from './gameProviders'
import Output from './Output'
import OutputBad from './OutputBad'

// Common replacements for special characters
const replacements = {
  ä: 'a',
  á: 'a',
  Á: 'A',
  à: 'a',
  À: 'A',
  â: 'a',
  Â: 'A',
  æ: 'ae',
  Æ: 'AE',
  ç: 'c',
  Ç: 'C',
  é: 'e',
  É: 'E',
  è: 'e',
  È: 'E',
  ê: 'e',
  Ê: 'E',
  ë: 'e',
  Ë: 'E',
  í: 'i',
  Í: 'I',
  ì: 'i',
  Ì: 'I',
  î: 'i',
  Î: 'I',
  ï: 'i',
  Ï: 'I',
  ó: 'o',
  Ó: 'O',
  ò: 'o',
  Ò: 'O',
  ô: 'o',
  Ô: 'O',
  ö: 'o',
  Ö: 'O',
  ø: 'o',
  Ø: 'O',
  õ: 'o',
  Õ: 'O',
  œ: 'oe',
  Œ: 'OE',
  ú: 'u',
  Ú: 'U',
  ù: 'u',
  Ù: 'U',
  û: 'u',
  Û: 'U',
  ü: 'u',
  Ü: 'U',
  ñ: 'n',
  Ñ: 'N',
  ý: 'y',
  Ý: 'Y',
  ÿ: 'y',
  Ÿ: 'Y',
  ß: 'ss'
}

const Form = () => {
  const [selectedProvider, setSelectedProvider] = useState('')
  const [gameNames, setGameNames] = useState('')
  const [gameCodes, setGameCodes] = useState([])
  const [providerError, setProviderError] = useState(false)
  const [gameCodeTooLong, setGameCodeTooLong] = useState([])

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value)
    setProviderError(false)
  }

  const handleGameNamesChange = (event) => {
    setGameNames(event.target.value)
  }

  const generateCodes = (event) => {
    event.preventDefault()

    if (!selectedProvider) {
      setProviderError(true)
      return
    }

    // create array of unique game names, split by new line, remove empty strings
    const games = [
      ...new Set(
        gameNames
          .split('\n')
          .map((name) => name.trim())
          .filter((name) => name.length > 0)
      )
    ]

    // loop over unique game names and manipulate the name to create the game code

    const gameCodes = games.flatMap((game) => {
      let normalizedGameName = game

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(key, 'g')
        normalizedGameName = normalizedGameName.replace(regex, value)
      })

      let gameName
      if (selectedProvider === specialGameProviders.Amatic) {
        gameName = normalizedGameName
          .replace(/&/g, ' AND ')
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .replace(/ +/g, '')
          .toLowerCase()
      } else {
        gameName = normalizedGameName
          .replace(/&/g, ' AND ')
          .replace(/O'(\w)/g, 'O $1')
          .replace(/'s/g, 's')
          .replace(/'(?=\S)/g, ' ')
          .replace(/-/g, ' ')
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .replace(/ +/g, ' ')
          .replace(/ /g, '_')
          .toUpperCase()
      }

      // handle special cases
      if (selectedProvider === specialGameProviders.Amatic) {
        return [
          `${selectedProvider}_${gameName.toLowerCase()}`,
          `${selectedProvider}M_${gameName.toLowerCase()}`
        ]
      } else if (selectedProvider === specialGameProviders.Microgaming) {
        return [
          `${selectedProvider}D_${gameName.toUpperCase()}`,
          `${selectedProvider}M_${gameName.toUpperCase()}`
        ]
      } else if (Object.values(specialGameProviders).includes(selectedProvider)) {
        return [
          `${selectedProvider}_${gameName.toUpperCase()}`,
          `${selectedProvider}M_${gameName.toUpperCase()}`
        ]
      } else {
        return [`${selectedProvider}_${gameName.toUpperCase()}`]
      }
    })

    const newGameCodes = []
    const newGameCodeTooLong = []

    // check if any game codes are too long
    gameCodes.forEach((code) => {
      if (code?.length >= 51) {
        newGameCodeTooLong.push(code)
      } else {
        newGameCodes.push(code)
      }
    })

    setGameCodes(newGameCodes)
    setGameCodeTooLong(newGameCodeTooLong)
    setGameNames('')
  }

  return (
    <div className="form-output-wrapper">
      <form className="generator__form" onSubmit={generateCodes}>
        <select
          onChange={handleProviderChange}
          className={providerError ? 'generator__form--error' : ''}
        >
          <option value="">Select a game provider</option>
          {Object.entries(gameProviders).map(([provider, code], index) => (
            <option key={index} value={code}>
              {provider}
            </option>
          ))}
        </select>
        <textarea
          rows="8"
          value={gameNames}
          placeholder="Enter game names here, one per line"
          onChange={handleGameNamesChange}
          className="generator__textarea"
        ></textarea>
        <button className="button button--large button--primary" type="submit">
          Generate game codes
        </button>
      </form>
      <Output gameCodes={gameCodes} />
      <OutputBad gameCodeTooLong={gameCodeTooLong} />
    </div>
  )
}

export default Form
