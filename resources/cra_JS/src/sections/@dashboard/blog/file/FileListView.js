import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Box, Stack, Typography, IconButton, CircularProgress } from '@mui/material';

import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ClearIcon from '@mui/icons-material/Clear';
// utils
import axios from '../../../../utils/axios';
// hooks
import useResponsive from '../../../../hooks/useResponsive';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// utils
import { fData } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import MenuPopover from '../../../../components/menu-popover';
import FileThumbnail from '../../../../components/file-thumbnail';
import { FOLDER_IMAGE } from '../../../../utils/constant';
import ConfirmDialog from '../../../../components/confirm-dialog';

//
import { FileShareDialog, FileDetailsDrawer } from '../../file';

// ----------------------------------------------------------------------

FileListView.propTypes = {
  sx: PropTypes.object,
  file: PropTypes.object,
  post: PropTypes.object,
};

export default function FileListView({ file, post, refetchData, sx, ...other }) {

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { copy } = useCopyToClipboard();

  const isDesktop = useResponsive('up', 'sm');

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleDownload = () => {
    if (file.type === 'folder') {
      enqueueSnackbar('Chỉ có thể tải file không thể tải folder ', { variant: 'error' });
    } else {
      setLoadingBtnSave(true);
      const fileUrl = file.path;
      axios
        .get(`download-file/${fileUrl}/${FOLDER_IMAGE.blog_attachment}`, {
          method: 'GET',
          responseType: 'blob',
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${fileUrl}`);
          document.body.appendChild(link);
          link.click();
          setLoadingBtnSave(false);
        })
        .catch((error) => {
          setLoadingBtnSave(false);
          enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
        });
    }
  };


  return (
    <>
      <Stack
        spacing={2}
        direction={isDesktop ? 'row' : 'column'}
        alignItems={isDesktop ? 'center' : 'flex-start'}
        sx={{
          mb: 3,
          mr: 3,
          p: 2.5,
          borderRadius: 2,
          position: 'relative',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...(isDesktop && {
            p: 1.5,
            borderRadius: 1.5,
          }),
          ...sx,
        }}
        {...other}
      >

        <FileThumbnail file={file.type} />
        <Stack
          sx={{
            width: 1,
            flexGrow: { sm: 1 },
            minWidth: { sm: '1px' },
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {file.name}
          </Typography>
        </Stack>

        <Box
          sx={{
            top: 8,
            right: 8,
            flexShrink: 0,
            position: 'absolute',
            ...(isDesktop && {
              position: 'unset',
            }),
          }}
        >
          <IconButton
            sx={{ maxWidth: { md: 120 } }}
            size="small"
            color="info"
            disabled={loadingBtnSave}
            onClick={() => {
              handleDownload();
            }}
          >
            {loadingBtnSave ? (
              <CircularProgress style={{ color: 'blue' }} size={20} />
            ) : (
              <Iconify icon="eva:download-outline" />
            )}
          </IconButton>
        </Box>

      </Stack>

    </>
  );
}
