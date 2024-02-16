import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TextField, Autocomplete } from '@mui/material';

const AutocompleteGridEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState(''); 
  const onChangeHandler = (e, value) => {
    setValue(value.name);
    setInputValue(value.name);
  };

  const onInputChangeHandler = (e, inputValue) => {
    // setInputValue(inputValue);
  };

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return value;
      },
      afterGuiAttached: () => {
        setValue(props.value);
      },
    };
  });

  return (
    <Autocomplete
      options={props.options}
      value={value}
      onChange={onChangeHandler}
      inputValue={inputValue}
      isOptionEqualToValue={(option, value) => option.name === value}
      disableClearable
      onInputChange={onInputChangeHandler}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        );
      }}
      getOptionLabel={(option) => option.value || ''}
      renderInput={(params) => <TextField {...params} sx={{ mb: 3, border: 'none' }} fullWidth size="small" />}
    />
  );
});

export default AutocompleteGridEditor;
