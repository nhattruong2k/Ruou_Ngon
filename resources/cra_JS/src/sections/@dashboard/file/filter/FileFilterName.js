import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { TextField, InputAdornment } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';

// ----------------------------------------------------------------------

FileFilterName.propTypes = {
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function FileFilterName({ filterName, onFilterName }) {

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


  useEffect(() => {
    if (filterName === '') {
      setInputValue('');
    }
  }, [filterName]);


  const clearForm = () => {
    setInputValue('');
  }
  return (
    <TextField
      size="small"
      value={inputValue}
      onChange={inputChanged}
      placeholder="Tìm kiếm tệp..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
