import React, { useState, useEffect } from 'react';
import GroupFilterForm from "../minicomponents/GroupFilterForm.jsx";
import config from '../config.js';
import Pagination from "../minicomponents/Pagination.jsx";
import GroupResults from "../minicomponents/GroupResult.jsx";

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
    const [size, setSize] = useState(3); // Default veličina stranice
    const [totalPages, setTotalPages] = useState(0);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        setPage(0); // Resetovanje na prvu stranicu pri novoj pretrazi
        getSearchedGroups(0);
    };

    const getSearchedGroups = async (pageToFetch = page) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${config.BASE_URL}/api/getGroups?page=${pageToFetch}&size=${size}&${queryParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Problem s fetchanjem grupa");
            return;
        }
        const data = await response.json();
        setSearchedGroups(data.groups);
        setTotalPages(Math.ceil(data.totalCount / size)); // Racunanje ukupnog broja stranice
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        getSearchedGroups(newPage);
    };

    return (
        <div style={{ display: 'flex' }}>
            <GroupFilterForm filters={filters} onFilterChange={handleFilterChange} onSubmit={handleSubmit} />
            <div style={{ flex: 2 }}>
                <GroupResults isSearching={isSearching} groups={searchedGroups} />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default GroupSearch;
