import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui
import {
  Box,
  Stack,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import { dispatch, useSelector } from '../../../redux/store';
import { getNotification } from '../../../redux/slices/notification';
import { FUNCTIONS, NOTIFICATION_STATUS } from '../../../utils/constant';
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useSnackbar } from '../../../components/snackbar';

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState(null);

  const { notifications, totalNoti, countNotiNotViewed, isLoading } = useSelector((state) => state.notification);

  const [page, setPage] = useState(1);

  const [data, setData] = useState([]);

  const [countNoti, setCountNoti] = useState(0);

  const [isUpdate, setIsUpdate] = useState(false);

  const [isRefresh, setIsRefresh] = useState(false);

  useEffect(() => {
    const body = {
      rows_per_page: 10,
      page,
    };
    dispatch(getNotification(body));
    setIsUpdate(true);
  }, []);

  useEffect(() => {
    if (!isLoading && notifications.length) {
      const newNoti = notifications.filter((notification) => notification.order || notification.party);
      if (isUpdate) {
        setIsUpdate(false);
        setData((prevData) => [...prevData, ...newNoti]);
        setCountNoti((prevData) => prevData + notifications.length);
      }
      if (isRefresh) {
        setIsRefresh(false);
        setData(newNoti);
        setCountNoti(notifications.length);
      }
    }
  }, [isLoading, isUpdate]);

  const handleRead = async (noti) => {
    setOpenPopover(null);
    setIsRefresh(true);

    switch (noti?.function_id) {
      case FUNCTIONS.sale_receipt:
        navigate(PATH_DASHBOARD.salesReceipt.edit(noti?.feature_id, 'view'));
        break;
      case FUNCTIONS.gift:
        navigate(PATH_DASHBOARD.orderGift.edit(noti?.feature_id, 'view'));
        break;
      case FUNCTIONS.party:
        navigate(PATH_DASHBOARD.parties.search(noti?.feature_id));
        break;
      case FUNCTIONS.refund:
        navigate(PATH_DASHBOARD.refundOrder.edit(noti?.feature_id));
        break;
      case FUNCTIONS.import_buy:
        navigate(PATH_DASHBOARD.importWarehouse.search(noti?.feature_id));
        break;
      case FUNCTIONS.import_orther:
        navigate(PATH_DASHBOARD.importWarehouse.search(noti?.feature_id));
        break;
      case FUNCTIONS.export_orther:
        navigate(PATH_DASHBOARD.exportWarehouse.search(noti?.feature_id));
        break;
      case FUNCTIONS.export_transfer:
        navigate(PATH_DASHBOARD.exportWarehouse.search(noti?.feature_id));
        break;

      default:
    }

    await handleViewedNoti();

    try {
      await axios.post('viewed-notification', { id: noti?.id, type: 'read' });
      await dispatch(getNotification({}));
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = async () => {
    setOpenPopover(null);

    await handleViewedNoti();
  };

  const handleViewedNoti = async () => {
    if (countNotiNotViewed) {
      try {
        await axios.post('viewed-notification', { type: 'viewed' });
        dispatch(getNotification({}));
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const getMore = () => {
    const nextPage = page + 1;
    const body = {
      rows_per_page: 10,
      page: nextPage,
    };

    dispatch(getNotification(body));
    setPage(nextPage);
    setIsUpdate(true);
  };

  return (
    <>
      <IconButtonAnimate
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={countNotiNotViewed} color="error">
          <Iconify icon="eva:bell-fill" />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 360, p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Thông báo</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {countNotiNotViewed
                ? `Bạn có ${countNotiNotViewed} thông báo chưa đọc`
                : `Bạn không có thông báo chưa đọc`}
            </Typography>
          </Box>
        </Box>

        <Scrollbar sx={{ maxHeight: 500 }}>
          <List disablePadding>
            {data.map((notification, index) => (
              <NotificationItem
                handleRead={(noti) => handleRead(noti)}
                key={`${notification?.id}_${index}`}
                notification={notification}
              />
            ))}
            <Divider sx={{ borderStyle: 'dashed' }} />

            {!isLoading && totalNoti > countNoti && (
              <Box sx={{ p: 1 }}>
                <Button fullWidth disableRipple onClick={getMore}>
                  Xem thêm
                </Button>
              </Box>
            )}

            {isLoading && (
              <div
                style={{
                  width: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '10px',
                }}
              >
                <CircularProgress
                  style={{
                    width: 30,
                    height: 30,
                  }}
                />
              </div>
            )}
          </List>
        </Scrollbar>
        <Box sx={{ p: '3px' }} />
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({ handleRead, notification }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      onClick={() => handleRead(notification)}
      sx={{
        py: 1.5,
        px: 2.5,
        m: '5px',
        mt: '1px',
        mb: '3px',
        ...(notification?.is_read === NOTIFICATION_STATUS.unread && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>

      <ListItemText
        disableTypography
        primary={title}
        secondary={
          <Stack direction="row" sx={{ mt: 0.5, typography: 'caption', color: 'text.disabled' }}>
            <Iconify icon="eva:clock-fill" width={16} sx={{ mr: 0.5 }} />
            <Typography variant="caption">{fToNow(notification?.created_at)}</Typography>
          </Stack>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {(notification?.function_id === FUNCTIONS.party && `Khách hàng #${notification?.party?.code} đã được tạo`) ||
        (notification?.function_id === FUNCTIONS.gift && `Đơn hàng tặng #${notification?.order?.code} đã được tạo`) ||
        (notification?.function_id === FUNCTIONS.sale_receipt &&
          `Đơn hàng bán #${notification?.order?.code} đã được tạo`) ||
        (notification?.function_id === FUNCTIONS.refund && `Đơn hàng trả #${notification?.order?.code} đã được tạo`) ||
        ((notification?.function_id === FUNCTIONS.import_buy ||
          notification?.function_id === FUNCTIONS.import_orther) &&
          `Đơn nhập hàng #${notification?.order?.code} đã được tạo`) ||
        ((notification?.function_id === FUNCTIONS.export_orther ||
          notification?.function_id === FUNCTIONS.export_transfer) &&
          `Đơn xuất hàng #${notification?.order?.code} đã được tạo`)}
    </Typography>
  );

  if (notification?.function_id === FUNCTIONS.sale_receipt) {
    return {
      avatar: <img alt={title} src="/assets/icons/notification/ic_package.svg" />,
      title,
    };
  }
  if (notification?.function_id === FUNCTIONS.gift) {
    return {
      avatar: <img style={{ width: 30 }} alt={title} src="/assets/icons/notification/ic_gift.svg" />,
      title,
    };
  }
  if (notification?.function_id === FUNCTIONS.party) {
    return {
      avatar: <img style={{ width: 30 }} alt={title} src="/assets/icons/notification/ic_party.svg" />,
      title,
    };
  }
  if (notification?.function_id === FUNCTIONS.refund) {
    return {
      avatar: <img style={{ width: 30 }} alt={title} src="/assets/icons/notification/icon_refund.svg" />,
      title,
    };
  }
  if (notification?.function_id === FUNCTIONS.import_buy || notification?.function_id === FUNCTIONS.import_orther) {
    return {
      avatar: <img style={{ width: 30 }} alt={title} src="/assets/icons/notification/ic_import.svg" />,
      title,
    };
  }
  if (
    notification?.function_id === FUNCTIONS.export_orther ||
    notification?.function_id === FUNCTIONS.export_transfer
  ) {
    return {
      avatar: <img style={{ width: 30 }} alt={title} src="/assets/icons/notification/ic_export.svg" />,
      title,
    };
  }
  return {
    avatar: <img alt={title} src="/assets/icons/notification/ic_package.svg" />,
    title,
  };
}
