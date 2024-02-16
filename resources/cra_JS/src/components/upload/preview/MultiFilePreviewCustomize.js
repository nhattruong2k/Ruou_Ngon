import { useState } from 'react';
import PropTypes from 'prop-types';
import { m, AnimatePresence } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
//
import Iconify from '../../iconify';
import { varFade } from '../../animate';
import FileThumbnail, { fileData } from '../../file-thumbnail';
import axios from '../../../utils/axios';
import { FOLDER_IMAGE } from '../../../utils/constant';
import { useSnackbar } from '../../snackbar';

// ----------------------------------------------------------------------

MultiFilePreviewCustomize.propTypes = {
  sx: PropTypes.object,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  thumbnail: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default function MultiFilePreviewCustomize({ thumbnail, files, onRemove, sx, isEdit }) {
  const [loadingAttachment, setLoadingAttachment] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  if (!files?.length) {
    return null;
  }

  const downloadFile = (fileUrl) => {
    setLoadingAttachment(true);

    axios
      .get(`download-file/${fileUrl?.path}/${FOLDER_IMAGE.good_attachment}`, {
        method: 'GET',
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileUrl.name}`);
        document.body.appendChild(link);
        link.click();
        setLoadingAttachment(false);
      })
      .catch((error) => {
        setLoadingAttachment(false);
        enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
      });
  };

  return (
    <AnimatePresence initial={false}>
      {files.map((file) => {
        const { key, name = '', size = 0 } = fileData(file);

        const isNotFormatFile = typeof file === 'string';

        if (thumbnail) {
          return (
            <Stack
              key={key}
              component={m.div}
              {...varFade().inUp}
              alignItems="center"
              display="inline-flex"
              justifyContent="center"
              sx={{
                m: 0.5,
                width: 80,
                height: 80,
                borderRadius: 1.25,
                overflow: 'hidden',
                position: 'relative',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                ...sx,
              }}
            >
              <FileThumbnail
                tooltip
                imageView
                file={file}
                sx={{ position: 'absolute' }}
                imgSx={{ position: 'absolute' }}
              />

              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => onRemove(file)}
                  sx={{
                    top: 4,
                    right: 4,
                    p: '1px',
                    position: 'absolute',
                    color: (theme) => alpha(theme.palette.common.white, 0.72),
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                    },
                  }}
                >
                  <Iconify icon="eva:close-fill" width={16} />
                </IconButton>
              )}
            </Stack>
          );
        }

        return (
          <Stack
            key={key}
            component={m.div}
            {...varFade().inUp}
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{
              my: 1,
              px: 1,
              py: 0.75,
              borderRadius: 0.75,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
              ...sx,
            }}
          >
            <FileThumbnail file={file} />

            <Stack flexGrow={1} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {isNotFormatFile ? file : name}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {isNotFormatFile ? '' : fData(size)}
              </Typography>
            </Stack>

            {isEdit && !file.preview && (
              <Tooltip title={`Tải file đính kém`}>
                <IconButton
                  disabled={loadingAttachment}
                  color="primary"
                  onClick={() => {
                    downloadFile(file || '');
                  }}
                >
                  {loadingAttachment ? (
                    <CircularProgress style={{ color: 'red' }} size={20} />
                  ) : (
                    <Iconify icon="eva:download-outline" />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {onRemove && (
              <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            )}
          </Stack>
        );
      })}
    </AnimatePresence>
  );
}
