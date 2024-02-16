import PropTypes from 'prop-types';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Stack,
  InputAdornment,
  Autocomplete,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

const INPUT_WIDTH = 160;

WorkDailyTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.string,
  filterEndDate: PropTypes.any,
  onFilterEndDate: PropTypes.func,
  filterStartDate: PropTypes.any,
  onFilterStartDate: PropTypes.func,
  onFilterService: PropTypes.func,
  optionsService: PropTypes.arrayOf(PropTypes.object),
};

export default function WorkDailyTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterService,
  onResetFilter,
  optionsService,
  onFilterService,
  onFilterEndDate,
  filterEndDate,
  filterStartDate,
  onFilterStartDate,
  handleChange,
  checked,
}) {
  const [inputValue, setInputValue] = useState(filterName);
  const [timer, setTimer] = useState(null);
  const inputChanged = e => {
    setInputValue(e.target.value);
    clearTimeout(timer)
    const newTimer = setTimeout(() => {
      onFilterName(e);
    }, 500)
    setTimer(newTimer)
  }
  const clearForm = () => {
    setInputValue('');
    onResetFilter();
  }
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Từ ngày"
          ampm={false}
          value={filterStartDate}
          onChange={(newValue) => {
            onFilterStartDate(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              sx={{
                maxWidth: { md: INPUT_WIDTH },
              }}
            />
          )}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Đến ngày"
          ampm={false}
          value={filterEndDate}
          onChange={(newValue) => {
            onFilterEndDate(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              sx={{
                maxWidth: { md: INPUT_WIDTH },
              }}
            />
          )}
        />
      </LocalizationProvider>
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm nhân viên..."
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
          sx={{ flexShrink: 0 }}
          onClick={clearForm}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Làm mới
        </Button>
      )}

    </Stack>
  );
}
