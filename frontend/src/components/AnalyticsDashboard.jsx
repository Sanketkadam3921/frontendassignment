import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    ArrowBack,
    TrendingUp,
    Category,
    Person,
    CalendarMonth,
    CompareArrows,
} from '@mui/icons-material';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL;
//const API_BASE = 'http://localhost:3000/expenses';

// Helper function to format date for input
const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
};

function Analytics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [activeView, setActiveView] = useState('monthly');

    // Analytics data
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [categorySummary, setCategorySummary] = useState([]);
    const [spendingPatterns, setSpendingPatterns] = useState(null);
    const [topExpenses, setTopExpenses] = useState([]);
    const [individualVsGroup, setIndividualVsGroup] = useState(null);

    // Get dates for default range (last month)
    const getDefaultStartDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return formatDateForInput(date);
    };

    const getDefaultEndDate = () => {
        return formatDateForInput(new Date());
    };

    // Filters
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        person: '',
        startDate: getDefaultStartDate(),
        endDate: getDefaultEndDate(),
        category: '',
        timeframe: 'month',
        limit: 10,
    });

    // Store previous filters to avoid unnecessary API calls
    const [prevFilters, setPrevFilters] = useState({});
    const [prevView, setPrevView] = useState('');

    useEffect(() => {
        // Only fetch if filters or view actually changed
        if (JSON.stringify(filters) !== JSON.stringify(prevFilters) || activeView !== prevView) {
            fetchAnalytics();
            setPrevFilters(filters);
            setPrevView(activeView);
        }
    }, [filters, activeView]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            switch (activeView) {
                case 'monthly':
                    await fetchMonthlySummary();
                    break;
                case 'category':
                    await fetchCategorySummary();
                    break;
                case 'patterns':
                    await fetchSpendingPatterns();
                    break;
                case 'top':
                    await fetchTopExpenses();
                    break;
                case 'individual':
                    await fetchIndividualVsGroup();
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showAlert('Error fetching analytics data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, severity = 'success') => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 4000);
    };

    const fetchMonthlySummary = async () => {
        const response = await axios.get(`${API_BASE}/analytics/monthly-summary`, {
            params: { year: filters.year, month: filters.month }
        });
        setMonthlySummary(response.data.data || null);
    };

    const fetchCategorySummary = async () => {
        const response = await axios.get(`${API_BASE}/category-summary`, {
            params: {
                startDate: filters.startDate,
                endDate: filters.endDate
            }
        });
        setCategorySummary(response.data?.data?.summary || []);
    };

    const fetchSpendingPatterns = async () => {
        try {
            const response = await axios.get(`${API_BASE}/analytics/spending-patterns`, {
                params: {
                    person: filters.person || undefined,
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }
            });
            setSpendingPatterns(response.data?.data || null);
        } catch (error) {
            console.error("Failed to fetch spending patterns:", error);
            setSpendingPatterns(null);
        }
    };


    const fetchTopExpenses = async () => {
        try {
            const params = {};

            if (filters.limit && !isNaN(filters.limit)) {
                params.limit = parseInt(filters.limit);
            }

            if (filters.category?.trim()) {
                params.category = filters.category.trim();
            }

            if (filters.timeframe) {
                params.timeframe = filters.timeframe;
            }

            const response = await axios.get('https://express-production-e484.up.railway.app/expenses/analytics/top-expenses', {
                params
            });

            console.log("TOP EXPENSES RESPONSE:", response.data);
            setTopExpenses(response.data.expenses || []);
        } catch (error) {
            console.error("TOP EXPENSES FETCH ERROR:", error);
        }
    };


    const fetchIndividualVsGroup = async () => {
        const response = await axios.get(`${API_BASE}/analytics/individual-vs-group`, {
            params: {
                startDate: filters.startDate,
                endDate: filters.endDate
            }
        });
        setIndividualVsGroup(response.data?.data || null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value ? parseInt(value) : 0
        }));
    };

    const renderMonthlySummary = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Month Controls
                        </Typography>
                        <Box display="flex" gap={2} component="form" onSubmit={(e) => e.preventDefault()}>
                            <TextField
                                label="Year"
                                type="number"
                                name="year"
                                value={filters.year}
                                onChange={handleNumberFilterChange}
                                size="small"
                            />
                            <TextField
                                label="Month"
                                type="number"
                                name="month"
                                value={filters.month}
                                onChange={handleNumberFilterChange}
                                inputProps={{ min: 1, max: 12 }}
                                size="small"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {monthlySummary && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Monthly Summary - {filters.month}/{filters.year}
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Chip
                                    icon={<TrendingUp />}
                                    label={`Total: ₹${monthlySummary.totalAmount || 0}`}
                                    sx={{ bgcolor: '#333', color: 'white' }}
                                />
                                <Chip
                                    label={`Expenses: ${monthlySummary.totalExpenses || 0}`}
                                    sx={{ bgcolor: '#444', color: 'white' }}
                                />
                                <Chip
                                    label={`Avg: ₹${monthlySummary.averageExpense || 0}`}
                                    sx={{ bgcolor: '#555', color: 'white' }}
                                />

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );

    const renderCategorySummary = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Date Range
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column" component="form" onSubmit={(e) => e.preventDefault()}>
                            <TextField
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Category Breakdown
                        </Typography>
                        <List dense>
                            {categorySummary.length > 0 ? (
                                categorySummary.map((cat, index) => (
                                    <React.Fragment key={cat.category || index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={cat.category || 'Uncategorized'}
                                                secondary={`₹${cat.totalAmount || 0} (${cat.expenseCount || 0} expenses)`}
                                            />
                                        </ListItem>
                                        {index < categorySummary.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No category data available
                                </Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSpendingPatterns = () => {
        const selectedPersonData = filters.person
            ? spendingPatterns?.individualSpending?.[filters.person]
            : null;

        const categoryBreakdown = selectedPersonData
            ? Object.entries(selectedPersonData.categoryBreakdown || {}).map(([category, amount]) => {
                const percentage = selectedPersonData.totalPaid
                    ? Math.round((amount / selectedPersonData.totalPaid) * 100)
                    : 0;
                return { category, amount, percentage };
            })
            : [];

        return (
            <Grid container spacing={3}>
                {/* Filters */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Filters
                            </Typography>
                            <Box display="flex" gap={2} flexDirection="column" component="form" onSubmit={(e) => e.preventDefault()}>
                                <TextField
                                    label="Person"
                                    name="person"
                                    value={filters.person}
                                    onChange={handleFilterChange}
                                    size="small"
                                />
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Data Display */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Spending Patterns
                            </Typography>

                            {spendingPatterns ? (
                                <>
                                    <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                                        <Chip
                                            label={`Total Amount: ₹${spendingPatterns.totalAmount || 0}`}
                                            sx={{ bgcolor: '#333', color: 'white' }}
                                        />
                                        <Chip
                                            label={`Avg per expense: ₹${spendingPatterns.totalExpenses > 0
                                                ? Math.round(spendingPatterns.totalAmount / spendingPatterns.totalExpenses)
                                                : 0
                                                }`}
                                            sx={{ bgcolor: '#444', color: 'white' }}
                                        />
                                    </Box>

                                    {filters.person && categoryBreakdown.length > 0 ? (
                                        <List dense>
                                            {categoryBreakdown.map((item, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={item.category || 'Uncategorized'}
                                                        secondary={`₹${item.amount} (${item.percentage}%)`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            {filters.person ? "No category breakdown found for selected person." : "Select a person to view category breakdown."}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No spending patterns data to display
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };


    const renderTopExpenses = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filters
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column" component="form" onSubmit={(e) => e.preventDefault()}>
                            <TextField
                                label="Limit"
                                type="number"
                                name="limit"
                                value={filters.limit}
                                onChange={handleNumberFilterChange}
                                size="small"
                            />
                            <TextField
                                label="Category"
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                size="small"
                            />
                            <FormControl size="small">
                                <InputLabel>Timeframe</InputLabel>
                                <Select
                                    value={filters.timeframe}
                                    onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                                    label="Timeframe"
                                    name="timeframe"
                                >
                                    <MenuItem value="week">Week</MenuItem>
                                    <MenuItem value="month">Month</MenuItem>
                                    <MenuItem value="quarter">Quarter</MenuItem>
                                    <MenuItem value="year">Year</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Top Expenses
                        </Typography>
                        <List dense>
                            {topExpenses.length > 0 ? (
                                topExpenses.map((expense, index) => (
                                    <React.Fragment key={expense.id || index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={expense.description || expense.title || 'No description'}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ₹{expense.amount || 0} - {expense.category || 'Uncategorized'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {expense.person || 'Unknown'} • {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Chip
                                                label={`#${index + 1}`}
                                                size="small"
                                                sx={{ bgcolor: '#333', color: 'white' }}
                                            />
                                        </ListItem>
                                        {index < topExpenses.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No top expenses to display
                                </Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderIndividualVsGroup = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Date Range
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column" component="form" onSubmit={(e) => e.preventDefault()}>
                            <TextField
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {individualVsGroup ? (
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Individual vs Group Comparison
                            </Typography>
                            <Box display="flex" gap={2} flexDirection="column">
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Individual Expenses
                                    </Typography>
                                    <Chip
                                        label={`₹${individualVsGroup.individual?.totalAmount || 0}`}
                                        sx={{ bgcolor: '#2196f3', color: 'white', mr: 1 }}
                                    />
                                    <Chip
                                        label={`${individualVsGroup.individual?.count || 0} expenses`}
                                        sx={{ bgcolor: '#1976d2', color: 'white' }}
                                    />
                                    {individualVsGroup.individual?.percentage && (
                                        <Chip
                                            label={`${individualVsGroup.individual.percentage}% of total`}
                                            sx={{ bgcolor: '#0d47a1', color: 'white', ml: 1 }}
                                        />
                                    )}
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Group Expenses
                                    </Typography>
                                    <Chip
                                        label={`₹${individualVsGroup.group?.totalAmount || 0}`}
                                        sx={{ bgcolor: '#4caf50', color: 'white', mr: 1 }}
                                    />
                                    <Chip
                                        label={`${individualVsGroup.group?.count || 0} expenses`}
                                        sx={{ bgcolor: '#388e3c', color: 'white' }}
                                    />
                                    {individualVsGroup.group?.percentage && (
                                        <Chip
                                            label={`${individualVsGroup.group.percentage}% of total`}
                                            sx={{ bgcolor: '#2e7d32', color: 'white', ml: 1 }}
                                        />
                                    )}
                                    {individualVsGroup.group?.averageParticipants && (
                                        <Chip
                                            label={`Avg ${individualVsGroup.group.averageParticipants} participants`}
                                            sx={{ bgcolor: '#1b5e20', color: 'white', ml: 1 }}
                                        />
                                    )}
                                </Box>

                                {individualVsGroup.group?.categories && (
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Group Expense Categories
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {Object.entries(individualVsGroup.group.categories).map(([category, amount]) => (
                                                <Chip
                                                    key={category}
                                                    label={`${category}: ₹${amount}`}
                                                    size="small"
                                                    sx={{ bgcolor: '#333', color: 'white' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Total
                                    </Typography>
                                    <Chip
                                        label={`₹${individualVsGroup.total?.amount || 0}`}
                                        sx={{ bgcolor: '#9c27b0', color: 'white', mr: 1 }}
                                    />
                                    <Chip
                                        label={`${individualVsGroup.total?.expenses || 0} expenses`}
                                        sx={{ bgcolor: '#7b1fa2', color: 'white' }}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ) : (
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                No comparison data to display
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                    <CircularProgress />
                </Box>
            );
        }

        switch (activeView) {
            case 'monthly':
                return renderMonthlySummary();
            case 'category':
                return renderCategorySummary();
            case 'patterns':
                return renderSpendingPatterns();
            case 'top':
                return renderTopExpenses();
            case 'individual':
                return renderIndividualVsGroup();
            default:
                return <Typography>Select an analytics view</Typography>;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        variant="outlined"
                    >
                        Back to Expenses
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        Analytics Dashboard
                    </Typography>
                </Box>
            </Box>

            {/* Alert */}
            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {/* Navigation Tabs */}
            <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                <Button
                    variant={activeView === 'monthly' ? 'contained' : 'outlined'}
                    startIcon={<CalendarMonth />}
                    onClick={() => setActiveView('monthly')}
                    sx={{
                        bgcolor: activeView === 'monthly' ? '#333' : 'transparent',
                        color: activeView === 'monthly' ? 'white' : 'inherit',
                        '&:hover': { bgcolor: activeView === 'monthly' ? '#555' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Monthly
                </Button>
                <Button
                    variant={activeView === 'category' ? 'contained' : 'outlined'}
                    startIcon={<Category />}
                    onClick={() => setActiveView('category')}
                    sx={{
                        bgcolor: activeView === 'category' ? '#333' : 'transparent',
                        color: activeView === 'category' ? 'white' : 'inherit',
                        '&:hover': { bgcolor: activeView === 'category' ? '#555' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Categories
                </Button>
                <Button
                    variant={activeView === 'patterns' ? 'contained' : 'outlined'}
                    startIcon={<TrendingUp />}
                    onClick={() => setActiveView('patterns')}
                    sx={{
                        bgcolor: activeView === 'patterns' ? '#333' : 'transparent',
                        color: activeView === 'patterns' ? 'white' : 'inherit',
                        '&:hover': { bgcolor: activeView === 'patterns' ? '#555' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Patterns
                </Button>
                <Button
                    variant={activeView === 'top' ? 'contained' : 'outlined'}
                    startIcon={<TrendingUp />}
                    onClick={() => setActiveView('top')}
                    sx={{
                        bgcolor: activeView === 'top' ? '#333' : 'transparent',
                        color: activeView === 'top' ? 'white' : 'inherit',
                        '&:hover': { bgcolor: activeView === 'top' ? '#555' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Top Expenses
                </Button>
                <Button
                    variant={activeView === 'individual' ? 'contained' : 'outlined'}
                    startIcon={<CompareArrows />}
                    onClick={() => setActiveView('individual')}
                    sx={{
                        bgcolor: activeView === 'individual' ? '#333' : 'transparent',
                        color: activeView === 'individual' ? 'white' : 'inherit',
                        '&:hover': { bgcolor: activeView === 'individual' ? '#555' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Individual vs Group
                </Button>
            </Box>

            {/* Content */}
            {renderContent()}
        </Box>
    );
}

export default Analytics;