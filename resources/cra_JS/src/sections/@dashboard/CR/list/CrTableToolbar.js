import PropTypes from 'prop-types';
import { Stack, InputAdornment, Checkbox, Autocomplete, TextField, MenuItem, Button } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { DatePicker } from '@mui/x-date-pickers';
// components
import Iconify from '../../../../components/iconify';
import { RHFAutocomplete } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

const INPUT_WIDTH = 170;

CrTableToolbar.propTypes = {
  isFiltered: PropTypes.bool,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onResetFilter: PropTypes.func,
  filterInternalOrg: PropTypes.string,
  onFilterEndDate: PropTypes.func,
  onFilterStartDate: PropTypes.func,
  onFilterInternalOrg: PropTypes.func,
  filterEndDate: PropTypes.any,
  filterStartDate: PropTypes.any,
  optionsInternalOrgs: PropTypes.any,
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const times = [
  {
    id: 1,
    value: 1,
    name: 'Lần 1',
  },
  {
    id: 2,
    value: 2,
    name: 'Lần 2',
  },
  {
    id: 3,
    value: 3,
    name: 'Lần 3',
  },
  {
    id: 3,
    value: 3,
    name: 'Lần 3',
  },
  {
    id: 4,
    value: 4,
    name: 'Lần 4',
  },
  {
    id: 5,
    value: 5,
    name: 'Lần 5',
  },
  {
    id: 6,
    value: 6,
    name: 'Lần 6',
  },
];

export default function CrTableToolbar({
  isFiltered,
  filterName,
  onFilterName,
  filterEndDate,
  filterInternalOrg,
  onResetFilter,
  optionsInternalOrgs,
  onFilterInternalOrg,
  filterStatus,
  filterStartDate,
  onFilterEndDate,
  onFilterStartDate,
}) {
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
        select
        size="small"
        label="Cửa hàng"
        value={filterInternalOrg}
        onChange={onFilterInternalOrg}
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
          key={'all'}
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
          {'All'}
        </MenuItem>
        {optionsInternalOrgs.map((option) => (
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
            {option?.name || ''}
          </MenuItem>
        ))}
      </TextField>
      {(filterStatus === 'checking_daily' || filterStatus === 'maintenance') && (
        <></>
        // <Autocomplete
        //   name="time"
        //   multiple
        //   sx={{
        //     width: 450,
        //   }}
        //   options={times}
        //   size="small"
        //   limitTags={1}
        //   getOptionLabel={(option) => option.name || ''}
        //   renderInput={(params) => <TextField {...params} label="Số lần" />}
        // />
      )}

      <DatePicker
        label="Start date"
        value={filterStartDate}
        onChange={onFilterStartDate}
        renderInput={(params) => (
          <TextField
            size="small"
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />

      <DatePicker
        label="End date"
        value={filterEndDate}
        onChange={onFilterEndDate}
        renderInput={(params) => (
          <TextField
            size="small"
            {...params}
            fullWidth
            sx={{
              maxWidth: { md: INPUT_WIDTH },
            }}
          />
        )}
      />

      <TextField
        fullWidth
        value={filterName}
        onChange={onFilterName}
        size="small"
        placeholder="Search..."
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
          Clear
        </Button>
      )}
    </Stack>
  );
}
