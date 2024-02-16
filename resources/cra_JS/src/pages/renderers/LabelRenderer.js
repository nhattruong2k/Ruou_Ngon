import React, { useState, useEffect } from 'react';
import Label from '../../components/label';

const LabeRenderer = (props) => {
  const [status, setStatus] = useState('Active');
  return (
    <Label
      variant="soft"
      color={
        (props?.value || status).toLowerCase() === 'active' || (props?.value || status).toLowerCase() === 'approved'
          ? 'info'
          : props.value.toLowerCase() === 'probation'
          ? 'warning'
          : 'error'
      }
      sx={{ textTransform: 'capitalize' }}
    >
      {props.value}
    </Label>
  );
};

export default LabeRenderer;
