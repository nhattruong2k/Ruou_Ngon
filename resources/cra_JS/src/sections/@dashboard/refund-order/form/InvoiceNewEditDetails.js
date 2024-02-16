import sum from 'lodash/sum';
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import { Box, Stack, Button, Divider, IconButton } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import { RHFSelect, RHFTextField } from '../../../../components/hook-form';
import GoodListDialog from './GoodListDialog';
import ListDetailGoood from './list-detail-good';

const InvoiceNewEditDetails = forwardRef(({ row, isEdit, goodData, groupOrderToGood, distributeQuantity }, ref) => {
  const { control, setValue, watch, resetField } = useFormContext();

  const values = watch();

  const { fields, update, append, remove, prepend } = useFieldArray({
    control,
    name: 'refundGoods',
  });

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openFrom, setOpenFrom] = useState(false);

  const [goodSelected, setGoodSelected] = useState([]);

  // const [goodData, setGoodData] = useState({ goods: [], isLoading: false });

  const handleOpenFrom = () => {
    setOpenFrom(true);
  };

  const handleCloseFrom = () => {
    setOpenFrom(false);
  };

  const clearForm = () => {
    setGoodSelected([]);
  };

  const updateGoodSelected = (goodSelect, type, index) => {
    if (type === 'remove') {
      setGoodSelected((prevGoods) => prevGoods.filter((item) => item.good_id !== goodSelect.good_id));
      remove(index);
    } else if (type === 'removeAll') {
      setGoodSelected([]);
      remove();
    } else {
      setGoodSelected((prevGoods) => [...prevGoods, goodSelect]);
      let discountOfGood = 0;
      // let discountOfGood = parseFloat(good?.discount_rate || 0)
      //   ? good?.discount_rate || 0
      //   : currentParty?.discount_rate || 0;
      discountOfGood = Number(discountOfGood);
      const { good, quantity, quantityRefund } = goodSelect;
      append({
        good_id: good?.id,
        good_code: good?.code,
        good_name: good?.name,
        quantity,
        quantityRefund
      });
    }
  };

  useImperativeHandle(ref, () => ({
    handleOpenFrom,
    clearForm,
    updateGoodSelected
  }));

  return (

    <>
      {fields.map((item, index) =>
      (
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField
              size="small"
              name=""
              value={item?.good_code}
              label="Mã Sản phảm"
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <RHFTextField
              size="small"
              name=""
              value={item?.good_name}
              label="Tên Sản phảm"
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <RHFTextField
              size="small"
              name=""
              value={item?.quantity}
              label="Tổng số lượng mua"
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <RHFTextField
              disabled={isEdit}
              size="small"
              name={`refundGoods[${index}].quantityRefund`}
              label="Số lượng trả"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => {
                let value = event?.target?.value;
                if (Number(value) > item.quantity) {
                  value = item.quantity;
                }
                setValue(`refundGoods[${index}].quantityRefund`, value);
                distributeQuantity(item?.good_id, Number(value));
              }}
            />
            {
              !isEdit &&
              <IconButton aria-label="delete" onClick={() => { updateGoodSelected(item, 'remove', index) }}>
                <Iconify icon="eva:trash-2-outline" sx={{ color: 'red' }} />
              </IconButton>
            }

          </Stack>

          <ListDetailGoood
            row={item}
            isEdit={isEdit}
            groupOrderToGood={groupOrderToGood}
          />
        </Box>

      ))
      }

      <GoodListDialog
        open={openFrom}
        onClose={handleCloseFrom}
        goodData={goodData}
        selected={goodSelected}
        onSelect={updateGoodSelected}
      />
    </>
  );
});



export default InvoiceNewEditDetails;