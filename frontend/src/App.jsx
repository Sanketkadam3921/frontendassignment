import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Container
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Home from './pages/Home';
import Analytics from './pages/Analytics';
import ExpenseForm from './components/ExpenseForm';
import RecurringForm from './components/RecurringForm';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    primary: {
      main: '#1c1c1c', // matte black
    },
    secondary: {
      main: '#424242', // darker grey
    },
    text: {
      primary: '#1c1c1c', // for main text
      secondary: '#555555',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1c1c1c',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#ffffff' }}>
              SplitWise
            </Typography>
            <Button sx={{ color: '#ffffff' }} component={Link} to="/">Home</Button>
            <Button sx={{ color: '#ffffff' }} component={Link} to="/analytics">Analytics</Button>
            <Button sx={{ color: '#ffffff' }} component={Link} to="/add-expense">Add Expense</Button>
            <Button sx={{ color: '#ffffff' }} component={Link} to="/add-recurring">Add Recurring</Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/add-expense" element={<ExpenseForm />} />
            <Route path="/add-recurring" element={<RecurringForm />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
