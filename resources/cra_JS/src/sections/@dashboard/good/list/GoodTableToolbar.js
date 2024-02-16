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

GoodTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterService: PropTypes.any,
  onFilterEndDate: PropTypes.func,
  onFilterService: PropTypes.func,
  onFilterStartDate: PropTypes.func,
  filterEndDate: PropTypes.instanceOf(Date),
  filterStartDate: PropTypes.instanceOf(Date),
  optionsService: PropTypes.any,
};
const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: 'Pulp Fiction', year: 1994 },
];
export default function GoodTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  checked,
  filterEndDate,
  handleChange,
  filterService,
  onResetFilter,
  optionsService,
  filterStartDate,
  onFilterService,
  onFilterEndDate,
  onFilterStartDate,
  onOriginName,
}) {
  const isTablet = useResponsive('down', 'md');
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

  const [inputOrigin, setInputOrigin] = useState(filterName);

  const inputOriginChanged = (e) => {
    setInputOrigin(e.target.value);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onOriginName(e.target.value);
    }, 500);
    setTimer(newTimer);
  };

  const clearForm = () => {
    setInputValue('');
    setInputOrigin('');
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
      <TextField
        fullWidth
        select
        size="small"
        label="Loại sản phẩm"
        multiple
        value={[filterService]}
        onChange={onFilterService}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 250 },
            },
          },
        }}
        sx={{
          maxWidth: { md: 250 },
          textTransform: 'capitalize',
        }}
      >
        <MenuItem
          key={0}
          value={'all'}
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
          {'Tất cả'}
        </MenuItem>
        {optionsService.map((option) => (
          <MenuItem
            key={option.id}
            value={option.id}
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
            {option?.nameCustom || ''}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm sản phẩm theo tên, mã"
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
        value={inputOrigin}
        onChange={inputOriginChanged}
        placeholder="Tìm kiếm theo quốc gia"
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
