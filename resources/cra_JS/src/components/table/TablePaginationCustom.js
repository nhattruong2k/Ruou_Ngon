import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { Box, Switch, TablePagination, FormControlLabel, TextField, Stack } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import useResponsive from '../../hooks/useResponsive';
// ----------------------------------------------------------------------

TablePaginationCustom.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object,
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25, 50],
  sx,
  ...other
}) {
  const isMobile = useResponsive('down', 'sm');
  const [customPage, setCustomPage] = useState(1); // State to track custom page input

  useEffect(() => {
    setCustomPage(other.page + 1);
  }, [other.page]);

  const handleCustomPageChange = (event) => {
    const newPage = parseInt(event.target.value, 10);
    if (newPage > Math.ceil(other.count / other.rowsPerPage)) {
      setCustomPage(Math.ceil(other.count / other.rowsPerPage));
    } else if (Number.isNaN(newPage)) {
      setCustomPage('');
    } else setCustomPage(newPage);

  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleCustomPageGo();
      event.target.blur();
    }
  };

  const handleCustomPageGo = () => {
    if (customPage >= 1 && customPage <= Math.ceil(other.count / other.rowsPerPage)) {
      other.onPageChange(null, customPage - 1);
    }
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          {...other}
          labelRowsPerPage="Số hàng:"
          ActionsComponent={
            isMobile
              ? undefined
              : () => (
                <Pagination
                  count={Math.ceil(other.count / other.rowsPerPage)}
                  page={other.page + 1}
                  onChange={(event, newPage) => other.onPageChange(event, newPage - 1)}
                  showFirstButton
                  showLastButton
                  size="small"
                  className='table-custom-pagination'
                />
              )
          }
        />
        <TextField
          value={customPage}
          onChange={handleCustomPageChange}
          onKeyDown={handleKeyDown} // Handle Enter key down
          size="small"
          variant="outlined"
          inputProps={{ style: { width: '35px', padding: '3px 8px', textAlign: 'right' } }}
          sx={{ mr: 2 }}
          onClick={(event) => event.target.select()}
        />
      </Stack>
      {
        onChangeDense && (
          <FormControlLabel
            label="Dense"
            control={<Switch checked={dense} onChange={onChangeDense} />}
            sx={{
              pl: 2,
              py: 1.5,
              top: 0,
              position: {
                md: 'absolute',
              },
            }}
          />
        )
      }
    </Box >
  );
}
