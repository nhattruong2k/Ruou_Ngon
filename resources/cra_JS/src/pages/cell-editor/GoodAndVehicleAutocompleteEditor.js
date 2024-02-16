import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const GoodAndVehicleAutocompleteEditor = forwardRef((props, ref) => {
  const [open, setOpen] = React.useState(false);
  const [colId, setColId] = useState(props?.column?.colId);
  const [value, setValue] = useState('');

  const onChangeHandler = (e, value) => {
    setValue(value[colId]);
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

  const optionValueRender = (option) => {
    let optionValue = option[colId];

    if (colId === 'frame_number') {
      optionValue = `${option[colId]} - ${option.vehicle.name} - ${option.vehicle.code}`;
    }

    if (colId === 'code') {
      optionValue = `${option.code} - ${option.name}`;
    }
    return optionValue;
  };

  return (
    <Autocomplete
      onChange={onChangeHandler}
      getOptionLabel={(option) => optionValueRender(option)}
      options={props.options}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderOption={(props, option) => {
        const optionValue = optionValueRender(option);
        return (
          <li {...props} key={option.id}>
            {optionValue}
          </li>
        );
      }}
      renderInput={(params) => <TextField {...params} sx={{ mb: 3, border: 'none' }} fullWidth size="small" />}
    />
  );
});
export default GoodAndVehicleAutocompleteEditor;