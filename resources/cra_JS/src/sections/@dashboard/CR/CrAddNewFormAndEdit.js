import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../../pages/style/style.css';

import {
  Box,
  Paper,
  Tab,
  Card,
  Grid,
  Stack,
  TextField,
  Divider,
  TableContainer,
  Autocomplete,
  Typography,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment/moment';
import Scrollbar from '../../../components/scrollbar';
// components
import { useDispatch, useSelector } from '../../../redux/store';
import { useSnackbar } from '../../../components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';
import ButtonRenderer from '../../../pages/renderers/ButtonRenderer';
import CrAutocompleteEditor from '../../../pages/cell-editor/CrAutocompleteEditor';
import CrSbrToolbar from './CrSbrToolbar';
import axios from '../../../utils/axios';
import { getCrCategories } from '../../../redux/slices/crCategory';

CrAddNewFormAndEdit.propTypes = {
  isEdit: PropTypes.bool,
  currentContact: PropTypes.any,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function CrAddNewFormAndEdit({
  isEdit = false,
  currentContact,
  employees,
  title,
  tabValue,
  onClose,
}) {
  const gridCallHistoryRef = useRef(null);

  const refSubmitButtom = useRef();

  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const [closeComplaintDate, setCloseComplaintDate] = useState(moment().format());

  const [timeSentSms, setTimeSentSms] = useState(moment().format('MM DD YYYY HH:MM'));

  const [contentSms, setContentSms] = useState('');

  const [smsHistories, setSmsHistories] = useState([]);

  const [complaintType, setComplaintType] = useState([]);

  const [employeeComplaint, setEmployeeComplaint] = useState('');

  const [suggestionTypeValue, setSuggestionTypeValue] = useState([]);

  const [contentSuggestion, setContentSuggestion] = useState('');

  const [callHistories, setCallHistories] = useState([]);

  const [valueTab, setValueTab] = useState('1');

  const surveyQuestions = useSelector((state) => state.crCategory.surveyQuestions);

  const complaintTypes = useSelector((state) => state.crCategory.complaintTypes);

  const suggestionTypes = useSelector((state) => state.crCategory.suggestionTypes);

  const contactTypes = useSelector((state) => state.crCategory.contactTypes);

  const contactStatusTypes = useSelector((state) => state.crCategory.contactStatusTypes);

  const historyCallColumnDefs = [
    {
      headerName: 'Người gọi',
      field: 'call_user',
      cellStyle: { textAlign: 'left' },
      editable: false,
      minWidth: 170,
    },
    {
      headerName: 'Loại cuộc gọi',
      field: 'name',
      cellEditor: CrAutocompleteEditor,
      cellEditorParams: {
        options: contactTypes,
      },
      minWidth: 180,
      filter: 'agTextColumnFilter',
      editable: true,
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Thời gian bắt đầu',
      field: 'start_time_datetime',
      minWidth: 230,
      filter: 'agTextColumnFilter',
      editable: false,
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Thời lượng',
      field: 'answer_duration',
      minWidth: 135,
      filter: 'agTextColumnFilter',
      editable: false,
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Ghi âm',
      field: 'recording',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: ButtonRenderer,
      editable: false,
      cellStyle: {
        cursor: 'pointer',
        textAlign: 'left',
      },
    },
    {
      headerName: 'Nội dung cuộc gọi',
      field: 'content_call',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Tình trạng',
      field: 'status',
      minWidth: 180,
      // cellEditor: CrAutocompleteEditor,
      // cellEditorParams: {
      //   options: contactStatusTypes,
      // },
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
      editable: true,
    },
  ];

  const smsColumnDefs = [
    {
      headerName: 'Người nhắn',
      field: 'user_sent',
      cellStyle: { textAlign: 'left' },
      editable: false,
      minWidth: 170,
    },
    {
      headerName: 'Thời gian nhắn',
      field: 'time_send',
      minWidth: 230,
      filter: 'agTextColumnFilter',
      editable: false,
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Nội dung',
      field: 'content',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Tình trạng',
      field: 'status',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
      editable: true,
      resizable: false,
    },
  ];

  const questionColumnDefs = [
    {
      headerName: 'STT',
      field: 'id',
      cellStyle: { textAlign: 'right' },
      minWidth: 80,
      maxWidth: 80,
      editable: false,
    },
    {
      headerName: 'Câu hỏi',
      field: 'name',
      minWidth: 550,
      filter: 'agTextColumnFilter',
      editable: false,
      cellStyle: {
        cursor: 'pointer',
      },
    },
    {
      headerName: 'Số điểm',
      field: 'point',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellStyle: {
        cursor: 'pointer',
      },
      resizable: false,
    },
  ];

  const columnDefs = historyCallColumnDefs;

  const NewPriceSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const [defaultColDef, setDefaultColDef] = useState({
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    floatingFilter: false,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  });

  const defaultValues = useMemo(
    () => ({
      name: currentContact?.party?.name || '',
      customer_type_name: currentContact?.party?.party_type_id === 1 ? 'Khách Lẻ' : '',
      phone_1: currentContact?.party?.phone1 || currentContact?.party?.phone2,
      sex: currentContact?.party?.sex === 1 ? 'Nam' : 'Nữ',
      date_of_birth: currentContact?.party?.date_of_birth || '',
      identification_number: currentContact?.party?.identification_number || '',
      address: currentContact?.party?.address,
      internal_org_name: currentContact?.internal_org_name || '',
      date: currentContact?.date || '',
      vehicle_name: currentContact?.vehicle_name || '',
      vehicle_category_name: currentContact?.vehicle_category_name || '',
      engine_number: currentContact?.engine_number || '',
      frame_number: currentContact?.frame_number || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentContact]
  );

  const methods = useForm({
    resolver: yupResolver(NewPriceSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentContact) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(currentContact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentContact]);

  useEffect(() => {
    dispatch(getCrCategories())
    getHistoryCall();
    getHistorySms();
  }, []);

  const onSave = () => {
    refSubmitButtom?.current?.click();
  };

  const onStarEdittCell = (field = 'code') => {
    const lastRowIndex = gridCallHistoryRef.current.api.getLastDisplayedRow();
    gridCallHistoryRef.current.api.setFocusedCell(lastRowIndex, field);
    gridCallHistoryRef.current.api.startEditingCell(lastRowIndex, field);
  };

  const getRowData = useCallback(() => {
    const rowData = [];
    gridCallHistoryRef.current.api.forEachNode((node) => {
      rowData.push(node.data);
    });
    return rowData;
  }, []);

  const onSubmit = async (formData) => {
    const rowData = getRowData();
    const newFormData = rowData.map((item) => {
      const contactStatusId = contactStatusTypes.find(
        ({ name }) => name.toLowerCase() === item.status.toLowerCase()
      ).id;
      const contactTypeId = contactTypes.find(({ name }) => name.toLowerCase() === item.call_type.toLowerCase()).id;
      return {
        ...item,
        contact_status_type_id: contactStatusId,
        contact_type_id: contactTypeId,
        datetime_started: item.start_time_datetime,
        order_id: currentContact.id,
        complaint_employee_id: 2,
        customer_id: currentContact?.party?.id,
      };
    });
    newFormData.issueComplaint = complaintType;
    newFormData.employeeComplaint = employeeComplaint;
    console.log('row Data: ', newFormData);
    try {
      const newFormData = {
        contact_status_type_id: '',
      };
      const response = await axios.post('contacts', formData);
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const onSendSms = async () => {
    try {
      if (!contentSms.length) {
        enqueueSnackbar('Vui lòng nhập nội dung tin nhắn!', { variant: 'error' });
        return;
      }

      const params = {
        time_send: moment(timeSentSms).format('YYYY-MM-DD HH:00'),
        content: contentSms,
        customer_id: currentContact.party.id,
        sms_type_id: null,
      };
      const response = await axios.post('sms', params);

      if (response?.data?.status) {
        enqueueSnackbar('Create success!');
        getHistorySms();
      }
      console.log('res ', response.data.status);
    } catch (error) {
      console.log('error ', error);
    }
  };

  const getHistoryCall = async function () {
    const response = await axios.get('history-call', {
      params: {
        customer_id: currentContact?.party?.id,
      },
    });

    const callHistories = response.data.data;

    const newHistories = callHistories.map((item) => {
      const callData = JSON.parse(item.call_data);
      return {
        start_time_datetime: callData?.start_time_datetime || '',
        answer_duration: callData?.answer_duration || '',
        stop_time_datetime: callData?.stop_time_datetime || '',
        call_user: item?.user?.name || '',
      };
    });
    setCallHistories(newHistories);
    console.log('response', response.data.data);
  };

  const getHistorySms = async function () {
    try {
      const response = await axios.get('sms');
      const smsHistories = response?.data?.data?.smsHistories || [];
      const newList = smsHistories.map((item) => {
        return {
          user_sent: item?.user?.name || '',
          time_send: item?.time_send || '',
          status: item.status === 0 ? 'Created' : item.status === 1 ? 'Sent' : 'Sent Fail',
          content: item?.content || '',
        };
      });
      setSmsHistories(newList);
    } catch (error) {
      console.log('error ', error);
    }
  };

  return (
    <>
      <CrSbrToolbar
        onSave={onSave}
        title={title}
        valueTab={valueTab}
        currentContact={currentContact}
        isEdit={isEdit}
        onSendSms={onSendSms}
        onCallFinish={() => {
          getHistoryCall();
        }}
        onCloseDetails={() => {
          onClose();
        }}
      />
      <Divider />
      <Scrollbar>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={0}>
            <Grid item xs={12} md={12}>
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                  <TabContext value={valueTab}>
                    <Box sx={{ borderBottom: 1, pl: 2, borderColor: 'divider' }}>
                      <TabList
                        onChange={(event, newValue) => {
                          setValueTab(newValue);
                        }}
                        aria-label="lab API tabs example"
                      >
                        <Tab label="Cuộc gọi" value="1" sx={{ fontSize: 16 }} />
                        <Tab label="Tin nhắn" value="2" sx={{ fontSize: 16 }} />
                        <Tab label="Thông tin" value="3" sx={{ fontSize: 16 }} />
                      </TabList>
                    </Box>
                    <TabPanel value="1" sx={{ pt: 2, pl: 0, pr: 0 }}>
                      <Scrollbar>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack
                            sx={{ pb: 2 }}
                            spacing={1}
                            direction="column"
                            justifyContent="start"
                            alignItems="start"
                          >
                            <Typography variant="subtitle1"> Lịch sử cuộc gọi </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0, pb: 1 }}>
                            <div className="ag-theme-alpine" style={{ height: 350, width: '100%' }}>
                              <AgGridReact
                                headerHeight={'46'}
                                animateRows={'true'}
                                ref={gridCallHistoryRef}
                                pagination={'false'}
                                stopEditingWhenCellsLoseFocus={'true'}
                                singleClickEdit={'true'}
                                defaultColDef={defaultColDef}
                                rowData={callHistories}
                                columnDefs={columnDefs}
                              >
                                <></>
                              </AgGridReact>
                            </div>
                          </Box>
                        </Card>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack
                            sx={{ pb: 2 }}
                            spacing={1}
                            direction="column"
                            justifyContent="start"
                            alignItems="start"
                          >
                            <Typography variant="subtitle1"> Câu hỏi khảo sát </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0, pb: 1 }}>
                            <div className="ag-theme-alpine" style={{ height: 467, width: '100%' }}>
                              <AgGridReact
                                headerHeight={'46'}
                                animateRows={'true'}
                                // ref={gridRef}
                                pagination={'false'}
                                stopEditingWhenCellsLoseFocus={'true'}
                                singleClickEdit={'true'}
                                defaultColDef={defaultColDef}
                                rowData={surveyQuestions}
                                columnDefs={questionColumnDefs}
                              >
                                <></>
                              </AgGridReact>
                            </div>
                          </Box>
                        </Card>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack spacing={1} direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Góp ý </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ borderRadius: 0 }}>
                              <Autocomplete
                                name="suggestion"
                                multiple
                                options={suggestionTypes}
                                size="small"
                                value={suggestionTypeValue}
                                onChange={(event, newValue) => {
                                  setSuggestionTypeValue(newValue);
                                }}
                                getOptionLabel={(option) => option.name || ''}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props} key={option.id}>
                                    <Checkbox
                                      icon={icon}
                                      checkedIcon={checkedIcon}
                                      style={{ marginRight: 8 }}
                                      checked={selected}
                                    />
                                    {option.name}
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField {...params} size="small" sx={{ pb: 2, mt: 1 }} label="Vấn đề góp ý*" />
                                )}
                              />
                              <RHFTextField
                                name="content_suggestion"
                                onChange={(event) => {
                                  setContentSuggestion(event.target.value);
                                }}
                                label="Nội dụng*"
                                fullWidth
                                multiline
                                rows={3}
                              />
                            </Box>
                          </Box>
                        </Card>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack spacing={1} direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Khiếu nại </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ mt: 2, borderRadius: 0 }}>
                              <Box
                                rowGap={3}
                                sx={{ pb: 1, mt: 1 }}
                                columnGap={2}
                                display="grid"
                                gridTemplateColumns={{
                                  xs: 'repeat(1, 1fr)',
                                  sm: 'repeat(3, 1fr)',
                                }}
                              >
                                <RHFAutocomplete
                                  name="issue_complaint"
                                  multiple
                                  limitTags={1}
                                  options={complaintTypes}
                                  size="small"
                                  value={complaintType}
                                  isOptionEqualToValue={(option, value) => option.id === value.id}
                                  getOptionLabel={(option) => option.name || ''}
                                  renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option.id}>
                                      <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                      />
                                      {option.name}
                                    </li>
                                  )}
                                  onChange={(event, newValue) => {
                                    setComplaintType(newValue);
                                  }}
                                  renderInput={(params) => (
                                    <TextField {...params} size="small" sx={{ pb: 1 }} label="Vấn đề khiếu nại*" />
                                  )}
                                />
                                <RHFAutocomplete
                                  name="employee"
                                  options={employees}
                                  size="small"
                                  value={employeeComplaint}
                                  isOptionEqualToValue={(option, value) => option.id === value.id}
                                  getOptionLabel={(option) => option.name || ''}
                                  renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option.id}>
                                      <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                      />
                                      {option.name}
                                    </li>
                                  )}
                                  onChange={(event, newValue) => {
                                    setEmployeeComplaint(newValue);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      size="small"
                                      sx={{ pb: 1 }}
                                      label="Nhân viên bị khiếu nại*"
                                    />
                                  )}
                                />
                                <DatePicker
                                  label="Ngày đóng khiếu nại"
                                  value={closeComplaintDate}
                                  onChange={(newValue) => {
                                    setCloseComplaintDate(newValue);
                                  }}
                                  renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                                />
                              </Box>
                              <RHFTextField
                                name="content_complaint"
                                sx={{ pb: 2 }}
                                label="Nội dụng*"
                                onChange={(event) => {
                                  setValue('content_complaint', event.target.value);
                                }}
                                fullWidth
                                multiline
                                rows={3}
                              />
                              <RHFTextField
                                name="reason_complaint"
                                sx={{ pb: 2 }}
                                label="Nguyên nhân*"
                                fullWidth
                                multiline
                                rows={3}
                              />
                              <RHFTextField
                                name="solution_complaint"
                                sx={{ pb: 1 }}
                                label="Giải pháp*"
                                fullWidth
                                multiline
                                rows={3}
                              />
                            </Box>
                          </Box>
                        </Card>
                      </Scrollbar>
                    </TabPanel>
                    <TabPanel value="2" sx={{ pt: 2, pl: 0, pr: 0 }}>
                      <Scrollbar>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack spacing={1} direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Soạn tin nhắn </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ mt: 2, borderRadius: 0 }}>
                              <Box
                                rowGap={3}
                                sx={{ pb: 3, mt: 1 }}
                                columnGap={2}
                                display="grid"
                                gridTemplateColumns={{
                                  xs: 'repeat(1, 1fr)',
                                  sm: 'repeat(2, 1fr)',
                                }}
                              >
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                  <DateTimePicker
                                    label="Chọn ngày gửi"
                                    value={timeSentSms}
                                    ampm={false}
                                    onChange={(newValue) => {
                                      setTimeSentSms(newValue);
                                    }}
                                    renderInput={(params) => <TextField size="small" {...params} fullWidth />}
                                  />
                                </LocalizationProvider>
                              </Box>
                              <RHFTextField
                                name="content"
                                sx={{ pb: 2 }}
                                value={contentSms}
                                onChange={(event) => {
                                  setContentSms(event.target.value);
                                }}
                                label="Nội dụng*"
                                fullWidth
                                multiline
                                rows={3}
                              />
                            </Box>
                          </Box>
                        </Card>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack
                            sx={{ pb: 2 }}
                            spacing={1}
                            direction="column"
                            justifyContent="start"
                            alignItems="start"
                          >
                            <Typography variant="subtitle1"> Lịch sử tin nhắn </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0, pb: 1 }}>
                            <div className="ag-theme-alpine" style={{ height: 350, width: '100%' }}>
                              <AgGridReact
                                headerHeight={'46'}
                                rowSelection={'multiple'}
                                animateRows={'true'}
                                // ref={gridRef}
                                // editType="fullRow"
                                pagination={'false'}
                                stopEditingWhenCellsLoseFocus={'true'}
                                singleClickEdit={'true'}
                                defaultColDef={defaultColDef}
                                rowData={smsHistories}
                                columnDefs={smsColumnDefs}
                              >
                                <></>
                              </AgGridReact>
                            </div>
                          </Box>
                        </Card>
                      </Scrollbar>
                    </TabPanel>
                    <TabPanel value="3" sx={{ pt: 2, pl: 0, pr: 0 }}>
                      <Scrollbar>
                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Thông tin khách hàng </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ mt: 2, borderRadius: 0 }}>
                              <Box
                                rowGap={3}
                                sx={{ pb: 3, mt: 1 }}
                                columnGap={2}
                                display="grid"
                                gridTemplateColumns={{
                                  xs: 'repeat(1, 1fr)',
                                  sm: 'repeat(3, 1fr)',
                                }}
                              >
                                <RHFTextField disabled name="name" size="small" label="Tên khách hàng" />
                                <RHFTextField disabled name="customer_type_name" size="small" label="Nhóm khách hàng" />
                                <RHFTextField disabled name="phone_1" size="small" label="Số điện thoại 1" />

                                <RHFTextField disabled name="sex" size="small" label="Giới tính" />
                                <RHFTextField disabled name="date_of_birth" size="small" label="Ngày sinh" />
                                {tabValue === 'service' && (
                                  <RHFTextField disabled name="phone_1" size="small" label="Số điện thoại 2" />
                                )}
                                {tabValue === 'sale' && (
                                  <RHFTextField
                                    disabled
                                    name="identification_number"
                                    size="small"
                                    label="Số căn cước"
                                  />
                                )}
                              </Box>
                              <Box sx={{ pb: 1 }}>
                                <RHFTextField disabled name="address" label="Địa chỉ" fullWidth multiline rows={3} />
                              </Box>
                            </Box>
                          </Box>
                        </Card>

                        <Card sx={{ borderRadius: 1.5, mb: 3, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Thông tin phiếu </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ mt: 2, borderRadius: 0 }}>
                              <Box
                                rowGap={3}
                                sx={{ pb: 1, mt: 1 }}
                                columnGap={2}
                                display="grid"
                                gridTemplateColumns={{
                                  xs: 'repeat(1, 1fr)',
                                  sm: 'repeat(3, 1fr)',
                                }}
                              >
                                <RHFTextField disabled name="internal_org_name" size="small" label="Cửa hàng" />
                                <RHFTextField disabled name="date" size="small" label="Ngày mua" />
                                <RHFTextField disabled name="employee_name" size="small" label="Nhân viên tư vấn" />
                              </Box>
                            </Box>
                          </Box>
                        </Card>

                        <Card sx={{ borderRadius: 1.5, mb: 2, mt: 2, ml: 2, mr: 2, p: 2 }}>
                          <Stack direction="column" justifyContent="start" alignItems="start">
                            <Typography variant="subtitle1"> Thông tin Xe </Typography>
                          </Stack>
                          <Box sx={{ borderRadius: 0 }}>
                            <Box sx={{ mt: 2, borderRadius: 0 }}>
                              <Box
                                rowGap={3}
                                columnGap={2}
                                sx={{ pb: 1, mt: 1 }}
                                display="grid"
                                gridTemplateColumns={{
                                  xs: 'repeat(1, 1fr)',
                                  sm: 'repeat(3, 1fr)',
                                }}
                              >
                                <RHFTextField disabled name="vehicle_name" size="small" label="Tên xe" />
                                <RHFTextField disabled name="vehicle_category_name" size="small" label="Loại xe" />
                                <RHFTextField disabled name="frame_number" size="small" label="Số khung" />
                                <RHFTextField disabled name="engine_number" size="small" label="Số máy" />
                                <RHFTextField disabled name="engine_number" size="small" label="Ngày chứng nhận bh" />
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </Scrollbar>
                    </TabPanel>
                  </TabContext>
                </Box>
              </TableContainer>
              <button hidden={1} ref={refSubmitButtom} type={'submit'} />
            </Grid>
          </Grid>
        </FormProvider>
      </Scrollbar>
    </>
  );
}
