import PropTypes from 'prop-types';
// @mui
import { Checkbox, Typography, Stack } from '@mui/material';

// ----------------------------------------------------------------------

TableSelectedAction.propTypes = {
  sx: PropTypes.object,
  dense: PropTypes.bool,
  action: PropTypes.node,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
};

export default function TableSelectedAction({
  dense,
  action,
  rowCount,
  numSelected,
  onSelectAllRows,
  onRowSelected,
  sx,
  ...other
}) {
  if (!numSelected) {
    return null;
  }

  const onChangeCheckboxSelectAll = () => {
    onSelectAllRows();
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 1,
        pr: 2,
        top: 0,
        left: 0,
        width: 1,
        zIndex: 9,
        height: 58,
        position: 'absolute',
        bgcolor: 'primary.lighter',
        ...(dense && {
          height: 38,
        }),
        ...sx,
      }}
      {...other}
    >
      <Checkbox
        indeterminate={numSelected > 0 && numSelected < rowCount}
        checked={rowCount > 0 && numSelected === rowCount}
        onChange={onChangeCheckboxSelectAll}
      />

      <Typography
        variant="subtitle1"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: 'primary.main',
          ...(dense && {
            ml: 3,
          }),
        }}
      >
        Đã chọn {numSelected}
      </Typography>

      {action && action}
    </Stack>
  );
}
