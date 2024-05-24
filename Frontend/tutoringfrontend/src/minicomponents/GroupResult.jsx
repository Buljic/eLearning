import React from 'react';
import { Link } from 'react-router-dom';

const GroupResults = ({ isSearching, groups }) => {
    return (
        <div style={{ flex: 2 }}>
            <h1>Rezultati Pretrage</h1>
            {isSearching ? (
                <ul>
                    {groups.map((group, index) => (
                        <li key={index}>
                            <h3><Link to={`/groupDetails/${group.group_id}`}>{group.group_name}</Link></h3>
                            <p>Opis: {group.description}</p>
                            <p>Datum početka: {group.start_date}</p>
                            <p>Datum završetka: {group.end_date}</p>
                            <p>Sati po sedmici: {group.hours_per_week}</p>
                            <p>Cijena: {group.price} BAM</p>
                            <p>Maksimalan broj studenata: {group.max_students}</p>
                            <p>Topic: {group.topic}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nema rezultata pretrage.</p>
            )}
        </div>
    );
};

export default GroupResults;
