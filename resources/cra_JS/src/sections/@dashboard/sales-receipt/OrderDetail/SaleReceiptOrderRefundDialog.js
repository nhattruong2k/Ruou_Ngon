import PropTypes from 'prop-types';
import React, { useState } from 'react';
// @mui
import { Stack, Dialog, Typography, ListItemButton, Divider } from '@mui/material';
// components
import IconButton from '@mui/material/IconButton';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import { currencyFormatter } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

SaleReceiptOrderRefundDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectOrderItem: PropTypes.func,
  orderItems: PropTypes.array
};

export default function SaleReceiptOrderRefundDialog({ open, selectOrderItem, onClose, orderItems }) {

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2.5, px: 3 }}>
        <Typography variant="h6"> Chọn sản phẩm hoàn trả </Typography>

        <IconButton sx={{ alignSelf: 'flex-end' }} aria-label="delete" size="normal" color="error" onClick={onClose}>
          <Iconify icon="mingcute:close-fill" />
        </IconButton>
      </Stack>

      <Divider sx={{ pt: 2 }} />
      <Stack sx={{ pt: 1 }}>
        <Scrollbar sx={{ p: 1.5, pt: 0, maxHeight: 80 * 8 }}>
          {orderItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => selectOrderItem(item)}
              sx={{
                p: 1.5,
                borderRadius: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                },
              }}
            >
              <Typography variant="subtitle2">{item?.good?.name}</Typography>

              <Typography
                variant="caption"
                component="div"
                sx={{
                  my: 0.5,
                  color: 'info.main',
                  fontWeight: 'fontWeightMedium',
                }}
              >
                {item?.good?.price ? currencyFormatter(item?.good?.price.toString()) : 0}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item?.good?.code}
              </Typography>
            </ListItemButton>
          ))}
        </Scrollbar>
      </Stack>
    </Dialog>
  );
}
