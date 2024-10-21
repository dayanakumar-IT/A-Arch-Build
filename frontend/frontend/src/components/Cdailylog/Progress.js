// Progress.js
import React from 'react';
import ProgressForm from './ProgressForm';
import { Box, Typography } from '@mui/material';

export default function Progress() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'white',
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      
      <ProgressForm />
    </Box>
  );
}
