import fs from 'fs'

async function readJSONFile(path) {
  try {
    const data = await fs.promises.readFile(path, 'utf8')
    if (!data) {
      console.warn(`File at ${path} is empty. Returning an empty array.`)
      return []
    }
    return JSON.parse(data)
  } catch (error) {
    console.error(`Failed to read or parse file at ${path}:`, error)
    throw error
  }
}

async function writeJSONFile(path, data) {
  try {
    const jsonData = JSON.stringify(data, null, 2)
    await fs.promises.writeFile(path, jsonData)
  } catch (error) {
    console.error(`Failed to write file at ${path}:`, error)
    throw error
  }
}

export { readJSONFile, writeJSONFile }
