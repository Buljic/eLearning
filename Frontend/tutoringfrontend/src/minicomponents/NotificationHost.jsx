import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotificationHost = () => {
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        const handleNotify = (event) => {
            const detail = event.detail || {};
            setNotification({
                open: true,
                message: detail.message || 'Operacija zavrsena.',
                severity: detail.severity || 'info',
            });
        };

        window.addEventListener('app-notify', handleNotify);
        return () => {
            window.removeEventListener('app-notify', handleNotify);
        };
    }, []);

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={3500}
            onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                severity={notification.severity}
                onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
                sx={{ width: '100%' }}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationHost;
