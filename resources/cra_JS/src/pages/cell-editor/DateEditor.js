import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';

const DateEditor = forwardRef((props, ref) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (newValue) => {
    setSelectedDate(moment(newValue).format('YYYY-MM-DD'));
  };

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        let dateString = null;
        if (selectedDate) {
          dateString = moment(selectedDate).format('DD-MM-YYYY');
        }
        console.log('date string', dateString)
        return dateString;
      },
      isCancelAfterEnd: () => {
        return !selectedDate;
      },
      afterGuiAttached: () => {
        if (!props.value) {
          return;
        }
        setSelectedDate(selectedDate);
      },
    };
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        style={{ width: '100%', margin: 0, padding: '6px 10px' }}
        margin="normal"
        id="date-picker-dialog"
        format="YYYY-MM-DD"
        value={selectedDate}
        onChange={handleDateChange}
        variant="inline"
        disableToolbar
        renderInput={(params) => <TextField {...params} size="small" fullWidth />}
      />
    </LocalizationProvider>
  );
});

export default DateEditor;
