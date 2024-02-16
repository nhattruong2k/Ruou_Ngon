// @mui
import { TableRow, TableCell, Skeleton, Stack } from '@mui/material';

// ----------------------------------------------------------------------

export default function TableSkeleton({ ...other }) {
  return (
    <Stack spacing={3} sx={{ padding: 3 }} alignItems="center">
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, flexShrink: 0 }} />
    </Stack>
  );
}
