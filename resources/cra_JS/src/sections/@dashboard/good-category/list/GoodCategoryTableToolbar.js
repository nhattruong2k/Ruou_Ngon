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

// ----------------------------------------------------------------------

const INPUT_WIDTH = 160;

GoodCategoryTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.string,
  onFilterEndDate: PropTypes.func,
  onFilterService: PropTypes.func,
  onFilterStartDate: PropTypes.func,
  filterEndDate: PropTypes.instanceOf(Date),
  filterStartDate: PropTypes.instanceOf(Date),
};
export default function GoodCategoryTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterEndDate,
  filterService,
  onResetFilter,
  filterStartDate,
  onFilterService,
  onFilterEndDate,
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
        md: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm loại sản phẩm"
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
