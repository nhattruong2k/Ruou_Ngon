import { DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import { useState } from 'react';

const DateEditorCustom = ({ value, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(value || null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  return (
    <TextField
      value={selectedDate}
      onClick={(event) => event.stopPropagation()}
      onFocus={(event) => event.stopPropagation()}
      onChange={() => { }}
      InputProps={{
        inputComponent: DatePicker,
        inputProps: {
          value: selectedDate,
          onChange: handleDateChange,
        },
      }}
    />
  );
};

export default DateEditorCustom;
