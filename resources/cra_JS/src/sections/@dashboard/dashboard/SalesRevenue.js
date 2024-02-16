import PropTypes from 'prop-types';
import { useState } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// @mui
import { Card,MenuItem, CardHeader,TextField, Box } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
// components
import { CustomSmallSelect } from '../../../components/custom-input';
import Chart, { useChart } from '../../../components/chart';
import { currencyFormatter } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

SalesRevenue.propTypes = {
  chart: PropTypes.object,
  title: PropTypes.string,
  subheader: PropTypes.string,
  filterDate: PropTypes.any,
  onFilterDate: PropTypes.func,
};

export default function SalesRevenue({ title, subheader, filterDate, onFilterDate, chart, ...other }) {
  const { colors, categories, series, options } = chart;

  const INPUT_WIDTH = 160;

  const chartOptions = useChart({
    colors,
    xaxis: {
      categories,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 15,
        borderRadius: 2,
        dataLabels: {
          position: 'top',
          formatter: (val) => {
            return val === 0 ? 0 : currencyFormatter(val);
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => currencyFormatter(value),
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader
        action={
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Năm"
            views={['year']}
            ampm={false}
            inputFormat="yyyy"
            value={filterDate}
            onChange={(newValue) => {
              onFilterDate(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                sx={{
                  maxWidth: { md: INPUT_WIDTH },
                }}
              />
            )}
          />
        </LocalizationProvider>
        }
      />

      {series.map((item) => (
        <Box key={item.year} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.year === filterDate && <Chart type="line" series={item.data} options={chartOptions} height={364} />}
        </Box>
      ))}
    </Card>
  );
}
