import { setupGameHandlers } from './gameHandlers'
import { setupIconHandlers } from './iconHandlers'
import { setupReconHandlers } from './reconHandlers'

export default function setupIpcHandlers() {
  setupGameHandlers()
  setupIconHandlers()
  setupReconHandlers()
}
