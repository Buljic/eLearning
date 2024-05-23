import React, { useState } from 'react';
import GroupFilterForm from './GroupFilterForm';
import GroupResults from './GroupResults';

const GroupSearch = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchedGroups, setSearchedGroups] = useState([]);
    const [filters, setFilters] = useState({
        group_name: '',
        topic: '',
        start_date: '',
        end_date: '',
        hours_per_week: '',
        price: '',
        subjects: [],
        max_students: ''
    });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        getSearchedGroups();
    };

    const getSearchedGroups = async () => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`http://localhost:8080/api/getGroups?${queryParams}`, {
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
        setSearchedGroups(data);
    };

    return (
        <div style={{ display: 'flex' }}>
            <GroupFilterForm filters={filters} onFilterChange={handleFilterChange} onSubmit={handleSubmit} />
            <GroupResults isSearching={isSearching} groups={searchedGroups} />
        </div>
    );
};

export default GroupSearch;