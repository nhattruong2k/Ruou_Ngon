import PropTypes from 'prop-types';
// @mui
import { TableRow, TableCell, Typography } from '@mui/material';

import moment from 'moment';
// utils

// components
import { currencyFormatter } from '../../../../utils/formatNumber';

DebtsTableRow.propTypes = {
  row: PropTypes.object,
};

export default function DebtsTableRow({ row }) {
  return (
    <>
      <TableRow hover>
        <TableCell>{row?.code || ''}</TableCell>
        <TableCell>{row?.date ? moment(row?.date).format('DD-MM-YYYY') : ''}</TableCell>
        <TableCell align="right">{row?.total_price ? currencyFormatter(row?.total_price.toString()) : 0}</TableCell>
        <TableCell align="right">
          {currencyFormatter(
            (
              row?.total_price -
              (row?.info_debt?.overdue_debt + row?.info_debt?.undue_debt + row?.info_debt?.doubtful_debt)
            ).toString()
          ) || 0}
        </TableCell>
        <TableCell align="right">
          {currencyFormatter(
            (row?.info_debt?.overdue_debt + row?.info_debt?.undue_debt + row?.info_debt?.doubtful_debt).toString()
          ) || 0}
        </TableCell>
        <TableCell align="right">{currencyFormatter(row?.info_debt?.undue_debt.toString()) || 0}</TableCell>
        <TableCell align="right" sx={{ color: row?.info_debt?.overdue_debt > 0 ? 'red' : '#212B36' }}>
          {currencyFormatter(row?.info_debt?.overdue_debt.toString()) || 0}
        </TableCell>
        <TableCell align="right">{row?.info_debt?.overdue_date || 0}</TableCell>
        <TableCell align="right" sx={{ color: row?.info_debt?.doubtful_debt > 0 ? 'red' : '#212B36' }}>
          {currencyFormatter(row?.info_debt?.doubtful_debt) || 0}
        </TableCell>
      </TableRow>
    </>
  );
}
