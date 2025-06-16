import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MonthlySummaryChart from '../components/MonthlySummaryChart';

const Analytics = () => {
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Analytics & Insights
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <AnalyticsDashboard />
                </Grid>
                <Grid item xs={12} md={6}>
                    <MonthlySummaryChart />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;
