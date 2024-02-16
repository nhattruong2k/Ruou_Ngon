import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TextField, Autocomplete } from '@mui/material';

const AutocompleteEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props?.value || 1);
  const [inputValue, setInputValue] = useState('');
  const onChangeHandler = (e, value) => {
    setValue(value);
  };

  const onInputChangeHandler = (e, inputValue) => {
    setInputValue(inputValue);
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
      isOptionEqualToValue={(option, value) => option.id === value}
      disableClearable
      onInputChange={onInputChangeHandler}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option}
          </li>
        );
      }}
      getOptionLabel={(option) => typeof option === 'string'
      || option instanceof String ? option : ""}
      renderInput={(params) => <TextField {...params} sx={{ mb: 3, border: 'none' }} fullWidth size="small" />}
    />
  );
});

export default AutocompleteEditor;
