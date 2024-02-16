import PropTypes from 'prop-types';
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel, IconButton, Stack, Button, Typography, CardActionArea } from '@mui/material';
import Iconify from '../iconify';
import MenuPopover from '../menu-popover';
// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

TableHeadCustomFilter.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
};

export default function TableHeadCustomFilter({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
  theme,
  Cookies,
  onTableActiveRow,
  cookieTableName,
  isFilterColumn = false
}) {

  const [headLabelShow, setHeadLabelShow] = useState([]);

  const [filterType, setFilterType] = useState([]);

  useEffect(() => {
    const headLabelClone = headLabel.map(item => ({ ...item }));
    let headeCookie = isFilterColumn && Cookies ? JSON.parse(Cookies.get(cookieTableName) || '[]') : [];
    if (headeCookie.length === 0) {
      headeCookie = [...headLabelClone];
    }
    onTableActiveRow(headeCookie);
    setHeadLabelShow(headeCookie);
    setFilterType(headeCookie.filter((item) => !(item?.hide || false)));
  }, [Cookies]);


  const refMenuColumn = useRef();

  const handleOpenPopover = (event) => {
    refMenuColumn.current.setOpenPopover(event.currentTarget);
  };

  const handleFilterType = (type) => {
    const updatedFilterType = filterType.find((item) => item.id === type.id)
      ? filterType.filter((value) => value.id !== type.id)
      : [...filterType, type];

    const updatedHeadLabelShow = headLabelShow.map((item) =>
      item.id === type.id ? { ...item, hide: !item.hide } : item
    );

    setFilterType(updatedFilterType);
    setHeadLabelShow(updatedHeadLabelShow);
    onTableActiveRow(updatedHeadLabelShow.map(item => ({ ...item })));

    if (Cookies) {
      Cookies.set(cookieTableName, updatedHeadLabelShow);
    }
  };

  const handleReset = () => {
    if (Cookies) Cookies.remove(cookieTableName);
    const headLabelClone = headLabel.map(item => ({ ...item }));
    setHeadLabelShow(headLabelClone);
    onTableActiveRow(headLabelClone);
    setFilterType(headLabelClone.filter((item) => !(item?.hide || false)));
  };

  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabelShow.filter((item) => !(item?.hide || false)).map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            // sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                // active={orderBy === headCell.id}
                // direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              // sx={{ textTransform: 'capitalize' }}
              >
                {
                  headCell.label &&
                  headCell.label
                }
                {
                  isFilterColumn && !headCell.label &&
                  <>
                    <IconButton color={'default'} onClick={handleOpenPopover}>
                      <Iconify with={15} icon="fluent:text-column-two-right-20-filled" />
                    </IconButton>
                    <MenuPopverColumn
                      ref={refMenuColumn}
                      headLabel={headLabel}
                      filterType={filterType}
                      onFilterType={handleFilterType}
                      onReset={handleReset}
                      theme={theme}
                    />
                  </>
                }

                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const MenuPopverColumn = forwardRef(({ headLabel, optionsType, filterType, onFilterType, onReset, theme }, ref) => {

  headLabel = headLabel.filter((item) => item.id !== '');

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  useImperativeHandle(ref, () => ({
    setOpenPopover,
    handleOpenPopover
  }));

  return (
    <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ p: 2.5 }}>
      <Stack spacing={2.5}>
        <Box display="grid" gridTemplateColumns={{ xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' }} gap={1}>
          {headLabel.map((type) => {
            const isSelected = filterType.find((item) => item.id === type?.id);

            return (
              <CardActionArea
                key={type.id}
                onClick={() => onFilterType(type)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  color: 'text.secondary',
                  border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.12)}`,
                  ...(isSelected && {
                    color: 'white',
                    bgcolor: theme?.palette?.primary?.main || 'text.primary',
                  }),
                }}
              >
                <Stack spacing={0.5} direction="row" alignItems="center">
                  <Typography variant="body2">{type?.label}</Typography>
                </Stack>
              </CardActionArea>
            );
          })}
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <IconButton color={'default'} onClick={onReset}>
            <Iconify with={15} icon="tabler:refresh" />
          </IconButton>
        </Stack>
      </Stack>
    </MenuPopover>
  )
});