import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { getSessionUser } from '../utils/sessionUser.js';
import config from '../config.js';

const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const myUser = useMemo(() => getSessionUser(), []);

    const handleLogout = async () => {
        try {
            await fetch(`${config.BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch { /* silent */ }
        sessionStorage.removeItem('myUser');
        navigate('/login');
    };

    const navItems = myUser
        ? [
            { label: 'Pocetna', to: '/welcome', icon: <HomeIcon /> },
            { label: 'Predmeti', to: '/searchSubjects', icon: <SchoolIcon /> },
            { label: 'Kursevi', to: '/attendedCourses', icon: <SchoolIcon /> },
            { label: 'Grupe', to: '/groupSearch', icon: <GroupsIcon /> },
            { label: 'Korisnici', to: '/userSearch', icon: <SearchIcon /> },
        ]
        : [];

    const drawer = (
        <Box sx={{ width: 260 }} onClick={() => setDrawerOpen(false)}>
            <Box sx={{ p: 2, background: 'linear-gradient(100deg, #0f3d9a 0%, #0d5bcb 44%, #17a0b5 100%)', color: '#fff' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
                    Centar Za Tutoring
                </Typography>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.to} disablePadding>
                        <ListItemButton component={Link} to={item.to}>
                            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {myUser && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon /></ListItemIcon>
                                <ListItemText primary="Odjava" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    background: 'linear-gradient(100deg, #0f3d9a 0%, #0d5bcb 44%, #17a0b5 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 4px 24px rgba(10,40,95,0.18)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {isMobile && (
                        <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography
                        variant="h6"
                        component={Link}
                        to={myUser ? '/welcome' : '/'}
                        sx={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        CENTAR ZA TUTORING
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 4 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.to}
                                    component={Link}
                                    to={item.to}
                                    color="inherit"
                                    startIcon={item.icon}
                                    sx={{ fontSize: '0.85rem', opacity: 0.92, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                        {myUser ? (
                            <>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                                    {myUser.username?.charAt(0)?.toUpperCase() || <PersonIcon />}
                                </Avatar>
                                {!isMobile && (
                                    <Typography variant="body2" sx={{ opacity: 0.9, mr: 1 }}>
                                        {myUser.username}
                                    </Typography>
                                )}
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={<LogoutIcon />}
                                    onClick={handleLogout}
                                    sx={{ opacity: 0.85, '&:hover': { opacity: 1 } }}
                                >
                                    {!isMobile && 'Odjava'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/login"
                                    color="inherit"
                                    startIcon={<LoginIcon />}
                                    sx={{ opacity: 0.92, '&:hover': { opacity: 1 } }}
                                >
                                    Prijava
                                </Button>
                                <Button
                                    component={Link}
                                    to="/createAccount"
                                    variant="outlined"
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                                    }}
                                >
                                    Registracija
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                {drawer}
            </Drawer>

            {/* Spacer to push content below fixed AppBar */}
            <Toolbar />
        </>
    );
};

export default Header;
