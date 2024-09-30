import { createTheme, Paper } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#102BEF',
    },
    secondary: {
      main: '#575962',
    },
  },
  typography: {
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#9597a1',
          color: '#FFFFFF',
        },
      },
    },
  },
})

export default theme
