import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  CardHeader,
  FormControlLabel,
  Switch,
  CardContent,
} from '@mui/material';

import { setMonth } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';

import { useDispatch, useSelector } from '../../../redux/store';
import ConclusionContractRsbToolbar from './ConclusionContractRsbToolbar';
// components
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
  RHFRadioGroup,
} from '../../../components/hook-form';
import Iconify from '../../../components/iconify';
import axios from '../../../utils/axios';
import { CONTRACT_TYPES } from '../../../utils/constant';
import { getGoods } from '../../../redux/slices/good';
import { getParties } from '../../../redux/slices/parties';
import { getConclusionContractById } from '../../../redux/slices/conclusionContract';
import { formatPriceNumber } from '../../../utils/formatNumber';
import ConclustionContractDetail from './ConclustionContractDetail';
import FileNewContractDialog from './FileNewContractDialog';

//-----------------------------------------------------------------------------------

const CONCLUSIONCONTRACT_TYPE_OPTION = [
  { id: 1, label: 'Hợp đồng sản phẩm', value: 1 },
  { id: 2, label: 'Hợp đồng du lịch', value: 2 },
];

ConclusionContractNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  currentConclusionContract: PropTypes.object,
};

export default function ConclusionContractNewEditForm({
  isEdit = false,
  isConfirm = false,
  isView = false,
  onClose,
  currentConclusionContract,
  refetchData,
}) {
  const [preview, setPreview] = useState(false);

  const { id } = useParams();

  const [files, setFiles] = useState([]);

  const [totalFile, setTotalFile] = useState(0);

  const dispatch = useDispatch();

  const refSubmitButtom = useRef();

  const tagertsDetailRef = useRef();

  const refSubmitButton = useRef();

  let dataConclusionContractSample = useSelector((state) => state.conclusionContract.conclusionContractByIdData);

  const PartyData = useSelector((state) => state.parties);

  const goodData = useSelector((state) => state.good);

  const [name, setName] = useState(null);

  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));

  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const [fileRemoves, setFileRemoves] = useState([]);

  const [showDetailsContract, setShowDetailsContract] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  const defaultCode = `HD${moment().format('YYMM')}-0000`;

  const [codeContract, setCodeContract] = useState(defaultCode);

  const [disabledInput, setDisabledInput] = useState({
    startDate: isConfirm || isView,
    endDate: isConfirm || isView,
    type_id: isConfirm || isView,
    party_id: isConfirm || isView,
    amount: isConfirm || isView,
    comment: isConfirm || isView,
    good: isConfirm || isView,
    quantity: isConfirm || isView,
    quantity_monthly: isConfirm || isView,
  });

  const NewPartiesSchema = Yup.object().shape({
    start_date: Yup.date().required('Vui lòng chọn ngày bắt đầu hợp đồng'),
    end_date: Yup.date()
      .min(Yup.ref('start_date'), 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu')
      .required('Vui lòng chọn ngày kết thúc hợp đồng'),
    type_id: Yup.object().required('Vui lòng chọn hợp đồng').nullable(),
    party_id: Yup.object().required('Chọn khách hàng').nullable(),
    amount: Yup.string().required('Vui lòng nhập tiền cọc'),
  });

  let statusOfOrder = null;

  const defaultValues = useMemo(
    () => ({
      start_date: currentConclusionContract?.date || moment().format('YYYY-MM-DD'),
      end_date: currentConclusionContract?.finish_day || moment().format('YYYY-MM-DD'),
      type_id: CONCLUSIONCONTRACT_TYPE_OPTION.find((item) => item.value === currentConclusionContract?.type_id) || null,
      party_id: currentConclusionContract?.party || null,
      code: currentConclusionContract?.code || '',
      amount: currentConclusionContract?.amount || '',
      comment: currentConclusionContract?.comment || '',
      good: [],
      is_edit: isEdit,
      is_confirm: isConfirm,
    }),
    [currentConclusionContract]
  );

  const methods = useForm({
    resolver: yupResolver(NewPartiesSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
    trigger,
  } = methods;

  const values = watch();

  useEffect(() => {
    dataConclusionContractSample = '';
    dispatch(getGoods());
    dispatch(getParties());
  }, []);

  useEffect(() => {
    if ((isEdit || isConfirm || isView) && currentConclusionContract) {
      dispatch(getConclusionContractById(currentConclusionContract?.id));
      reset(defaultValues);
      setCodeContract(currentConclusionContract?.code);
      setStartDate(currentConclusionContract?.date);
      setEndDate(currentConclusionContract?.finish_day);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, isConfirm, currentConclusionContract]);

  useEffect(() => {
    if (dataConclusionContractSample.isLoading === true) {
      setLoadingDetail(true);
    }

    if (!dataConclusionContractSample.isLoading && dataConclusionContractSample.conclusionContractSample) {
      setLoadingDetail(false);
      tagertsDetailRef?.current?.setGoodContractList(dataConclusionContractSample.conclusionContractSample);
    }
  }, [dataConclusionContractSample]);

  const addItem = () => {
    tagertsDetailRef?.current?.handleOpenFrom();
  };

  const onSave = (status = null) => {
    statusOfOrder = status;
    refSubmitButton?.current?.click();
  };

  const onSubmit = async (formData) => {
    setLoadingBtnSave(true);
    try {
      const statusId = statusOfOrder;
      const newFormData = {
        party_id: formData?.party_id?.id || null,
        comment: formData?.comment || '',
        good: formData?.good || [],
        date: moment(formData?.start_date).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD'),
        finish_day: moment(formData?.end_date).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD'),
        type_id: formData?.type_id?.value || null,
        amount: formatPriceNumber(formData?.amount),
        attachment_file: files,
        status_id: statusId,
        file_removes: fileRemoves,
      };
      if (isEdit || isConfirm) {
        newFormData._method = 'PUT';
        await axios.post(`conclusion-contract/${currentConclusionContract?.id}`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
      } else {
        await axios.post('conclusion-contract', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });
        tagertsDetailRef?.current?.clearForm();
        reset(defaultValues);
        setStartDate(moment().format('YYYY-MM-DD'));
        setEndDate(moment().format('YYYY-MM-DD'));
        setFiles([]);
        setTotalFile(0);
      }
      enqueueSnackbar(isEdit ? 'Cập nhật thành công!' : isConfirm ? 'Duyệt thành công' : 'Tạo mới thành công');
      setTimeout(() => {
        refetchData();
      }, 50);
      setLoadingBtnSave(false);
    } catch (error) {
      setLoadingBtnSave(false);
      if (error.code === 422) {
        const responseErrors = Object.entries(error.data);
        responseErrors.forEach((item) => {
          setTimeout(() => {
            enqueueSnackbar(item[1], { variant: 'error' });
          }, 500);
        });
      } else {
        enqueueSnackbar(error.errors, { variant: 'error' });
      }
    }
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  const handleUploadFile = (files) => {
    setTotalFile(files.length);
    setFiles(files);
  };

  useEffect(() => {
    if (isEdit || isConfirm || isView) {
      const showContract = CONCLUSIONCONTRACT_TYPE_OPTION.find(
        (item) => item.value === currentConclusionContract?.type_id
      );
      if (showContract?.value === CONTRACT_TYPES.travel) {
        setShowDetailsContract(false);
      } else {
        setShowDetailsContract(true);
      }
    }
  }, [isEdit, isConfirm, isView, currentConclusionContract, CONCLUSIONCONTRACT_TYPE_OPTION]);

  const filterDetailContract = (data) => {
    if (data?.value === CONTRACT_TYPES.travel) {
      setShowDetailsContract(false);
    } else {
      setShowDetailsContract(true);
    }
  };

  useEffect(() => {
    if (isConfirm || isView) {
      const attachmentFilename = JSON.parse(currentConclusionContract?.attachment);
      if (attachmentFilename.length > 0) {
        setTotalFile(attachmentFilename.length);
        setFiles(attachmentFilename);
      }
    }
    if (isEdit) {
      const attachmentFilename = JSON.parse(currentConclusionContract?.attachment);
      if (attachmentFilename && attachmentFilename.length > 0) {
        setTotalFile(attachmentFilename.length);
        setFiles(attachmentFilename);
      }
    }
  }, [isEdit, isConfirm, isView, currentConclusionContract]);

  return (
    <>
      <ConclusionContractRsbToolbar
        onSave={onSave}
        isEdit={isEdit}
        isConfirm={isConfirm}
        isView={isView}
        onCloseDetails={() => {
          onClose();
        }}
        loadingBtnSave={loadingBtnSave}
        title={isEdit ? 'Cập nhật hợp đồng' : isConfirm ? 'Duyệt hợp đồng' : 'Thêm hợp đồng'}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12} sx={{ borderRadius: 0, border: 0 }}>
            <Card sx={{ p: 3, borderRadius: 0, border: 0, boxShadow: 'none' }}>
              <Box
                rowGap={3}
                sx={{ pb: 3 }}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <DatePicker
                  value={startDate}
                  name="start_date"
                  disabled={disabledInput.startDate}
                  inputProps={{
                    readOnly: true,
                  }}
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue(
                      'start_date',
                      newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
                    );
                    setStartDate(newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
                    clearErrors(['start_date']);
                  }}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.start_date)}
                      helperText={errors.start_date?.message}
                      {...params}
                      size="small"
                      fullWidth
                      label="Ngày bắt đầu"
                    />
                  )}
                />

                <DatePicker
                  value={endDate}
                  name="end_date"
                  disabled={disabledInput.endDate}
                  inputProps={{
                    readOnly: true,
                  }}
                  sx={{ width: '100%' }}
                  onChange={(newValue) => {
                    setValue(
                      'end_date',
                      newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
                    );
                    setEndDate(newValue ? moment(newValue).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
                    clearErrors(['end_date']);
                  }}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.end_date)}
                      helperText={errors.end_date?.message}
                      {...params}
                      size="small"
                      fullWidth
                      label="Ngày kết thúc"
                    />
                  )}
                />

                <RHFAutocomplete
                  name="type_id"
                  autoHighlight
                  options={CONCLUSIONCONTRACT_TYPE_OPTION.map((option) => option)}
                  disabled={disabledInput.type_id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => {
                    setValue('type_id', newValue);
                    filterDetailContract(newValue);
                    clearErrors(['type_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.label}
                    </li>
                  )}
                  getOptionLabel={(option) => option.label || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.type_id)}
                      helperText={errors.type_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Loại hợp đồng*"
                    />
                  )}
                />
                <RHFAutocomplete
                  name="party_id"
                  autoHighlight
                  loading={PartyData?.isLoading}
                  options={PartyData?.parties.map((option) => option)}
                  disabled={disabledInput.party_id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterOptions={(options, { inputValue }) =>
                    options.filter(
                      (option) =>
                        option.code.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
                        option.name.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    )
                  }
                  onChange={(event, newValue) => {
                    setValue('party_id', newValue);
                    clearErrors(['party_id']);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.code} - {option.name}
                    </li>
                  )}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      error={Boolean(errors.party_id)}
                      helperText={errors.party_id?.message}
                      {...params}
                      fullWidth
                      size="small"
                      label="Chọn khách hàng*"
                    />
                  )}
                />
                <RHFTextField name="code" value={codeContract} label="Số hợp đồng" disabled size="small" fullWidth />
                <RHFTextField
                  onChange={(e) => {
                    const tagertValue = e.target.value ? formatPriceNumber(e.target.value) : 0;
                    setValue('amount', tagertValue);
                  }}
                  fullWidth
                  typeinput="price"
                  label="Tiền cọc*"
                  size="small"
                  name="amount"
                  disabled={disabledInput.amount}
                />
                <RHFTextField name="comment" label="Ghi chú" disabled={disabledInput.comment} size="small" fullWidth />
              </Box>
              <Box sx={{ pb: 3 }}>
                <Button
                  key="btn2"
                  variant="contained"
                  startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  onClick={handleOpenUploadFile}
                >
                  Tải lên file đính kèm : {totalFile}
                </Button>
                <FileNewContractDialog
                  isEdit={isEdit}
                  showFile={files}
                  open={openUploadFile}
                  onHadleUploadFile={(files) => handleUploadFile(files)}
                  onClose={handleCloseUploadFile}
                  refetchData={refetchData}
                  fileRemove={(files) =>
                    setFileRemoves((prevState) => {
                      const newState = [...prevState, files];
                      return newState;
                    })
                  }
                  folderId={id}
                />
              </Box>
              <Box>
                {showDetailsContract && (
                  <>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        pb: 3,
                      }}
                    >
                      <div>
                        <Typography variant="h6" gutterBottom>
                          Chi tiết sản phẩm
                        </Typography>
                      </div>
                      {!isConfirm && !isView && (
                        <>
                          <div>
                            <Button
                              sx={{ mr: 1 }}
                              onClick={addItem}
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="eva:plus-fill" />}
                            >
                              Thêm
                            </Button>
                          </div>
                        </>
                      )}
                    </Stack>
                    <ConclustionContractDetail
                      ref={tagertsDetailRef}
                      disabledInput={disabledInput}
                      goodData={goodData}
                      refetchData={refetchData}
                      isEdit={isEdit}
                      isConfirm={isConfirm}
                      isView={isView}
                      loadingDetail={loadingDetail}
                    />
                  </>
                )}
              </Box>
              <button hidden={1} ref={refSubmitButton} type={'submit'} />
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
