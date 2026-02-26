import { useState } from "react";
import GroupFilterForm from "../minicomponents/GroupFilterForm.jsx";
import config from '../config.js';
import Pagination from "../minicomponents/Pagination.jsx";
import GroupResults from "../minicomponents/GroupResult.jsx";
import { Box, Alert, Typography, Paper, CircularProgress } from '@mui/material';

const GroupSearch = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchedGroups, setSearchedGroups] = useState([]);
    const [filters, setFilters] = useState({
        group_name: '',
        topic: '',
        start_date_from: '',
        start_date_to: '',
        end_date_from: '',
        end_date_to: '',
        hours_per_week_from: '',
        hours_per_week_to: '',
        price_from: '',
        price_to: '',
        max_students_from: '',
        max_students_to: '',
        subjects: []
    });
    const [page, setPage] = useState(0);
    const [size] = useState(3);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState("");
    const [loadingResults, setLoadingResults] = useState(false);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        setPage(0);
        getSearchedGroups(0);
    };

    const getSearchedGroups = async (pageToFetch = page) => {
        setLoadingResults(true);
        try {
            setError("");
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${config.BASE_URL}/api/getGroups?page=${pageToFetch}&size=${size}&${queryParams}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                setError("Neuspjesno preuzimanje grupa.");
                return;
            }
            const data = await response.json();
            setSearchedGroups(data.groups || []);
            setTotalPages(Math.ceil((data.totalCount || 0) / size));
        } catch (searchError) {
            console.error('Search groups failed:', searchError);
            setError("Doslo je do greske pri pretrazi.");
        } finally {
            setLoadingResults(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        getSearchedGroups(newPage);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, p: { xs: 1, md: 2 }, flexDirection: { xs: "column", md: "row" } }}>
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #d8e3ef" }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Filteri</Typography>
                <GroupFilterForm filters={filters} onFilterChange={handleFilterChange} onSubmit={handleSubmit} />
            </Paper>
            <Box sx={{ flex: 2, maxHeight: 'calc(100vh - 20px)', overflow: 'auto' }}>
                {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                {loadingResults && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}
                {isSearching && !loadingResults && (
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Ukupno rezultata na stranici: {searchedGroups.length}
                    </Typography>
                )}
                <GroupResults isSearching={isSearching} groups={searchedGroups} />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </Box>
        </Box>
    );
};

export default GroupSearch;
