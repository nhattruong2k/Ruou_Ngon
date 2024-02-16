import PropTypes from 'prop-types';
import { useState } from 'react';
import { Stack, InputAdornment, TextField, MenuItem, Button, Switch, FormControlLabel } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';
// ----------------------------------------------------------------------

const INPUT_WIDTH = 160;

OrganiztionTableToolbar.propTypes = {
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
  optionsService: PropTypes.arrayOf(PropTypes.object),
};

export default function OrganiztionTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterService,
  onResetFilter,
  optionsService,
  isFilter,
  onFilterService,
  handleChange,
  checked,
  isLoading
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
        size="small"
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm tổ chức..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{
                  color: 'text.disabled',
                }}
              />
            </InputAdornment>
          ),
        }}
      />
      {isFiltered && (
        <Button
          disabled={isLoading}
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
