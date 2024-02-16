import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextField } from '@mui/material';
import { currencyFormatter } from '../../utils/formatNumber';
// ----------------------------------------------------------------------

RHFTextField.propTypes = {
  name: PropTypes.string,
};

export default function RHFTextField({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState: { error } }) => {
        let value = field.value;
        if (other?.typeinput === 'price') {
          if (field.value !== '') value = currencyFormatter(field.value)
        }
        return (
          <TextField
            {...field}
            fullWidth
            value={typeof field.value === 'number' && field.value === 0 ? '' : value}
            error={!!error}
            helperText={error?.message}
            {...other}
          />
        )
      }}
    />
  );
}
