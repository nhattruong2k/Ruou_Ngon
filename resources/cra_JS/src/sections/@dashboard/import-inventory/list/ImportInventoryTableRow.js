import PropTypes from 'prop-types';
// @mui
import { TableRow, TableCell } from '@mui/material';

ImportInventoryTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
};

export default function ImportInventoryTableRow({ row, selected }) {

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{row?.internal_org?.name || ''}</TableCell>
        <TableCell>{row?.good?.code || ''}</TableCell>
        <TableCell>{row?.good?.name || ''}</TableCell>
        <TableCell>{row?.good?.unit_of_measure?.name || ''}</TableCell>
        <TableCell align="right">{row?.info_report_inventory?.begin_inventory || 0}</TableCell>
        <TableCell align="right">{row?.info_report_inventory?.good_import || 0}</TableCell>
        <TableCell align="right">{row?.info_report_inventory?.good_export || 0}</TableCell>
        <TableCell align="right">{row?.info_report_inventory?.end_inventory || 0}</TableCell>
      </TableRow>
    </>
  );
}
