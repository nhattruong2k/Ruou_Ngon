import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
// form
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
// @mui
import { Avatar, Box, Button, Stack, Table, TableBody, TableCell, TableRow } from '@mui/material';
import IconButton from '@mui/material/IconButton';
// utils
import axios from '../../../../utils/axios';
// components
import { useSnackbar } from '../../../../components/snackbar';
import { RHFTextField } from '../../../../components/hook-form';
import { TableHeadCustom, TableNoData, useTable } from '../../../../components/table';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import Iconify from '../../../../components/iconify';
import { currencyFormatter, formatPriceNumber } from '../../../../utils/formatNumber';
import { getText } from '../../../../utils/number-to-text-vietnamese/index';
import ConfirmDialog from '../../../../components/confirm-dialog';
import GoodListDialog from './GoodListDialog';
import { HOST_ASSETS_URL } from '../../../../config';
import { FOLDER_IMAGE } from '../../../../utils/constant';

const TABLE_HEAD = [
  {
    label: 'Mã SP',
    id: 'good_code',
    minWidth: 160,
  },
  {
    label: 'Tên SP',
    id: 'good_name',
    minWidth: 160,
  },
  {
    label: 'Hình ảnh',
    id: 'image',
    minWidth: 120,
  },
  // {
  //   label: 'ĐVT',
  //   id: 'unit',
  // },
  {
    label: 'Số lượng',
    id: 'quantity',
    align: 'right',
    minWidth: 120,
  },
  {
    label: 'Đơn giá',
    id: 'price',
    align: 'right',
    minWidth: 160,
  },
  {
    label: 'Chiết khấu',
    id: 'discount_rate',
    align: 'right',
    minWidth: 120,
  },
  {
    label: 'Đơn giá sau CK',
    id: 'unit_price_after_discount',
    align: 'right',
    minWidth: 160,
  },
  {
    label: 'Tiền CK',
    id: 'discount_price',
    align: 'right',
    minWidth: 160,
  },
  {
    label: 'Tổng tiền',
    id: 'total_price',
    align: 'right',
    minWidth: 160,
  },
  {
    id: '',
  },
];
const SalesReceiptOrderDetail = forwardRef(
  (
    {
      goodData,
      currentParty,
      isEdit = false,
      tax,
      infoPaymentEdit,
      activeFields,
      isLoading = false,
      mode,
      isRefresh,
      setRefresh,
      orderSample,
      keySearch,
      isSelectSample,
      goodInventory,
      goodInventoryLoading,
    },
    ref
  ) => {
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
    const { control, register, setValue, watch, resetField, getValues, reset } = useFormContext();

    const { errors } = useFormState();

    const [loadingBtnSave, setLoadingBtnSave] = useState(false);

    const [openConfirm, setOpenConfirm] = useState(false);

    const [itemRemove, setItemRemove] = useState(null);

    const [totalOrder, setTotalOrder] = useState(0);

    const [totalDiscountOrder, setTotalDiscountOrder] = useState(0);

    const [taxPrice, setTaxPrice] = useState(0);

    const [totalPricePayment, setTotalPricePayment] = useState(0);

    const [totalPaymentByText, setTotalPaymentByText] = useState('');

    const [timer, setTimer] = useState(null);

    const [openFrom, setOpenFrom] = useState(false);

    const [goodSelected, setGoodSelected] = useState([]);

    const { enqueueSnackbar } = useSnackbar();

    const { fields, update, append, remove, prepend } = useFieldArray({
      control,
      name: 'items',
    });

    const [backupFields, setBackupFields] = useState([]);

    const [dataRender, setDataRender] = useState([]);

    const isNotFound = !fields.length || (!isLoading && !fields.length);

    const values = watch();

    useEffect(() => {
      if (isEdit) {
        setTotalOrder(infoPaymentEdit?.totalPriceOrder);
        setTotalDiscountOrder(infoPaymentEdit?.totalDiscountPriceOrder);
        setTaxPrice(infoPaymentEdit?.totalTaxPrice);

        const result =
          infoPaymentEdit?.totalPriceOrder + infoPaymentEdit?.totalTaxPrice - infoPaymentEdit?.totalDiscountPriceOrder;
        setTotalPricePayment(result);

        setGoodSelected(infoPaymentEdit?.goodSelected);
      } else {
        setTotalOrder(0);
        setTotalDiscountOrder(0);
        setTaxPrice(0);
        setTotalPricePayment(0);
      }
    }, [isEdit, infoPaymentEdit]);

    useEffect(() => {
      if (isRefresh) {
        setTotalOrder(0);
        setTotalDiscountOrder(0);
        setTaxPrice(0);
        setTotalPricePayment(0);
        setTotalPaymentByText('');
        setRefresh();
      }
    }, [isRefresh]);

    const handleAddOrderSample = () => {
      const goodItems = orderSample?.order_item_samples.map((item) => ({
        order_item_id: null,
        good_id: item.good?.id,
        good_code: item.good?.code,
        good_name: item.good.name,
        good_image: item.good.photo,
        // good_unit: item.good.unit_of_measure.name,
        quantity: 0,
        price: item.good.price,
        total_price: formatPriceNumber(item?.good?.price || 0) * 1,
        price_after_discount: item.discount,
        discount_price: item.good.price - item.discount,
        discount_rate: item.percent_discount,
        max_discount_rate: item?.good?.max_discount_rate,
      }));
      append(goodItems);
      setBackupFields(goodItems);
    };

    const searchGood = (keyword) => {
      const filteredData = fields.filter(
        (data) =>
          data.good_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
          data.good_code.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
        // data.good_name.toLowerCase().includes(keyword.toLowerCase())
      );
      setBackupFields(filteredData);
    };

    const handleRemove = async () => {
      if (itemRemove.item.order_item_id) {
        setLoadingBtnSave(true);

        await axios
          .post('rm-order-item-sales-receipt', {
            id: itemRemove.item.order_item_id,
          })
          .then((response) => {
            enqueueSnackbar('Xóa thành công');
          });

        setLoadingBtnSave(false);
        remove(itemRemove.index);
        values.items.splice(itemRemove.index, 1);
        fields.splice(itemRemove.index, 1);
        if (isSelectSample) backupFields.splice(itemRemove.index, 1);
        handleTotalOrder();
        handleTotalDiscountPrice();

        setOpenConfirm(false);
        updateGoodSelected(itemRemove.item, 'remove', itemRemove.index);
      } else {
        setLoadingBtnSave(true);
        remove(itemRemove.index);
        values.items.splice(itemRemove.index, 1);
        fields.splice(itemRemove.index, 1);
        if (isSelectSample) backupFields.splice(itemRemove.index, 1);
        setOpenConfirm(false);
        updateGoodSelected(itemRemove.item, 'remove', itemRemove.index);
        setTimeout(() => {
          setLoadingBtnSave(false);
        }, 500);
      }
    };

    const handleOpenConfirm = (key, data) => {
      setItemRemove({ index: key, item: data });
      if (isEdit) {
        setOpenConfirm(true);
      } else {
        updateGoodSelected(data, 'remove', key);
        // remove(key);
        if (values?.items) {
          values.items.splice(key, 1);
          handleTotalOrder();
          handleTotalDiscountPrice();
          fields.splice(key, 1);
          if (isSelectSample) backupFields.splice(key, 1);
        }
      }
    };

    const handleCloseConfirm = () => {
      setOpenConfirm(false);
    };

    const handleTotalOrder = (vatRate = 0) => {
      const orderItems = values?.items || [];

      // handle when list order item have empty item
      const orderItemsFilter = orderItems.filter((item) => item.good_id !== null && item.quantity);

      const result = orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.total_price), 0);
      setTotalOrder(result);

      // tax GTGT
      if (vatRate === 0) vatRate = values?.vat_rate || 0;

      setTaxPrice((result * vatRate) / 100);
    };

    const handleTotalDiscountPrice = () => {
      const orderItems = values?.items || [];

      // handle when list order item have empty item
      const orderItemsFilter = orderItems.filter((item) => item.good_id !== null && item.quantity);

      setTotalDiscountOrder(
        orderItemsFilter.reduce((total, item) => total + formatPriceNumber(item.discount_price), 0)
      );
    };

    const handleDiscountPrice = (totalPrice, discountRate) => (totalPrice * parseFloat(discountRate)) / 100;

    const checkDiscountRate = (currentDiscount, maxDiscount) => {
      if (currentDiscount > parseFloat(maxDiscount))
        enqueueSnackbar('Chiết khấu vượt quá quy định', { variant: 'warning' });
    };

    const handleDiscountRate = (totalPrice, discountPrice) => (discountPrice / totalPrice) * 100;

    useEffect(() => {
      const result = totalOrder + taxPrice - totalDiscountOrder;

      setTotalPaymentByText(getText(result));

      setTotalPricePayment(result);
    }, [totalOrder, taxPrice, totalDiscountOrder]);

    const checkQuantityBeforeCreate = async (goodId, quantity, index) => {
      if (values.warehouse?.id) {
        const body = {
          good_id: goodId,
          warehouse_id: values.warehouse?.id,
          quantity: Number(quantity),
        };
        await axios.post('check-quantity-before-create', body).then((response) => {
          if (!response?.data?.data) {
            enqueueSnackbar('Số lượng sản phẩm trong kho không đủ', { variant: 'error' });
            setValue(`items[${index}].quantity`, 0);
            update(`items[${index}].total_price`, 0);
            setValue(`items[${index}].total_price`, 0);
            setValue(`items[${index}].discount_price`, 0);
            handleTotalOrder();
            handleTotalDiscountPrice();
          }
        });
      } else {
        enqueueSnackbar('Chưa chọn kho đặt hàng. Vui lòng chọn kho!', { variant: 'error' });
        setValue(`items[${index}].quantity`, 0);
        update(`items[${index}].total_price`, 0);
        setValue(`items[${index}].total_price`, 0);
        setValue(`items[${index}].discount_price`, 0);
        handleTotalOrder();
        handleTotalDiscountPrice();
      }
    };

    const updateGoodSelected = (good, type, index) => {
      if (type === 'remove') {
        setGoodSelected((prevGoods) => prevGoods.filter((item) => item.id !== good.good_id));
        remove(index);
      } else {
        setGoodSelected((prevGoods) => [...prevGoods, good]);
        // let discountOfGood = parseFloat(good?.discount_rate || 0)
        //   ? good?.discount_rate || 0
        //   : currentParty?.discount_rate || 0;
        // discountOfGood = Number(discountOfGood);
        append({
          order_item_id: null,
          good_id: good?.id,
          good_code: good?.code,
          good_name: good?.name,
          good_image: good?.photo,
          // good_unit: good?.unit_of_measure?.name,
          quantity: 0,
          price: good?.price,
          total_price: 0,
          discount_price: 0,
          discount_rate: currentParty?.discount_rate || 0,
          max_discount_rate: good?.max_discount_rate,
        });
      }
    };

    const handleOpenFrom = () => {
      setOpenFrom(true);
    };

    const handleCloseFrom = () => {
      setOpenFrom(false);
    };

    const clearForm = () => {
      setGoodSelected([]);
    };

    useImperativeHandle(ref, () => ({
      handleAddOrderSample,
      handleOpenFrom,
      clearForm,
      searchGood,
      setBackupFields,
      setDataRender,
    }));

    const handleScroll = (event) => {
      event.target.blur();
      event.stopPropagation();
    };

    useEffect(() => {
      const data = backupFields.length > 0 || isSelectSample ? backupFields : fields;
      setDataRender(data);
    }, [backupFields, fields]);

    return (
      <>
        <Scrollbar>
          <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {dataRender.map((element, index) => (
                <TableRow key={`${index}_${element?.id}`} hover>
                  {/* <TableCell>
                <RHFAutocomplete
                  sx={{ width: { md: 170 } }}
                  name={`items[${index}].good_code`}
                  autoHighlight
                  disabled={activeFields.good_code}
                  options={goods.map((option) => option)}
                  filterOptions={(options, { inputValue }) => {
                    return options.filter(option =>
                      option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                      ||
                      option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    const ItemFilter = values.items.filter((good) => good?.good_code?.id === newValue?.id);
                    if (ItemFilter.length > 1) {
                      enqueueSnackbar('Mã sản phẩm đã tồn tại', { variant: 'error' });
                      update(`items[${index}].good_code`, null);
                      update(`items[${index}].good_name`, '');
                      update(`items[${index}].good_unit`, '');
                      update(`items[${index}].price`, 0);
                      update(`items[${index}].discount_rate`, 0);
                      update(`items[${index}].total_price`, 0);
                      setValue(`items[${index}].good_code`, null);
                      setValue(`items[${index}].good_name`, '');
                      setValue(`items[${index}].good_unit`, '');
                      setValue(`items[${index}].price`, 0);
                      setValue(`items[${index}].discount_rate`, 0);
                      setValue(`items[${index}].total_price`, 0);
                    } else {
                      let discountOfGood = parseFloat(newValue?.discount_rate || 0)
                        ? newValue?.discount_rate || 0
                        : currentParty?.discount_rate || 0;
                      const totalPrice = newValue?.price
                        ? (newValue?.price * Number(fields[index].quantity)).toString()
                        : 0;
                      discountOfGood = Number(discountOfGood);
                      const discountPrice = handleDiscountPrice(totalPrice, discountOfGood);
                      update(`items[${index}].good_code`, newValue);
                      update(`items[${index}].good_name`, newValue?.name);
                      update(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                      update(`items[${index}].price`, newValue?.price ? currencyFormatter(newValue?.price) : 0);
                      update(`items[${index}].discount_rate`, discountOfGood);
                      update(`items[${index}].total_price`, currencyFormatter(totalPrice));
                      update(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                      setValue(`items[${index}].good_code`, newValue);
                      setValue(`items[${index}].good_name`, newValue?.name);
                      setValue(`items[${index}].good_unit`, newValue?.unit_of_measure?.name);
                      setValue(`items[${index}].price`, newValue?.price ? currencyFormatter(newValue?.price) : 0);
                      setValue(`items[${index}].discount_rate`, discountOfGood || 0);
                      setValue(`items[${index}].total_price`, currencyFormatter(totalPrice));
                      setValue(`items[${index}].discount_price`, currencyFormatter(discountPrice.toString()));
                      setValue(`items[${index}].good_image`, newValue?.photo);
                      handleTotalOrder();
                      handleTotalDiscountPrice();
                      checkQuantityBeforeCreate(newValue?.id, index);
                    }
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {option?.code} - {option?.name}
                      </li>
                    );
                  }}
                  getOptionLabel={(option) => option.code || ''}
                  renderInput={(params) => <TextField {...params} size="small" InputLabelProps={{ shrink: true }} />}
                />
              </TableCell> */}
                  <TableCell sx={{ width: 150 }}>{element?.good_code || ''}</TableCell>
                  <TableCell sx={{ width: 180 }}>{element?.good_name || ''}</TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <Avatar
                      alt={element?.good_name || ''}
                      src={
                        element?.good_image === '' || element?.good_image === null
                          ? ''
                          : `${HOST_ASSETS_URL}storage/${FOLDER_IMAGE.good}/${element?.good_image}`
                      }
                      variant="rounded"
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                  </TableCell>
                  {/* <TableCell sx={{ width: 120 }}>{element?.good_unit || ''}</TableCell> */}
                  <TableCell sx={{ width: 120, textAlign: 'right' }}>
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      onWheel={handleScroll}
                      name={`items[${index}].quantity`}
                      type="number"
                      disabled={activeFields.quantity}
                      onChange={(e) => {
                        const quantity = e.target.value && e.target.value > 0 ? e.target.value : 1;
                        // clearTimeout(timer);
                        // const newTimer = setTimeout(() => {
                        //   checkQuantityBeforeCreate(element?.good_id, quantity, index);
                        // }, 500);
                        // setTimer(newTimer);
                        const price = formatPriceNumber(element.price === null ? '' : element.price);
                        const totalPrice =
                          formatPriceNumber((element.price === null ? '' : element.price).toString()) * Number(quantity);
                        const discountRate = fields[index]?.discount_rate;
                        let priceAfterDiscount = 0;
                        let discountPrice = 0;
                        const valuePriceAfterDiscountCurrent = getValues(`items[${index}].price_after_discount`);
                        if (valuePriceAfterDiscountCurrent === '' || !valuePriceAfterDiscountCurrent) {
                          priceAfterDiscount = price - (price * parseFloat(discountRate)) / 100;
                          discountPrice = (totalPrice * parseFloat(discountRate)) / 100;
                          setValue(
                            `items[${index}].price_after_discount`,
                            currencyFormatter(priceAfterDiscount.toString())
                          );
                        } else {
                          discountPrice =
                            totalPrice -
                            formatPriceNumber(getValues(`items[${index}].price_after_discount`)) * Number(quantity);
                        }
                        update(`items[${index}].quantity`, quantity);
                        setValue(`items[${index}].quantity`, quantity);
                        setValue(`items[${index}].total_price`, currencyFormatter(totalPrice.toString()));
                        setValue(`items[${index}].discount_price`, discountPrice);
                        handleTotalOrder();
                        handleTotalDiscountPrice();
                        checkDiscountRate(discountRate, element?.max_discount_rate);

                        // Update value item of order sample
                        if (backupFields.length > 0) {
                          backupFields[index].quantity = quantity;
                          backupFields[index].total_price = currencyFormatter(totalPrice.toString());
                          backupFields[index].discount_price = discountPrice;
                        }
                      }}
                      sx={{ maxWidth: { md: 100 } }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 180 }} align="right">
                    {currencyFormatter(element?.price || '')}
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      name={`items[${index}].discount_rate`}
                      onWheel={handleScroll}
                      type="number"
                      disabled={activeFields.discount_rate}
                      onChange={(e) => {
                        const discountRate = e.target.value && e.target.value >= 0 ? e.target.value.replace(',', '.') : 0;
                        const discountPrice = handleDiscountPrice(
                          formatPriceNumber(element.total_price.toString()),
                          discountRate
                        );
                        const price = formatPriceNumber(element.price === null ? '' : element.price);
                        const priceAfterDiscount = price - (price * parseFloat(discountRate)) / 100;
                        update(`items[${index}].discount_rate`, discountRate);
                        setValue(`items[${index}].discount_rate`, discountRate);
                        setValue(`items[${index}].discount_price`, discountPrice);
                        setValue(
                          `items[${index}].price_after_discount`,
                          currencyFormatter(priceAfterDiscount.toString())
                        );
                        handleTotalDiscountPrice();
                        checkDiscountRate(discountRate, element?.max_discount_rate);
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 180 }}>
                    <RHFTextField
                      className="input-number-text-align-right"
                      size="small"
                      name={`items[${index}].price_after_discount`}
                      disabled={activeFields.price_after_discount}
                      typeinput="price"
                      onChange={(e) => {
                        const price = formatPriceNumber(element?.price);
                        let priceAfterDiscount = formatPriceNumber(e.target.value !== '' ? e.target.value : 0);
                        let discount = '0';
                        let discountPrice = 0;

                        if (priceAfterDiscount > price) {
                          // enqueueSnackbar('Số tiền chiết khấu vượt quá đơn giá', { variant: 'error' });

                          priceAfterDiscount = element?.price;
                          discount = '0';

                          setValue(`items[${index}].price_after_discount`, currencyFormatter(priceAfterDiscount));
                          setValue(`items[${index}].discount_rate`, discount);
                          discountPrice = handleDiscountPrice(
                            formatPriceNumber(element.total_price.toString()),
                            parseFloat(discount)
                          );
                        } else {
                          discount = ((price - priceAfterDiscount) / price) * 100;

                          setValue(`items[${index}].price_after_discount`, currencyFormatter(priceAfterDiscount));
                          setValue(`items[${index}].discount_rate`, parseFloat(discount.toFixed(2)));
                          discountPrice =
                            formatPriceNumber(element?.total_price) - priceAfterDiscount * Number(element.quantity);
                        }
                        update(`items[${index}].discount_price`, discountPrice);
                        setValue(`items[${index}].discount_price`, discountPrice);
                        handleTotalDiscountPrice();
                        checkDiscountRate(parseFloat(discount), element?.max_discount_rate);
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ width: 140, textAlign: 'right' }}>
                    {/* <RHFTextField
                    size="small"
                    name={`items[${index}].discount_price`}
                    disabled={activeFields.discount_price}
                    onChange={(e) => {
                      const discountPrice = e.target.value ? formatPriceNumber(e.target.value) : 0;
                      const discountRate = handleDiscountRate(formatPriceNumber(element.total_price), discountPrice);
                      setValue(`items[${index}].discount_rate`, parseFloat(discountRate.toFixed(2)));
                      setValue(
                        `items[${index}].discount_price`,
                        e.target.value ? currencyFormatter(e.target.value) : 0
                      );
                      handleTotalDiscountPrice();
                      checkDiscountRate(discountRate, element?.max_discount_rate);
                    }}
                  /> */}
                    {currencyFormatter(element?.discount_price)}
                  </TableCell>

                  <TableCell sx={{ width: 180, textAlign: 'right' }}>
                    {currencyFormatter(
                      formatPriceNumber(element?.total_price) - formatPriceNumber(element?.discount_price) || ''
                    )}
                  </TableCell>

                  <TableCell align='right'>
                    {(mode === 'add' || mode === 'edit') && (
                      <IconButton
                        sx={{ maxWidth: { md: 120 } }}
                        aria-label="delete"
                        size="small"
                        color="error"
                        disabled={loadingBtnSave}
                        onClick={() => {
                          handleOpenConfirm(index, element);
                        }}
                      >
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableNoData isNotFound={isNotFound} />
            </TableBody>
          </Table>
        </Scrollbar>
        <Stack spacing={2} alignItems="flex-end" sx={{ my: 3, textAlign: 'right', typography: 'body2', px: 3 }}>
          <Stack direction="row">
            <Box sx={{ color: 'text.secondary' }}>Cộng tiền hàng</Box>
            <Box sx={{ width: 160, typography: 'subtitle2' }}>
              {totalOrder ? currencyFormatter(totalOrder.toString()) : '-'}
            </Box>
          </Stack>

          <Stack direction="row">
            <Box sx={{ color: 'text.secondary' }}>Thuế xuất GTGT</Box>
            {/* <Box sx={{ width: 160 }}> {totalOrder ? '10%' : '-'} </Box> */}
            <Box sx={{ width: 160 }}>
              <RHFTextField
                sx={{ width: 100 }}
                size="small"
                name="vat_rate"
                disabled={activeFields.vat_rate}
                onChange={(e) => {
                  setValue('vat_rate', e.target.value);
                  handleTotalOrder(e.target.value);
                }}
                type="number"
                className="input-number-text-align-right"
              />
            </Box>
          </Stack>

          <Stack direction="row">
            <Box sx={{ color: 'text.secondary' }}>Tiền thuế GTGT</Box>
            <Box sx={{ width: 160 }}>{taxPrice ? currencyFormatter(taxPrice.toString()) : '-'}</Box>
          </Stack>

          <Stack direction="row">
            <Box sx={{ color: 'text.secondary' }}>Cộng tiền chiết khấu</Box>
            <Box sx={{ width: 160, typography: 'subtitle2', color: '#ff5630' }}>
              {totalDiscountOrder ? `- ${currencyFormatter(totalDiscountOrder.toString())}` : '-'}
            </Box>
          </Stack>

          <Stack direction="row" sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>
            <Box>Tổng cộng tiền thanh toán</Box>
            <Box sx={{ width: 160 }}>{totalPricePayment ? currencyFormatter(totalPricePayment.toString()) : '-'}</Box>
          </Stack>
          <Stack direction="row">
            <Box sx={{ color: 'text.secondary' }}>Số tiền viết bằng chữ (VNĐ):</Box>
            <Box sx={{ minWidth: 160 }}>&nbsp;{totalPaymentByText || '-'}</Box>
          </Stack>
        </Stack>

        <ConfirmDialog
          open={openConfirm}
          onClose={handleCloseConfirm}
          title="Xóa"
          content="Bạn có chắc chắn muốn xóa?"
          action={
            <Button variant="contained" color="error" onClick={handleRemove}>
              Xóa
            </Button>
          }
        />
        <GoodListDialog
          open={openFrom}
          onClose={handleCloseFrom}
          goodData={goodData}
          selected={goodSelected}
          onSelect={updateGoodSelected}
          goodInventory={goodInventory}
          goodInventoryLoading={goodInventoryLoading}
        />
      </>
    );
  }
);

export default SalesReceiptOrderDetail;
