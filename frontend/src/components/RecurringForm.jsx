import React, { useState } from 'react';
import {
    Box, TextField, Button, MenuItem, Select, InputLabel, FormControl,
    Typography, Chip
} from '@mui/material';
import axios from 'axios';
import { API_BASE } from '../config';



const RecurringForm = () => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paid_by: '',
        participants: [],
        shareType: 'EQUAL',
        customShares: {},
        category: '',
        frequency: 'MONTHLY',
        startDate: '',
        endDate: ''
    });

    const people = ['Sanket', 'Om', 'Shantanu'];
    const categories = ['FOOD', 'RENT', 'ENTERTAINMENT'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCustomShareChange = (person, value) => {
        setFormData(prev => ({
            ...prev,
            customShares: {
                ...prev.customShares,
                [person]: Number(value)
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const payload = { ...formData };
            if (formData.shareType === 'EQUAL') delete payload.customShares;
            if (!formData.endDate) delete payload.endDate;

            await axios.post(`${API_BASE}/recurring`, payload);
            alert('Recurring expense created!');
            setFormData({
                amount: '',
                description: '',
                paid_by: '',
                participants: [],
                shareType: 'EQUAL',
                customShares: {},
                category: '',
                frequency: 'MONTHLY',
                startDate: '',
                endDate: ''
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create recurring expense');
        }
    };

    return (
        <Box p={3} maxWidth={500} mx="auto">
            <Typography variant="h6" mb={2}>Add Recurring Expense</Typography>

            <TextField
                label="Amount"
                name="amount"
                fullWidth
                type="number"
                margin="normal"
                value={formData.amount}
                onChange={handleChange}
            />

            <TextField
                label="Description"
                name="description"
                fullWidth
                margin="normal"
                value={formData.description}
                onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Paid By</InputLabel>
                <Select
                    name="paid_by"
                    value={formData.paid_by}
                    onChange={handleChange}
                >
                    {people.map(person => (
                        <MenuItem key={person} value={person}>{person}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Participants</InputLabel>
                <Select
                    multiple
                    name="participants"
                    value={formData.participants}
                    onChange={(e) => handleChange({ target: { name: 'participants', value: e.target.value } })}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map(value => (
                                <Chip key={value} label={value} />
                            ))}
                        </Box>
                    )}
                >
                    {people.map(person => (
                        <MenuItem key={person} value={person}>{person}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Share Type</InputLabel>
                <Select
                    name="shareType"
                    value={formData.shareType}
                    onChange={handleChange}
                >
                    <MenuItem value="EQUAL">EQUAL</MenuItem>
                    <MenuItem value="PERCENTAGE">PERCENTAGE</MenuItem>
                </Select>
            </FormControl>

            {formData.shareType === 'PERCENTAGE' && formData.participants.map(person => (
                <TextField
                    key={person}
                    label={`% share for ${person}`}
                    type="number"
                    margin="normal"
                    fullWidth
                    value={formData.customShares[person] || ''}
                    onChange={(e) => handleCustomShareChange(person, e.target.value)}
                />
            ))}

            <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Start Date"
                name="startDate"
                type="date"
                fullWidth
                margin="normal"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                label="End Date (optional)"
                name="endDate"
                type="date"
                fullWidth
                margin="normal"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
            />

            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSubmit}
            >
                Submit Recurring
            </Button>
        </Box>
    );
};

export default RecurringForm;
