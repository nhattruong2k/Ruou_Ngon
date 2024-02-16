import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import {
  Card,
  Table,
  TableBody,
  Container,
  TableContainer,
  CircularProgress,
  Box,
  Stack,
  Typography,
  Divider,
  TextField,
} from '@mui/material';
// redux
import axios from '../../../../utils/axios';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { useTable, TableHeadCustom } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar';
// components
import { useSettingsContext } from '../../../../components/settings';
// section
import DebtsDetailTableRow from './DebtsDetailTableRow';
import { currencyFormatter } from '../../../../utils/formatNumber';
import DebtsDetailToolbar from './DebtsDetailToolbar';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    label: 'Số chứng từ',
    id: 'employee',
  },
  {
    label: 'Ngày chứng từ',
    id: 'party_code',
  },
  {
    label: 'Tổng số tiền',
    id: 'party_name',
  },
  {
    label: 'Số tiền đã trả',
    id: 'debt_limit',
  },
  {
    label: 'Số tiền còn nợ',
    id: 'amount_owed',
  },
  {
    label: 'Số nợ trong hạn',
    id: 'undue_debt',
  },
  {
    label: 'Số nợ quá hạn',
    id: 'overdue_debt',
  },
  {
    label: 'Số ngày quá hạn',
    id: 'overdue_date',
  },
  {
    label: 'Số nợ khó đòi',
    id: 'doubtful_debt',
  },
];

export default function DebtsListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultRowsPerPage: 10,
  });

  const { themeStretch } = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const [employee, setEmployee] = useState('');

  const [partyCode, setPartyCode] = useState('');

  const [partyName, setPartyName] = useState('');

  const [debtLimit, setDebtLimit] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState([]);

  const [orderPrice, setOrderPrice] = useState(0);

  const [paidPrice, setPaidPrice] = useState(0);

  const [remainPrice, setRemainPrice] = useState(0);

  const [unduePrice, setUnduePrice] = useState(0);

  const [overduePrice, setOverduePrice] = useState(0);

  const [doubtfulPrice, setDoubtfulPrice] = useState(0);

  const { id } = useParams();

  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const body = {
            id,
            filter_start_date: params.get('filter_start_date'),
            filter_end_date: params.get('filter_end_date'),
            filter_warehouse: params.get('filter_warehouse'),
            _method: 'GET',
          };
          const response = await axios.post('report-debts/0', body);
          const dataReponse = response?.data?.data?.dataDebt || [];
          setOrders(dataReponse);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (orders.length) {
      setTableData(orders);
      setEmployee(orders[0]?.employee?.name || '');
      setPartyCode(orders[0]?.party?.code || '');
      setPartyName(orders[0]?.party?.name || '');
      setDebtLimit(orders[0]?.party?.debt_limit ? currencyFormatter(orders[0]?.party?.debt_limit) : 0);
      getValueTotal(orders);
    }
  }, [orders]);

  const getValueTotal = (orders) => {
    let totalOrderPrice = 0;
    let totalPaidPrice = 0;
    let totalRemainPrice = 0;
    let totalUnduePrice = 0;
    let totalOverduePrice = 0;
    let totalDoubtfulPrice = 0;

    orders.forEach((order) => {
      const overdueDebt = order.info_debt?.overdue_debt;
      const undueDebt = order.info_debt?.undue_debt;
      const doubtfulDebt = order.info_debt?.doubtful_debt;

      totalOrderPrice += order.total_price;
      totalPaidPrice += order.total_price - (overdueDebt + undueDebt + doubtfulDebt);
      totalRemainPrice += overdueDebt + undueDebt + doubtfulDebt;
      totalUnduePrice += undueDebt;
      totalOverduePrice += overdueDebt;
      totalDoubtfulPrice += doubtfulDebt;
    });

    setOrderPrice(totalOrderPrice);
    setPaidPrice(totalPaidPrice);
    setRemainPrice(totalRemainPrice);
    setUnduePrice(totalUnduePrice);
    setOverduePrice(totalOverduePrice);
    setDoubtfulPrice(totalDoubtfulPrice);
  };

  return (
    <>
      <Helmet>
        <title>Chi tiết công nợ | Rượu Ngon</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        {isLoading && (
          <Box className={'c-box__loading'}>
            <CircularProgress className={'c-box__loading__icon'} />
          </Box>
        )}
        <DebtsDetailToolbar backLink={PATH_DASHBOARD.debts.list} partyName={partyName} />
        <Card>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
            <div>
              <Typography variant="h6">Thông tin chung</Typography>
            </div>
          </Stack>
          <Box
            rowGap={3}
            sx={{ p: 3, pt: 0 }}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <TextField size="small" value={employee} label="Nhân viên" inputProps={{ readOnly: true }} />
            <TextField size="small" value={partyCode} label="Mã khách hàng" inputProps={{ readOnly: true }} />
            <TextField size="small" value={partyName} label="Tên khách hàng" inputProps={{ readOnly: true }} />
            <TextField size="small" value={debtLimit} label="Hạn mức công nợ" inputProps={{ readOnly: true }} />
          </Box>
          <Divider sx={{ borderStyle: 'dashed' }} variant="dotted" />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
            <div>
              <Typography variant="h6">Thông tin chi tiết</Typography>
            </div>
          </Stack>
          <TableContainer sx={{ position: 'relative', overflow: 'unset', pb: 3 }}>
            <Scrollbar>
              <Table sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                />
                <TableBody>
                  {tableData.map((row) => (
                    <DebtsDetailTableRow key={row.id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <Divider sx={{ borderStyle: 'dashed' }} variant="dotted" />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
            <div>
              <Typography variant="h6">Tổng cộng</Typography>
            </div>
          </Stack>
          <Stack spacing={2} alignItems="flex-start" sx={{ mb: 3, typography: 'body2', px: 3 }}>
            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền hàng</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                {orderPrice ? currencyFormatter(orderPrice.toString()) : '-'}
              </Box>
            </Stack>

            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền đã trả</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                {' '}
                {paidPrice ? currencyFormatter(paidPrice.toString()) : '-'}{' '}
              </Box>
            </Stack>

            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền còn nợ</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                {remainPrice ? currencyFormatter(remainPrice.toString()) : '-'}
              </Box>
            </Stack>

            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền nợ trong hạn</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                {unduePrice ? currencyFormatter(unduePrice.toString()) : '-'}
              </Box>
            </Stack>

            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền nợ quá hạn</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                &nbsp;{overduePrice ? currencyFormatter(overduePrice.toString()) : '-'}
              </Box>
            </Stack>

            <Stack direction="row">
              <Box sx={{ color: 'text.secondary', width: 150, textAlign: 'left' }}>Tiền nợ khó đòi</Box>
              <Box sx={{ width: 160, textAlign: 'right' }}>
                &nbsp;{doubtfulPrice ? currencyFormatter(doubtfulPrice.toString()) : '-'}
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
