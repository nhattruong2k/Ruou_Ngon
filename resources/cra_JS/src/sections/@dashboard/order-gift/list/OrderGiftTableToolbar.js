import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
// ----------------------------------------------------------------------
const INPUT_WIDTH = 200;

OrderGiftTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterCode: PropTypes.string,
  onFilterCode: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.string,
  onFilterEndDate: PropTypes.func,
  onFilterService: PropTypes.func,
  onFilterStartDate: PropTypes.func,
  filterEndDate: PropTypes.any,
  filterStartDate: PropTypes.any,
  optionsService: PropTypes.arrayOf(PropTypes.object),
  internalOrgs: PropTypes.array,
};

export default function OrderGiftTableToolbar({
  isFiltered,
  filterCode,
  onFilterCode,
  filterService,
  onResetFilter,
  optionsService,
  onFilterService,
  filterEndDate,
  filterStartDate,
  onFilterStartDate,
  onFilterEndDate,
}) {
  const [inputValue, setInputValue] = useState(filterCode);
  const [timer, setTimer] = useState(null);
  const inputChanged = (e) => {
    setInputValue(e.target.value);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onFilterCode(e);
    }, 800);
    setTimer(newTimer);
  };
  const clearForm = () => {
    setInputValue('');
    onResetFilter();
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Từ ngày"
          ampm={false}
          value={filterStartDate}
          onChange={(newValue) => {
            onFilterStartDate(newValue);
          }}
          inputProps={{
            readOnly: true,
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
          inputProps={{
            readOnly: true,
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              fullWidth
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
        placeholder="Tìm mã chứng từ..."
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
