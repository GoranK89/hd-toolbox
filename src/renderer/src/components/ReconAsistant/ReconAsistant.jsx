import { useRecon } from '../../hooks/useRecon'

const ReconAsistant = () => {
  const { formatSheet } = useRecon()

  const handleClick = () => {
    formatSheet()
  }

  return (
    <div className="recon-assistant-container">
      <header className="recon-header">
        <h1>Recon Manager</h1>
        <p>Streamline your monthly reconciliation tasks.</p>
      </header>
      <button onClick={handleClick}>Do something</button>
    </div>
  )
}

export default ReconAsistant

/*
1.) Recon folder exists on desktop, create it if not
2.) App searches for the exported .xls file
3.) Format sheet, delete GPs that should not be contacted (our rgs, etc.), add action column, use CLOSE and CANCEL for Playson already
4.) split into sheets, name accordingly
5.) read sheets, display them in app. Show in a table, update statuses, links to ticketings, contacts, auto-prepared text.
6.) finish month - email list on who to write to, generated final text & title.
*/
