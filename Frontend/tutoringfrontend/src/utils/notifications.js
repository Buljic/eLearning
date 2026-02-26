export const notify = (message, severity = 'info') => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent('app-notify', {
            detail: {
                message,
                severity,
            },
        }),
    );
};
