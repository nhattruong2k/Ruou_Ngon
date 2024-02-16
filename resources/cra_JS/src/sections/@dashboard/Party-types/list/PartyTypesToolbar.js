import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, Button } from '@mui/material';

// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

PartyTypesToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
};
export default function PartyTypesToolbar({ isFiltered, filterName, onFilterName, onResetFilter }) {
  const [inputValue, setInputValue] = useState(filterName);
  const [timer, setTimer] = useState(null);
  const inputChanged = (e) => {
    setInputValue(e.target.value);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onFilterName(e);
    }, 500);
    setTimer(newTimer);
  };
  const clearForm = () => {
    setInputValue('');
    onResetFilter();
  };

  useEffect(() => {
    setInputValue(filterName);
  }, [filterName]);

  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        size="small"
        fullWidth
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm loại khách hàng"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
      {isFiltered && (
        <Button
          color="error"
          sx={{
            flexShrink: 0,
          }}
          onClick={clearForm}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Làm mới
        </Button>
      )}
    </Stack>
  );
}
