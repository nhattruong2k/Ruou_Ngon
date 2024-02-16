import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { TableRow, MenuItem, TableCell, IconButton, Typography } from '@mui/material';
// utils

// components
import { currencyFormatter } from '../../../../utils/formatNumber';
import { FUNCTIONS, FOLDER_IMAGE, PAYMENT_TYPE } from '../../../../utils/constant';

export default function TotalProductReport({allProducts, isLoading }) {
    const [totalQuantily, setTotalquantity] = useState(0);

    const [totalSale, setTotalSale] = useState(0);
  
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        if (!isLoading) {
          const product = allProducts.filter((val) => val?.order?.function_id === FUNCTIONS?.sale_receipt);

          const totalQuantily = product.reduce((accumulator, currentScore) => {
            return accumulator + Number(currentScore.good?.quatity_order);
          }, 0);
      
          const totalSale = product.reduce((accumulator, currentScore) => {
            return accumulator + Number(currentScore.good?.total_sale);
          }, 0);
      
          const totalRevenue = product.reduce((accumulator, currentScore) => {
            return accumulator + Number(currentScore.good?.total_revenue);
          }, 0);
      
          setTotalquantity(totalQuantily);
          setTotalSale(totalSale);
          setTotalRevenue(totalRevenue);
        }
      }, [isLoading]);

    return (
        <>
            <TableRow>
                <TableCell scope="row" colspan="4" />
                <TableCell align="right">
                    <Typography>Tổng :</Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography>
                        {totalQuantily ? currencyFormatter(totalQuantily.toString()) : 0}
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography>
                        {totalSale ?  currencyFormatter(totalSale.toString()) : 0}
                    </Typography>
                </TableCell>
            </TableRow>
        </>
    )
}