import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Chip, Box
} from '@mui/material';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL;

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await axios.post(`${API_BASE}/expenses`);

                console.log('Fetched expenses:', res.data);
                setExpenses(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchExpenses();
    }, []);


    return (
        <Box p={3}>
            <Typography variant="h6" mb={2}>All Expenses</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Paid By</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Share Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.map((exp) => (
                            <TableRow key={exp._id}>
                                <TableCell>{exp.description}</TableCell>
                                <TableCell>₹{exp.amount}</TableCell>
                                <TableCell>{exp.paidBy}</TableCell>
                                <TableCell>
                                    {exp.participants.map(p => (
                                        <Chip key={p} label={p} size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>{exp.category}</TableCell>
                                <TableCell>{exp.shareType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ExpenseList;
