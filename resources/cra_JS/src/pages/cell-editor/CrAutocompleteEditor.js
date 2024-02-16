import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TextField, Autocomplete } from '@mui/material';

const CrAutocompleteEditor = forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState('');
  const [colId, setColId] = useState(props?.column?.colId);
  const [inputValue, setInputValue] = useState('');
  const onChangeHandler = (e, value) => {
    // xét customNameCol trong cellEditorParams khi khai báo cột cho table
    // sử dụng để có thể gán được tên cột muốn lấy giá trị
    const col = props?.customNameCol || colId;
    setInputValue(value[col]);
    setValue(value[col]);

    // xét setIdSelected trong cellEditorParams khi khai báo cột cho table
    // sử dụng để gán giá trị id của đối tượng được chọn
    const setIdSelected = props?.setIdSelected || '';
    if (setIdSelected) {
      props.data[setIdSelected] = value.id;
    }
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
      loading={isLoading}
      options={props.options}
      value={value}
      onChange={onChangeHandler}
      inputValue={inputValue}
      isOptionEqualToValue={(option, value) => option.name === value}
      disableClearable
      onInputChange={onInputChangeHandler}
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      renderOption={(props, option) => {
        let optionValue = option[colId];

        switch (colId) {
          case 'frame_number':
            optionValue = `${option[colId]} - ${option.vehicle.name} - ${option.vehicle.code}`;
            break;
          case 'code':
            optionValue = `${option.code} - ${option.name}`;
            break;
          default:
            optionValue = `${option.name}`;
            break;
        }

        if (colId === 'code') {
          optionValue = `${option.code} - ${option.name}`;
        }

        return (
          <li {...props} key={option.id}>
            {optionValue}
          </li>
        );
      }}
      getOptionLabel={(option) => option.value || ''}
      renderInput={(params) => <TextField {...params} sx={{ mb: 3, border: 'none' }} fullWidth size="small" />}
    />
  );
});

export default CrAutocompleteEditor;
