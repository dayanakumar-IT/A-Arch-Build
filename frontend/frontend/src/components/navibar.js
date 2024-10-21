import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import logo from './assets/logobgremoved.png';

function NavScrollExample() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Add any logout logic here, such as clearing tokens or user data
    navigate('/'); // Navigate to the login page
  };

  return (
    <AppBar position="fixed" sx={{ background: 'linear-gradient(250deg, #4137D0, #211C6A)', marginLeft: '220px', width: 'calc(100% - 220px)' }}>
      <Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
        {/* Logo */}
        <img 
          src={logo}
          alt="Logo" 
          style={{ height: '70px', marginRight: '20px' }}  // Adjust size and spacing
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
          A-Arch Build
        </Typography>

        {/* Profile Icon */}
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={handleProfileMenuOpen}
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <AccountCircle />
        </IconButton>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem> {/* Call handleLogout on click */}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default NavScrollExample;
