import { Box, Pagination as MuiPagination } from '@mui/material';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <MuiPagination
                count={totalPages}
                page={currentPage + 1}
                color="primary"
                onChange={(_, value) => onPageChange(value - 1)}
            />
        </Box>
    );
};

export default Pagination;
