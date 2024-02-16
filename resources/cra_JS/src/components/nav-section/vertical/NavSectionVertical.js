import PropTypes from 'prop-types';
import React, { useLayoutEffect, useState } from 'react';

// @mui
import { List, Stack } from '@mui/material';
// locales
import { useTheme } from '@mui/material/styles';
import { useLocales } from '../../../locales';
//
import { StyledSubheader } from './styles';
import NavList from './NavList';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

NavSectionVertical.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.array,
};

export default function NavSectionVertical({ data, sx, ...other }) {
  const { user } = useAuthContext();


  const theme = useTheme();
  const PRIMARY_MAIN = theme.palette.primary.main;

  const { translate } = useLocales();

  const [userPermissions, setUserPermissions] = useState([]);

  useLayoutEffect(() => {
    setUserPermissions(
      user?.roles?.map(({ name }) => {
        return name;
      })
    );
  }, [user]);

  const isAllowed = (requiredPermissions) => {
    if (requiredPermissions !== undefined && userPermissions !== undefined) {
      return userPermissions.some((permission) => requiredPermissions.includes(permission));
    }
    return true;
  };

  return (
    <Stack sx={sx} {...other}>
      {data.map((group) => {
        const key = group.subheader || group.items[0].title;

        return (
          <List key={key} disablePadding sx={{ px: 2 }}>
            {isAllowed(group.permissions) && group.subheader && (
              <StyledSubheader sx={{ color: PRIMARY_MAIN }} disableSticky>{translate(group.subheader)}</StyledSubheader>
            )}

            {group.items.map(
              (list) =>
                isAllowed(list.permissions) && (
                  <NavList key={list.title + list.path} data={list} depth={1} hasChild={!!list.children} checkIsAllowed={isAllowed} />
                )
            )}
          </List>
        );
      })}
    </Stack>
  );
}
