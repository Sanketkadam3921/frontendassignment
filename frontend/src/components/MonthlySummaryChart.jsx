import React, { useEffect, useState } from 'react';
import {
    Typography, Paper, Box, CircularProgress
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const MonthlySummaryChart = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlySummary = async () => {
            try {
                const res = await axios.get('http://localhost:3000/expenses/analytics/monthly-summary');
                const formatted = Object.entries(res.data.data || {}).map(([month, total]) => ({
                    month,
                    total: typeof total === 'number' ? total : 0,
                }));
                setMonthlyData(formatted);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching monthly summary:", err);
                setLoading(false);
            }
        };

        fetchMonthlySummary();
    }, []);

    if (loading) {
        return (
            <Box textAlign="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h6" mb={2}>Monthly Summary</Typography>
            <Paper elevation={3} sx={{ padding: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            formatter={(value, name) => [`₹${value}`, name]}
                            labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
};

export default MonthlySummaryChart;
