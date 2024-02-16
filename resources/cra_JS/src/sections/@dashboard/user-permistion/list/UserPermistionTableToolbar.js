import PropTypes from 'prop-types';
import {
  Stack,
  InputAdornment,
  TextField,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';

// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------

const INPUT_WIDTH = 160;

UserPermistionTableToolbar.propTypes = {
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
  optionsService: PropTypes.arrayOf(PropTypes.string),
};

export default function UserPermistionTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  onResetFilter,
  handleChange,
  checked,
}) {
  const isTablet = useResponsive('down', 'md');
  return (
    <Stack
      spacing={2}
      alignItems="center"
      direction={{
        xs: 'row',
        md: 'row',
      }}
      sx={{ px: 2.5, py: 3 }}
    >
      <TextField
        fullWidth
        size="small"
        value={filterName}
        onChange={onFilterName}
        placeholder="Tìm kiếm user..."
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
          onClick={onResetFilter}
          startIcon={<Iconify icon="eva:trash-2-outline" />}
        >
          Làm mới
        </Button>
      )}
      {!isTablet && (
        <Stack
          direction={{
            xs: 'row',
            md: 'row',
          }}
          justifyContent="end"
          sx={{
            px: 2.5,
            py: 0.5,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={checked}
                onChange={handleChange}
                inputProps={{
                  'aria-label': 'controlled',
                }}
              />
            }
            label="Filter"
          />
        </Stack>
      )}
    </Stack>
  );
}
