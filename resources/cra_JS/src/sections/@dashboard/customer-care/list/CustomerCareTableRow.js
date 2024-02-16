import PropTypes from 'prop-types';
import { useState } from 'react';
import { sentenceCase } from 'change-case';
// @mui
import { Stack, Button, TableRow, Checkbox, MenuItem, TableCell, IconButton, Typography } from '@mui/material';

import { stringDate } from '../../../../utils/formatTime';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';

CustomerCareTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.bool,
    onSelectRow: PropTypes.func,
};

export default function CustomerCareTableRow({ row, selected, onSelectRow }) {
    const [openConfirm, setOpenConfirm] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    return (
        <>
            <TableRow hover selected={selected}>
                <TableCell>{stringDate(row?.date)}</TableCell>

                <TableCell>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {row?.customer_care_type?.name || ''}
                    </Typography>
                </TableCell>

                <TableCell>{row?.party?.name || ''}</TableCell>
                <TableCell>{row?.party?.employee?.name || ''}</TableCell>
                <TableCell>{row?.description || ''}</TableCell>
            </TableRow>
        </>
    )
}