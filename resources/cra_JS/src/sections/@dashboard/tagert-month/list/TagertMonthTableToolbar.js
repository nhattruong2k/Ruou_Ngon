import PropTypes from 'prop-types';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import {
  Stack,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

const monthOptions = [
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 },
  { value: 7, label: 7 },
  { value: 8, label: 8 },
  { value: 9, label: 9 },
  { value: 10, label: 10 },
  { value: 11, label: 11 },
  { value: 12, label: 12 },
]

const INPUT_WIDTH = 160;

TagertMonthTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.string,
  filterDate: PropTypes.any,
  onFilterDate: PropTypes.func,
  onFilterService: PropTypes.func,
  optionsService: PropTypes.arrayOf(PropTypes.object),
};

export default function TagertMonthTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  onResetFilter,
  filterDate,
  onFilterDate,
  isLoading,
  filterMonth,
  onFilterMonth
}) {
  const isTablet = useResponsive('down', 'md');

  const [selectMonth, setSelectMonth] = useState([]);

  const clearForm = () => {
    onResetFilter();
    setSelectMonth([]);
  };
  const handleClose = () => {
    onFilterMonth(selectMonth);
  };

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
      <FormControl
        sx={{
          width: { xs: 1, md: 240 },
        }}
      >
        <InputLabel size="small" sx={{ '&.Mui-focused': { color: 'text.primary' } }}>Tháng</InputLabel>
        <Select
          size="small"
          multiple
          value={selectMonth}
          onChange={(event) => {
            setSelectMonth(event.target.value);
          }}
          onClose={handleClose}
          input={<OutlinedInput label="Tháng" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
        >
          {monthOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                p: 0,
                mx: 1,
                my: 0.5,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
                '&:first-of-type': { mt: 0 },
                '&:last-of-type': { mb: 0 },
              }}
            >
              <Checkbox disableRipple size="small" checked={selectMonth.includes(option.value)} />
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Năm"
          views={['year']}
          ampm={false}
          inputFormat="yyyy"
          value={filterDate}
          onChange={(newValue) => {
            onFilterDate(newValue);
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

      {/* <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      /> */}

      {isFiltered && (
        <Button
          disabled={isLoading}
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
