import { useState, useEffect } from 'react';

import { Helmet } from 'react-helmet-async';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Stack, Button, Typography, CardHeader } from '@mui/material';

import moment from 'moment';
//
import { useDispatch, useSelector } from '../../redux/store';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// _mock_
import {
  _appFeatured,
  _appAuthors,
  _appInstalled,
  _appRelated,
  _appInvoices,
} from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
// sections
import {
  AppWidget,
  AppWelcome,
  AppFeatured,
  AppNewInvoice,
  AppTopAuthors,
  AppTopRelated,
  AppAreaInstalled,
  AppWidgetSummary,
  AppCurrentDownload,
  AppTopInstalledCountries,
} from '../../sections/@dashboard/general/app';

import AdminRevenue from '../../sections/@dashboard/dashboard/AdminRevenue';
import SalesRevenue from '../../sections/@dashboard/dashboard/SalesRevenue';
import BlogTopRelated from '../../sections/@dashboard/dashboard/BlogTopRelated';

// assets
import { SeoIllustration } from '../../assets/illustrations';

import { getDashboard, getRenvenueEmployee, getRevenueWarehouse } from '../../redux/slices/dashboard';
import { getInternalOrg } from '../../redux/slices/internalOrg';

import { SkeletonPostItem } from '../../components/skeleton';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const { themeStretch } = useSettingsContext();

  const [postData, setPostData] = useState([]);

  const [selectedOptions, setSelectedOptions] = useState('');

  const [filterInternal, setFilterInternal] = useState('all');

  const [dataWarehouse, setDataWarehouse] = useState(null);

  const [filterDate, setFilterDate] = useState(moment().format('YYYY'));

  const { dashboards, dashboardEmployee, dashboardWarehouse, isLoading } = useSelector((state) => state.dashboard);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoading) {
      setPostData(dashboards);
    }
  }, [isLoading]);

  useEffect(() => {
    console.log(dashboardWarehouse);
    if (!dashboardWarehouse.isLoading && Object.keys(dashboardWarehouse.revenueWarehouse).length > 0) {
      const resultRevenue = [];
      const resultSales = [];

      for (let month = 1; month <= 12; month += 1) {
        const dataMonthRevenue = dashboardWarehouse.revenueWarehouse.resultRevenue.find((item) => item.month === month);
        resultRevenue.push(dataMonthRevenue?.total || 0);

        const dataMonthSales = dashboardWarehouse.revenueWarehouse.resultSales.find((item) => item.month === month);
        resultSales.push(dataMonthSales?.total || 0);
      }

      console.log({ resultRevenue, resultSales });
      setDataWarehouse({ resultRevenue, resultSales });
    }
  }, [dashboardWarehouse]);



  useEffect(() => {
    dispatch(getDashboard());
    dispatch(getInternalOrg({}));
  }, []);

  // useEffect(() => {
  //   const params = {
  //     filter_date: filterDate,
  //   };
  //   dispatch(getRenvenueEmployee(params));
  // }, [dispatch, filterDate]);

  useEffect(() => {
    const params = {
      filter_date: filterDate,
      filter_warehouse: filterInternal,
    };
    dispatch(getRevenueWarehouse(params));
  }, [dispatch, filterDate, filterInternal]);

  return (
    <>
      <Helmet>
        <title> Dashboard | Rượu ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <BlogTopRelated title="Tin tức nội bộ" list={postData} isLoading={isLoading} />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AdminRevenue
              title="Doanh thu"
              internalOrgs={internalOrgs}
              onFilterInternal={(newValue) => {
                setFilterInternal(newValue?.target?.value || 'all');
              }}
              filterWarehouse={filterInternal}
              filterDate={filterDate}
              onFilterDate={(newValue) => {
                setFilterDate(newValue);
              }}
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                series: [
                  {
                    year: filterDate,

                    data: [
                      { name: 'Doanh số', data: dataWarehouse?.resultSales || [] },
                      { name: 'Doanh thu', data: dataWarehouse?.resultRevenue || [] },
                    ],
                  },
                ],
              }}
            />

            {/* <SalesRevenue
              filterDate={filterDate}
              onFilterDate={(newValue) => {
                setFilterDate(newValue);
              }}
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                series: [
                  {
                    year: filterDate,
                    data: [
                      { name: 'Doanh số', data: renvenueEmployee.flatMap((i) => i.total_order_by_employee_sales) },
                      { name: 'Doanh thu', data: renvenueEmployee.flatMap((i) => i.total_payment_by_employee_sales) },
                    ],
                  },
                ],
              }}
            /> */}

          </Grid>
        </Grid>
      </Container>
    </>
  );
}
