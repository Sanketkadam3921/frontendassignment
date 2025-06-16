import React, { useEffect, useState } from 'react';
import {
    Typography, Paper, Box, CircularProgress
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

const SummaryDashboard = () => {
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('http://localhost:3000/expenses/category-summary');

                // Extract the summary array
                const summary = res.data.data.summary;

                // Format it for PieChart: needs name + value
                const formatted = summary.map(item => ({
                    name: item.category,
                    value: item.totalAmount,
                }));

                setCategoryData(formatted);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };


        fetchSummary();
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
            <Typography variant="h6" mb={2}>Category Summary</Typography>
            <Paper elevation={3} sx={{ padding: 2, height: 500, width: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            dataKey="value"
                            isAnimationActive
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    );
};

export default SummaryDashboard;
