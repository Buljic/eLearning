import React from 'react';
import { Box, Button } from '@mui/material';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
        pages.push(i);
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'start', mt: 2 }}>
            {pages.map((page) => (
                <Button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={page === currentPage}
                    variant={page === currentPage ? 'contained' : 'outlined'}
                    sx={{ margin: '0 2px' }}
                >
                    {page + 1}
                </Button>
            ))}
        </Box>
    );
};

export default Pagination;