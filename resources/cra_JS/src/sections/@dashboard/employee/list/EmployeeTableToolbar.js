import PropTypes from 'prop-types';
import { useState } from 'react';
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

EmployeeTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.string,
  onFilterEndDate: PropTypes.func,
  onFilterService: PropTypes.func,
  optionsService: PropTypes.arrayOf(PropTypes.object),
};

export default function EmployeeTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterService,
  onResetFilter,
  optionsService,
  onFilterService,
  handleChange,
  checked,
}) {
  const isTablet = useResponsive('down', 'md');
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
      <TextField
        fullWidth
        select
        size="small"
        label="Trạng thái"
        multiple
        value={filterService}
        onChange={onFilterService}
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
        {optionsService.map((option) => (
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
