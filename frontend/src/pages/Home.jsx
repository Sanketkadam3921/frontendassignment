import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import SummaryDashboard from '../components/SummaryDashboard';
import ExpenseList from '../components/ExpenseList';
import Settlements from '../components/Settlements';
const Home = () => {
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Expense Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <SummaryDashboard />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ExpenseList />
                </Grid>
                <Grid item xs={12}>
                    <Settlement />
                </Grid>
            </Grid>
        </Box>
    );
};