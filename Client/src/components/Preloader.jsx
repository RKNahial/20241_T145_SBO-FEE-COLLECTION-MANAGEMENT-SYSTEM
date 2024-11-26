// src/components/Preloader.jsx
import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const Preloader = ({ open }) => {
    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            }}
            open={open}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
};

export default Preloader;