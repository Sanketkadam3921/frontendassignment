import React, { useState, useEffect, useCallback } from 'react';
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
    Paper,
    Skeleton,
} from '@mui/material';
import {
    ArrowBack,
    TrendingUp,
    Category,
    Person,
    CalendarMonth,
    CompareArrows,
    Refresh,
    Download,
    FilterList,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://express-production-e484.up.railway.app/expenses';

// Helper function to format date for input
const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

// Helper function to format percentage
const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
};

function Analytics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [activeView, setActiveView] = useState('monthly');

    // Analytics data states
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

    // Filters state
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

    // API call functions
    const showAlert = useCallback((message, severity = 'success') => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 4000);
    }, []);

    const fetchMonthlySummary = async () => {
        try {
            const response = await axios.get(`${API_BASE}/analytics/monthly-summary`, {
                params: { year: filters.year, month: filters.month }
            });
            setMonthlySummary(response.data.data || null);
        } catch (error) {
            console.error("Monthly summary error:", error);
            setMonthlySummary(null);
            showAlert('Failed to fetch monthly summary', 'error');
        }
    };

    const fetchCategorySummary = async () => {
        try {
            const response = await axios.get(`${API_BASE}/category-summary`, {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }
            });
            setCategorySummary(response.data?.data?.summary || []);
        } catch (error) {
            console.error("Category summary error:", error);
            setCategorySummary([]);
            showAlert('Failed to fetch category summary', 'error');
        }
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
            console.error("Spending patterns error:", error);
            setSpendingPatterns(null);
            showAlert('Failed to fetch spending patterns', 'error');
        }
    };

    const fetchTopExpenses = async () => {
        try {
            const params = {};

            if (filters.limit && !isNaN(filters.limit)) {
                params.limit = parseInt(filters.limit);
            }

            if (filters.category && filters.category.trim().toLowerCase() !== 'all') {
                params.category = filters.category.trim();
            }

            if (filters.timeframe) {
                params.timeframe = filters.timeframe;
            }

            const response = await axios.get(`${API_BASE}/analytics/top-expenses`, {
                params
            });

            setTopExpenses(response?.data?.data?.expenses || []);
        } catch (error) {
            console.error("Top expenses error:", error);
            setTopExpenses([]);
            showAlert('Failed to fetch top expenses', 'error');
        }
    };

    const fetchIndividualVsGroup = async () => {
        try {
            const response = await axios.get(`${API_BASE}/analytics/individual-vs-group`, {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate
                }
            });
            setIndividualVsGroup(response.data?.data || null);
        } catch (error) {
            console.error("Individual vs group error:", error);
            setIndividualVsGroup(null);
            showAlert('Failed to fetch comparison data', 'error');
        }
    };

    // Main fetch function
    const fetchAnalytics = useCallback(async () => {
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
    }, [activeView, filters, showAlert]);

    // Effect to fetch data when filters or view changes
    useEffect(() => {
        if (JSON.stringify(filters) !== JSON.stringify(prevFilters) || activeView !== prevView) {
            fetchAnalytics();
            setPrevFilters(filters);
            setPrevView(activeView);
        }
    }, [filters, activeView, fetchAnalytics, prevFilters, prevView]);

    // Event handlers
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

    const handleRefresh = () => {
        fetchAnalytics();
    };

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} md={6} key={item}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="60%" height={32} />
                            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
                            <Box display="flex" gap={1} mt={2}>
                                <Skeleton variant="rounded" width={80} height={32} />
                                <Skeleton variant="rounded" width={100} height={32} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    // Render functions for different views
    const renderMonthlySummary = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonth color="primary" />
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
                                inputProps={{ min: 2020, max: 2030 }}
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
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Monthly Summary - {filters.month}/{filters.year}
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Chip
                                    icon={<TrendingUp />}
                                    label={`Total: ${formatCurrency(monthlySummary.totalAmount)}`}
                                    sx={{ bgcolor: '#1976d2', color: 'white', fontSize: '1rem', p: 1 }}
                                />
                                <Chip
                                    label={`Expenses: ${monthlySummary.totalExpenses || 0}`}
                                    sx={{ bgcolor: '#388e3c', color: 'white', fontSize: '1rem', p: 1 }}
                                />
                                <Chip
                                    label={`Avg: ${formatCurrency(monthlySummary.averageExpense)}`}
                                    sx={{ bgcolor: '#f57c00', color: 'white', fontSize: '1rem', p: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            )}

            {!monthlySummary && !loading && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No data available for {filters.month}/{filters.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try selecting a different month or year
                        </Typography>
                    </Paper>
                </Grid>
            )}
        </Grid>
    );

    const renderCategorySummary = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterList color="primary" />
                            Date Range
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column">
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
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category color="primary" />
                            Category Breakdown
                        </Typography>
                        <List dense>
                            {categorySummary.length > 0 ? (
                                categorySummary.map((cat, index) => (
                                    <React.Fragment key={cat.category || index}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                        {cat.category || 'Uncategorized'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box display="flex" gap={1} mt={1}>
                                                        <Chip
                                                            label={formatCurrency(cat.totalAmount)}
                                                            size="small"
                                                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                                                        />
                                                        <Chip
                                                            label={`${cat.expenseCount || 0} expenses`}
                                                            size="small"
                                                            sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < categorySummary.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No category data available for the selected date range
                                    </Typography>
                                </Paper>
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
            }).sort((a, b) => b.amount - a.amount)
            : [];

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="primary" />
                                Filters
                            </Typography>
                            <Box display="flex" gap={2} flexDirection="column">
                                <TextField
                                    label="Person"
                                    name="person"
                                    value={filters.person}
                                    onChange={handleFilterChange}
                                    size="small"
                                    placeholder="Enter person name"
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

                <Grid item xs={12} md={8}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUp color="primary" />
                                Spending Patterns
                            </Typography>

                            {spendingPatterns ? (
                                <>
                                    <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                                        <Chip
                                            label={`Total: ${formatCurrency(spendingPatterns.totalAmount)}`}
                                            sx={{ bgcolor: '#1976d2', color: 'white', fontSize: '1rem', p: 1 }}
                                        />
                                        <Chip
                                            label={`Avg per expense: ${formatCurrency(
                                                spendingPatterns.totalExpenses > 0
                                                    ? spendingPatterns.totalAmount / spendingPatterns.totalExpenses
                                                    : 0
                                            )}`}
                                            sx={{ bgcolor: '#388e3c', color: 'white', fontSize: '1rem', p: 1 }}
                                        />
                                    </Box>

                                    {filters.person && categoryBreakdown.length > 0 ? (
                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                                                {filters.person}'s Category Breakdown
                                            </Typography>
                                            <List dense>
                                                {categoryBreakdown.map((item, index) => (
                                                    <ListItem key={index} sx={{ px: 0 }}>
                                                        <ListItemText
                                                            primary={item.category || 'Uncategorized'}
                                                            secondary={
                                                                <Box display="flex" gap={1} mt={1}>
                                                                    <Chip
                                                                        label={formatCurrency(item.amount)}
                                                                        size="small"
                                                                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                                                                    />
                                                                    <Chip
                                                                        label={formatPercentage(item.percentage)}
                                                                        size="small"
                                                                        sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}
                                                                    />
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    ) : (
                                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {filters.person
                                                    ? "No category breakdown found for selected person."
                                                    : "Enter a person name to view their category breakdown."
                                                }
                                            </Typography>
                                        </Paper>
                                    )}
                                </>
                            ) : (
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No spending patterns data available
                                    </Typography>
                                </Paper>
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
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterList color="primary" />
                            Filters
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column">
                            <TextField
                                label="Limit"
                                type="number"
                                name="limit"
                                value={filters.limit}
                                onChange={handleNumberFilterChange}
                                size="small"
                                inputProps={{ min: 1, max: 100 }}
                            />
                            <TextField
                                label="Category"
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                size="small"
                                placeholder="Enter category"
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
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp color="primary" />
                            Top Expenses
                        </Typography>
                        <List dense>
                            {topExpenses.length > 0 ? (
                                topExpenses.map((expense, index) => (
                                    <React.Fragment key={expense.id || index}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                        {expense.description || expense.title || 'No description'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box mt={1}>
                                                        <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                                                            <Chip
                                                                label={formatCurrency(expense.amount)}
                                                                size="small"
                                                                sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }}
                                                            />
                                                            <Chip
                                                                label={expense.category || 'Uncategorized'}
                                                                size="small"
                                                                sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {expense.person || 'Unknown'} • {expense.date ? new Date(expense.date).toLocaleDateString('en-IN') : 'No date'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip
                                                    label={`#${index + 1}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: index < 3 ? '#ffd700' : '#e0e0e0',
                                                        color: index < 3 ? '#d84315' : '#424242',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                        </ListItem>
                                        {index < topExpenses.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No top expenses to display for the selected criteria
                                    </Typography>
                                </Paper>
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
                <Card elevation={2}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterList color="primary" />
                            Date Range
                        </Typography>
                        <Box display="flex" gap={2} flexDirection="column">
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
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CompareArrows color="primary" />
                                Individual vs Group Comparison
                            </Typography>
                            <Box display="flex" gap={3} flexDirection="column">
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="primary">
                                        Individual Expenses
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        <Chip
                                            label={formatCurrency(individualVsGroup.individual?.totalAmount)}
                                            sx={{ bgcolor: '#2196f3', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        <Chip
                                            label={`${individualVsGroup.individual?.count || 0} expenses`}
                                            sx={{ bgcolor: '#1976d2', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        {individualVsGroup.individual?.percentage && (
                                            <Chip
                                                label={formatPercentage(individualVsGroup.individual.percentage)}
                                                sx={{ bgcolor: '#0d47a1', color: 'white', fontSize: '0.9rem' }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="success.main">
                                        Group Expenses
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                        <Chip
                                            label={formatCurrency(individualVsGroup.group?.totalAmount)}
                                            sx={{ bgcolor: '#4caf50', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        <Chip
                                            label={`${individualVsGroup.group?.count || 0} expenses`}
                                            sx={{ bgcolor: '#388e3c', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        {individualVsGroup.group?.percentage && (
                                            <Chip
                                                label={formatPercentage(individualVsGroup.group.percentage)}
                                                sx={{ bgcolor: '#2e7d32', color: 'white', fontSize: '0.9rem' }}
                                            />
                                        )}
                                        {individualVsGroup.group?.averageParticipants && (
                                            <Chip
                                                label={`Avg ${individualVsGroup.group.averageParticipants} participants`}
                                                sx={{ bgcolor: '#1b5e20', color: 'white', fontSize: '0.9rem' }}
                                            />
                                        )}
                                    </Box>

                                    {individualVsGroup.group?.categories && (
                                        <Box>
                                            <Typography variant="body2" gutterBottom fontWeight="medium">
                                                Group Categories:
                                            </Typography>
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                {Object.entries(individualVsGroup.group.categories).map(([category, amount]) => (
                                                    <Chip
                                                        key={category}
                                                        label={`${category}: ${formatCurrency(amount)}`}
                                                        size="small"
                                                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                <Box>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="secondary">
                                        Total Summary
                                    </Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        <Chip
                                            label={`Total: ${formatCurrency(individualVsGroup.total?.amount)}`}
                                            sx={{ bgcolor: '#9c27b0', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        <Chip
                                            label={`${individualVsGroup.total?.expenses || 0} expenses`}
                                            sx={{ bgcolor: '#7b1fa2', color: 'white', fontSize: '0.9rem' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ) : (
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    No comparison data available for the selected date range
                                </Typography>
                            </Paper>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );

    // Main content renderer
    const renderContent = () => {
        if (loading) {
            return <LoadingSkeleton />;
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
                return (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Select an analytics view from the tabs above
                        </Typography>
                    </Paper>
                );
        }
    };

    // Export data functionality
    const handleExportData = () => {
        try {
            let dataToExport = {};
            const timestamp = new Date().toISOString().split('T')[0];

            switch (activeView) {
                case 'monthly':
                    dataToExport = { monthlySummary, filters, timestamp };
                    break;
                case 'category':
                    dataToExport = { categorySummary, filters, timestamp };
                    break;
                case 'patterns':
                    dataToExport = { spendingPatterns, filters, timestamp };
                    break;
                case 'top':
                    dataToExport = { topExpenses, filters, timestamp };
                    break;
                case 'individual':
                    dataToExport = { individualVsGroup, filters, timestamp };
                    break;
                default:
                    dataToExport = { message: 'No data to export' };
            }

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expense-analytics-${activeView}-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showAlert('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showAlert('Failed to export data', 'error');
        }
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Back to Expenses
                    </Button>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Analytics Dashboard
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Button
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        variant="outlined"
                        disabled={loading}
                        sx={{ borderRadius: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        startIcon={<Download />}
                        onClick={handleExportData}
                        variant="contained"
                        sx={{ borderRadius: 2, bgcolor: '#1976d2' }}
                    >
                        Export
                    </Button>
                </Box>
            </Box>

            {/* Alert */}
            {alert.show && (
                <Alert
                    severity={alert.severity}
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setAlert({ show: false, message: '', severity: 'success' })}
                >
                    {alert.message}
                </Alert>
            )}

            {/* Navigation Tabs */}
            <Box display="flex" gap={1} mb={3} flexWrap="wrap" sx={{
                bgcolor: 'white',
                p: 1,
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {[
                    { key: 'monthly', label: 'Monthly', icon: CalendarMonth },
                    { key: 'category', label: 'Categories', icon: Category },
                    { key: 'patterns', label: 'Patterns', icon: TrendingUp },
                    { key: 'top', label: 'Top Expenses', icon: TrendingUp },
                    { key: 'individual', label: 'Individual vs Group', icon: CompareArrows }
                ].map(({ key, label, icon: Icon }) => (
                    <Button
                        key={key}
                        variant={activeView === key ? 'contained' : 'text'}
                        startIcon={<Icon />}
                        onClick={() => setActiveView(key)}
                        sx={{
                            borderRadius: 2,
                            bgcolor: activeView === key ? '#1976d2' : 'transparent',
                            color: activeView === key ? 'white' : 'inherit',
                            '&:hover': {
                                bgcolor: activeView === key ? '#1565c0' : 'rgba(0,0,0,0.04)'
                            },
                            textTransform: 'none',
                            fontWeight: activeView === key ? 'bold' : 'normal'
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </Box>

            {/* Content */}
            <Box sx={{ position: 'relative' }}>
                {loading && (
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bgcolor="rgba(255,255,255,0.8)"
                        zIndex={1}
                        borderRadius={2}
                    >
                        <CircularProgress size={40} />
                    </Box>
                )}
                {renderContent()}
            </Box>

            {/* Footer */}
            <Box mt={4} pt={3} borderTop="1px solid #e0e0e0" textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Analytics Dashboard • Last updated: {new Date().toLocaleString('en-IN')}
                </Typography>
            </Box>
        </Box>
    );
}

export default Analytics;