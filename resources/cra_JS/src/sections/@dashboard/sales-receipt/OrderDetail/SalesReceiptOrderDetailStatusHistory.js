import { useEffect, useState } from 'react';
// @mui
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import moment from 'moment';
import { STATUSES } from '../../../../utils/constant';

// ----------------------------------------------------------------------

export default function SalesReceiptOrderDetailStatusHistory({ history, isLoading }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(history);
  }, [isLoading]);

  return (
    <Stack spacing={3} alignItems={{ md: 'flex-start' }} direction={{ xs: 'column-reverse', md: 'row' }}>
      <Timeline
        sx={{
          p: 0,
          m: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {data.map((item, index) => {
          const firstTimeline = index === 0;

          const lastTimeline = index === data.length - 1;

          return (
            <TimelineItem key={`${index}_${item?.date}`}>
              <TimelineSeparator>
                <TimelineDot color={(lastTimeline && 'primary') || 'grey'} />
                {lastTimeline ? null : <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography variant="subtitle2">
                  {item?.order_status_id === STATUSES.created_sale_receipt && 'Đơn hàng đã được tạo'}
                  {item?.order_status_id === STATUSES.pending_sale_receipt && 'Đơn hàng đang chờ duyệt'}
                  {item?.order_status_id === STATUSES.reject_sale_receipt && 'Đơn hàng đã bị từ chối'}
                  {item?.order_status_id === STATUSES.confirm_sale_receipt && 'Đơn hàng đã được duyệt'}
                  {item?.order_status_id === STATUSES.paying_sale_receipt && 'Đơn hàng đã thanh toán một phần'}
                  {item?.order_status_id === STATUSES.success_payment && 'Đã thanh toán'}
                  {item?.order_status_id === STATUSES.exported && 'Đã xuất kho'}
                  {item?.order_status_id === STATUSES.success_sale_receipt && 'Hoàn thành'}
                  {item?.order_status_id === STATUSES.refund_sale_receipt && 'Trả hàng'}
                </Typography>

                <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                  {moment(item.date).format('DD-MM-YYYY')}
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Stack>
  );
}
