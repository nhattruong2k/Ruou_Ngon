import sum from 'lodash/sum';
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// @mui
import { Box, Stack, Button, Divider, IconButton } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// utils
import { currencyFormatter, formatPriceNumber, fCurrency } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';

const ListDetailGoood = forwardRef(({ isEdit, groupOrderToGood, row, index }, ref) => {

    const [showDetail, setShowDetail] = useState(false);

    const handleShow = () => {
        setShowDetail(!showDetail);
    };

    return (

        <>
            <Stack
                sx={{ mt: 3 }}
                spacing={2}
                direction={{ xs: 'column-reverse', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
            >
                <Button size="small" startIcon={showDetail ? <Iconify icon="eva:minus-fill" /> : <Iconify icon="eva:plus-fill" />}
                    onClick={handleShow} sx={{ flexShrink: 0 }}>
                    Chi tiết đơn hàng
                </Button>
            </Stack>
            {
                showDetail &&
                <Stack spacing={2} sx={{ mt: 3 }}>
                    <Scrollbar>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>STT</TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>Ngày CT</TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>Mã CT</TableCell>
                                    <TableCell sx={{ minWidth: 180 }}>Tên sản phẩm</TableCell>
                                    <TableCell sx={{ minWidth: 160 }}>ĐV tính</TableCell>
                                    <TableCell sx={{ minWidth: 160 }} align='right'>Số lượng</TableCell>
                                    <TableCell sx={{ minWidth: 180 }} align='right'>Đơn giá</TableCell>
                                    {/* <TableCell>Chiết khấu</TableCell> */}
                                    <TableCell sx={{ minWidth: 180 }} align='right'>Thành tiền</TableCell>
                                    <TableCell sx={{ minWidth: 160 }} align='right'>Số lượng trả</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupOrderToGood.filter((orderItem) => orderItem.good_id === row.good_id).map((orderGoodItem, indexG) =>
                                (
                                    <TableRow key={indexG} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{indexG + 1}</TableCell>
                                        <TableCell align="right">{orderGoodItem?.order_date}</TableCell>
                                        <TableCell>{orderGoodItem?.order_code}</TableCell>
                                        <TableCell>{orderGoodItem?.good?.name}</TableCell>
                                        <TableCell>{orderGoodItem?.good?.unit_of_measure?.name}</TableCell>
                                        <TableCell align="right">{orderGoodItem?.quantity}</TableCell>
                                        <TableCell align="right">{currencyFormatter(Number(orderGoodItem?.price))}</TableCell>
                                        <TableCell align="right">{currencyFormatter(Number(orderGoodItem?.price) * Number(orderGoodItem?.quantity))}</TableCell>
                                        <TableCell align="right">
                                            {orderGoodItem?.quantity_refund}
                                        </TableCell>
                                    </TableRow>
                                ))
                                }

                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Stack>
            }
            <Divider sx={{ mt: 3, mb: 2, borderStyle: 'dashed' }} />
        </>

    );
});



export default ListDetailGoood;