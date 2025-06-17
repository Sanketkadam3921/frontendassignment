import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Grid,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip
} from '@mui/material';
import axios from 'axios';
import { API_BASE } from '../config';

const Settlements = () => {
    const [balances, setBalances] = useState({});
    const [settlements, setSettlements] = useState([]);
    const [people, setPeople] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch balances
                const balanceRes = await axios.get(`${API_BASE}/balances`);
                setBalances(balanceRes.data.data);

                // Fetch settlements
                const settlementRes = await axios.get(`${API_BASE}/settlements`);
                setSettlements(settlementRes.data.data);

                // Fetch people
                const peopleRes = await axios.get(`${API_BASE}/expenses/people`);
                setPeople(peopleRes.data.data);
            } catch (err) {
                console.error('Error fetching settlement data:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Settlement Dashboard
            </Typography>

            {/* Balances Section */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
                Current Balances
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {Object.entries(balances).map(([person, data]) => (
                    <Grid item xs={12} sm={6} md={4} key={person}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{person}</Typography>
                                <Typography color="text.secondary">
                                    Paid: ₹{data.paid}
                                </Typography>
                                <Typography color="text.secondary">
                                    Owes: ₹{data.owes}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    Balance:
                                    <Chip
                                        label={`₹${data.balance}`}
                                        color={data.balance >= 0 ? 'success' : 'error'}
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Settlements Section */}
            <Typography variant="h5" gutterBottom>
                Required Settlements
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {settlements.map((settlement, index) => (
                            <TableRow key={index}>
                                <TableCell>{settlement.from}</TableCell>
                                <TableCell>{settlement.to}</TableCell>
                                <TableCell align="right">₹{settlement.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* People List */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                All Members
            </Typography>
            <Box>
                {people.map((person, index) => (
                    <Chip
                        key={index}
                        label={person}
                        sx={{ mr: 1, mb: 1 }}
                        variant="outlined"
                    />
                ))}
            </Box>
        </Box>
    );
};

export default Settlements;