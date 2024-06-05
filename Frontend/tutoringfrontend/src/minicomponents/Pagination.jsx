import React from 'react';
import config from '../config.js';
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={page === currentPage}
                    style={{ margin: '0 2px', padding: '5px 10px', backgroundColor: page === currentPage ? 'lightblue' : 'white' }}
                >
                    {page + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
