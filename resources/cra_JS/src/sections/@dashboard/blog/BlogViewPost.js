import PropTypes from 'prop-types';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Avatar, SpeedDial, Typography, SpeedDialAction } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// utils
import { fDate } from '../../../utils/formatTime';
// _mock
import { _socials } from '../../../_mock/arrays';
// components

const StyledTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h4,
  zIndex: 10,
  width: '100%',
  color: theme.palette.common.black,
}));

const StyledFooter = styled('div')(({ theme }) => ({
  bottom: 0,
  zIndex: 10,
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  paddingRight: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  justifyContent: 'space-between',
}));

// ----------------------------------------------------------------------

BlogViewPost.propTypes = {
  post: PropTypes.object,
};

export default function BlogViewPost({ post }) {
  const { attachments, title, author, createdAt } = post;

  const isDesktop = useResponsive('up', 'sm');

  const isMobile = useResponsive('down', 'sm');

  const imageUrl = 'https://file.hstatic.net/1000180378/file/untitled_design__53__c8c474ffe2e845fabf6ac897ff535a86_grande.png';

  return (
    <Box>
      {isDesktop && (
        <>
          <StyledTitle style={{paddingLeft : '40px'}}>{title}</StyledTitle>

          <StyledFooter style={{paddingLeft : '40px'}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'common.black' }}>
                  {post.user.name}
                </Typography>

                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  {fDate(post.created_at)}
                </Typography>
              </Box>
            </Box>
          </StyledFooter>
        </>
      )}
      {isMobile && (
        <>
          <StyledTitle sx={{paddingLeft : '8px'}}>{title}</StyledTitle>

          <StyledFooter sx={{paddingLeft : '8px'}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'common.black' }}>
                  {post.user.name}
                </Typography>

                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  {fDate(post.created_at)}
                </Typography>
              </Box>
            </Box>
          </StyledFooter>
        </>
      )}
    </Box>
  );
}
