import PropTypes from 'prop-types';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sentenceCase } from 'change-case';
import {
  Stack,
  InputAdornment,
  TextField,
  Button,
  Select,
  MenuItem,
  Checkbox,
  OutlinedInput,
  FormControl,
  InputLabel
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
import { RHFAutocomplete } from '../../../../components/hook-form';
// ----------------------------------------------------------------------
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const INPUT_WIDTH = 160;
RenvenueTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  onResetFilter: PropTypes.func,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  filterStartDate: PropTypes.any,
  onFilterStartDate: PropTypes.func,
  filterEndDate: PropTypes.any,
  onFilterEndDate: PropTypes.func,
};
export default function RenvenueTableToolbar({
  filterName,
  onFilterName,
  isFiltered,
  onResetFilter,
  filterStartDate,
  onFilterStartDate,
  filterEndDate,
  onFilterEndDate,
  statusOptions = [],
  setSelectedPaties
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const [loading, setLoading] = useState(true);

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
    setSelectedOptions([]);
    setSelectedPaties([]);
  }

  const handleSelectBlur = () => {
    setSelectedPaties(selectedOptions.map(value => value.id));
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
        <FormControl
          sx={{
            width: { xs: 1, md: 300 },
          }}
        >
          <InputLabel size='small' sx={{ '&.Mui-focused': { color: 'text.primary' } }}>Nhân viên</InputLabel>
          <Select
            size='small'
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: '400px',
                },
              },
            }}
            multiple
            value={selectedOptions}
            onChange={(event, newValue) => {
              setSelectedOptions(event.target.value);
            }}
            onClose={handleSelectBlur}
            input={<OutlinedInput label="Nhân viên" />}
            renderValue={(selected) => selected.map((value) => value.name).join(', ')}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.id.toString()}
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
                <Checkbox disableRipple size="small" checked={selectedOptions.includes(option)} />
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
  )
}