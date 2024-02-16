import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, Button, MenuItem } from '@mui/material';

// components
import Iconify from '../../../../components/iconify';
import useResponsive from '../../../../hooks/useResponsive';

// ----------------------------------------------------------------------
const INPUT_WIDTH = 200;


export default function Toolbar({
  isFiltered,
  filterName,
  onFilterName,
  onResetFilter,
  optionsService,
  filterStatus,
  onFilterStatus
}) {
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
  const clearForm = () => {
    setInputValue('');
    onResetFilter();
  };

  useEffect(() => {
    setInputValue(filterName);
  }, [filterName]);

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
        label="Trang"
        multiple
        value={filterStatus}
        onChange={onFilterStatus}
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
          key="all"
          value="all"
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body2',
            textTransform: 'capitalize',
            '&:first-of-type': {
              mt: 0,
            },
            '&:last-of-type': {
              mb: 0,
            },
          }}
        >
          Tất cả
        </MenuItem>
        {optionsService.map((option) => (
          <MenuItem
            key={option.id}
            value={option.id.toString()}
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
            {option.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        fullWidth
        value={inputValue}
        onChange={inputChanged}
        placeholder="Tìm kiếm tên tài khoản, vai trò..."
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
