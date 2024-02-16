import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import Iconify from '../../components/iconify';

const VerifyRenderer = (props) => {
  return (
    <Button
      variant="outlined"
      color={props.value.toLowerCase() === 'yes' ? 'success' : 'error'}
      sx={{ textTransform: 'capitalize', border: '0' }}
    >
      {props.value.toLowerCase() === 'yes' ? (
        <Iconify icon="eva:checkmark-circle-2-fill" />
      ) : (
        <Iconify icon="eva:close-circle-fill" />
      )}
    </Button>
  );
};

export default VerifyRenderer;
