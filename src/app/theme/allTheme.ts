import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#102BEF',
    },
    secondary: {
      main: '#575962',
    },
    background: {
      default: '#787b87',
      paper: '#575962',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#787b87',
          color: '#FFFFFF',
        },
      },
    },
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
