import PropTypes from 'prop-types';
import { useState } from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// @mui
import { Card, MenuItem, CardHeader, TextField, Box } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
// components
import { CustomSmallSelect } from '../../../components/custom-input';
import Chart, { useChart } from '../../../components/chart';
import { currencyFormatter } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

AdminRevenue.propTypes = {
  chart: PropTypes.object,
  title: PropTypes.string,
  subheader: PropTypes.string,
  filterDate: PropTypes.any,
  onFilterDate: PropTypes.func,
  internalOrgs: PropTypes.array,
};

export default function AdminRevenue({ title, subheader, filterWarehouse, onFilterInternal, filterDate, onFilterDate, internalOrgs, chart, ...other }) {
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
        className='report-card-head'
        title={title}
        action={
          [
            <CustomSmallSelect
              fullWidth
              select
              size="small"
              multiple
              value={[filterWarehouse]}
              onChange={onFilterInternal}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 220, },
                  },
                },
              }}
              sx={{
                maxWidth: { md: INPUT_WIDTH },
                textTransform: 'capitalize',
                mr: 2
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
                Toàn quốc
              </MenuItem>
              {internalOrgs.map((option) => (
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
            </CustomSmallSelect>
            ,
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
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
                      maxWidth: { md: 110 },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          ]

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
