import { useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
// components
import moment from 'moment';
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
// ----------------------------------------------------------------------
const INPUT_WIDTH = 200;

ProductTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterWarehouse: PropTypes.string,
  onFilterEndDate: PropTypes.func,
  onFilterWarehouse: PropTypes.func,
  onFilterStartDate: PropTypes.func,
  filterEndDate: PropTypes.any,
  filterStartDate: PropTypes.any,
  optionsWarehouse: PropTypes.arrayOf(PropTypes.object),
  internalOrgs: PropTypes.array,
};

export default function ProductTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterCategory,
  onFilterCategory,
  filterWarehouse,
  onResetFilter,
  optionsWarehouse,
  onFilterWarehouse,
  filterEndDate,
  filterStartDate,
  onFilterStartDate,
  onFilterEndDate,
}) {

  const [inputValue, setInputValue] = useState(filterName);
  const [timer, setTimer] = useState(null);
  const inputChanged = (e) => {
    setInputValue(e.target.value);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onFilterName(e);
    }, 800);
    setTimer(newTimer);
  };

  const [inputCategoryValue, setInputCategoryValue] = useState(filterCategory);

  const inputCategoryChanged = (e) => {
    setInputCategoryValue(e.target.value);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onFilterCategory(e);
    }, 800);
    setTimer(newTimer);
  };

  const clearForm = () => {
    setInputValue('');
    setInputCategoryValue('');
    onResetFilter();
  };

  const shouldDisableDate = (date) => {
    if (filterStartDate && filterEndDate) {
      return date > filterEndDate;
    }
    return false;
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
      <TextField
        fullWidth
        select
        size="small"
        label="Kho hàng"
        multiple
        value={[filterWarehouse]}
        onChange={onFilterWarehouse}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 220 },
            },
          },
        }}
        sx={{
          maxWidth: { md: INPUT_WIDTH },
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          key="all"
          value="all"
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body2',
            textTransform: 'capitalize',
            '&:first-of-type': {
              mt: 0,
            },
            '&:last-of-type': {
              mb: 0,
            },
          }}
        >
          Tất cả
        </MenuItem>
        {optionsWarehouse.map((option) => (
          <MenuItem
            key={option.id}
            value={option.id.toString()}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize',
              '&:first-of-type': { mt: 0 },
              '&:last-of-type': { mb: 0 },
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </TextField>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Từ ngày"
          ampm={false}
          shouldDisableDate={shouldDisableDate}
          maxDate={moment().format('YYYY-MM-DD')}
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
          maxDate={moment().format('YYYY-MM-DD')}
          ampm={false}
          value={filterEndDate}
          onChange={(newValue) => {
            onFilterEndDate(newValue);
            if (newValue < filterStartDate) {
              onFilterStartDate(newValue);
            }
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
        placeholder="Tìm tên, mã sản phẩm..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        size="small"
        value={inputCategoryValue}
        onChange={inputCategoryChanged}
        placeholder="Tìm loại, nhóm sản phẩm..."
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
