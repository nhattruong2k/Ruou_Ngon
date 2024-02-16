import React from 'react';
import {Stack, Button} from '@mui/material';

export default function ButtonRenderer(props) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" >
      <Button>Download</Button>
    </Stack>
  );
}