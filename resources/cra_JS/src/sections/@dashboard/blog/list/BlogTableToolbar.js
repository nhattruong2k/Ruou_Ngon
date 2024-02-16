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
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

const INPUT_WIDTH = 160;
BlogTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.any,
  onFilterService: PropTypes.func,
  optionsService: PropTypes.any,
};

export default function BlogTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  onResetFilter,
  internalOrgs,
  onFilterInternal
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
    setSelectInternal([]);
  }

  const [selectInternal, setSelectInternal] = useState([]);

  const handleClose = () => {
    onFilterInternal(selectInternal.map((value) => value.id));
  };

  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{ pb: 3 }}
    >
      <FormControl
        sx={{
          width: { xs: 1, md: 240 },
        }}
      >
        <InputLabel size="small" sx={{ '&.Mui-focused': { color: 'text.primary' } }}>Kho</InputLabel>
        <Select
          size="small"
          multiple
          value={selectInternal}
          onChange={(event) => {
            setSelectInternal(event.target.value);
          }}
          onClose={handleClose}
          input={<OutlinedInput label="Kho" />}
          renderValue={(selected) => {
            return selected.map((value) => value.name).join(', ')
          }}
        >
          {internalOrgs.map((option) => (
            <MenuItem
              key={option.id}
              value={option}
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
              <Checkbox disableRipple size="small" checked={selectInternal.includes(option)} />
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm bài đăng..."
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
