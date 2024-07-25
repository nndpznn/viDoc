import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import { useState } from 'react'

export default function LogoutButton({ logoutFunction }: { logoutFunction: Function }) {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleLogout = () => {
    setOpen(false)
    logoutFunction()
  }

  return (
    <>
      <Button variant="contained" onClick={handleOpen} sx={{ ml: 1, mt: 2 }}>
        Log Out
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">{'Log out?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will have to sign into viDoc again to see your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleLogout} autoFocus>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
