import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import { HOST_ASSETS_URL } from '../../../config';
import { FOLDER_IMAGE } from '../../../utils/constant';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user } = useAuthContext();
  const roles = user?.roles || [];
  let nameRole = '';
  if (roles.length > 0) {
    nameRole = roles.map(({ name }) => name).join(', ');
  }
  return (
    <Link to={PATH_DASHBOARD.general.app} component={RouterLink} underline="none" color="inherit">
      <StyledRoot>
        {
          (user?.photo || '') ?
            (<CustomAvatar src={`${HOST_ASSETS_URL}storage/${FOLDER_IMAGE.user}/${user?.photo}`} alt={user?.name} name={user?.name} />)
            :
            (<CustomAvatar src={'https://www.dropbox.com/s/iv3vsr5k6ib2pqx/avatar_default.jpg?dl=1'} alt={user?.name} name={user?.name} />)
        }

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize' }}>
            {user?.name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
            {nameRole}
          </Typography>
        </Box>
      </StyledRoot>
    </Link>
  );
}
