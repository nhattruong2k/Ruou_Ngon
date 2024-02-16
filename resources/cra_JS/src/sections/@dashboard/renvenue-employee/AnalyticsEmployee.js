import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
// components
import { CustomSmallSelect } from '../../../components/custom-input';
import Chart, { useChart } from '../../../components/chart';
import { fShortenNumber, currencyFormatter } from '../../../utils/formatNumber';
// ----------------------------------------------------------------------

AnalyticsEmployee.propTypes = {
  chart: PropTypes.object,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function AnalyticsEmployee({ title, subheader, chart, ...other }) {
  const { categories, colors, series, options } = chart;

  const [seriesData, setSeriesData] = useState('Week');

  const chartOptions = useChart({
    colors,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
      labels: {
        formatter: (value) => {
          return fShortenNumber(value);
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 15,
        borderRadius: 2,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 70,
      style: {
        fontSize: '12px',
        colors: ['#111']
      },
      formatter: (val) => {
        return fShortenNumber(val);
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
    <Card {...other} sx={{ boxShadow: 'none' }}>
      {series.map((item) => (
        <Box key={item.type} sx={{ mt: 3, mx: 3 }} dir="ltr">
          {item.type === seriesData && <Chart type="bar" series={item.data} options={chartOptions} height={700} />}
        </Box>
      ))}
    </Card>
  );
}
