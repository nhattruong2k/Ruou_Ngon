import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Card, Rating, CardHeader, Typography, Stack, Link, Skeleton } from '@mui/material';

// utils
import { PATH_DASHBOARD } from '../../../routes/paths';
import { fDate } from '../../../utils/formatTime';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';

// ----------------------------------------------------------------------

BlogTopRelated.propTypes = {
  list: PropTypes.array,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function BlogTopRelated({ title, subheader, list, isLoading, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {(isLoading ? [...Array(5)] : list)
            .map((post, index) => post ? (
              <ApplicationItem key={post.id} app={post} />
            ) : (
              <Skeleton key={index} sx={{ height: 55 }} />
            )
            )}
          {/* {list.map((app) => (
            <ApplicationItem key={app.id} app={app} />
          ))} */}
        </Stack>
      </Scrollbar>
    </Card>
  );
}


function ApplicationItem({ app }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ flexGrow: 1, minWidth: 160 }}>
        <Link
          color="inherit"
          to={PATH_DASHBOARD.blog.view(app.id)}
          component={RouterLink}
        >
          <Typography variant="subtitle2">{app?.title || ''}</Typography>
        </Link>

        {
          app?.attachments && JSON.parse(app?.attachments).length > 0 &&
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
            <Iconify icon="tdesign:attach" width={16} sx={{ mr: 0.5 }} />
            <Typography variant="caption" sx={{ ml: 0.5, mr: 1 }}>
              File đính kèm
            </Typography>
          </Stack>
        }
      </Box>

      <Stack alignItems="flex-end">
        <Label variant="soft" color={'default'} sx={{ backgroundColor: 'white', p: 0 }}>
          {fDate(app?.created_at || '')}
        </Label>
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {app?.user?.name || ''}
        </Typography>
      </Stack>
    </Stack>
  );
}
