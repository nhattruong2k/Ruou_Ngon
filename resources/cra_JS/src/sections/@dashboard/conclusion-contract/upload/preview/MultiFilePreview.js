import { useState } from 'react';
import PropTypes from 'prop-types';
import { m, AnimatePresence } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { IconButton, Stack, Typography, Tooltip, CircularProgress } from '@mui/material';
import { useSnackbar } from '../../../../../components/snackbar';
// utils
import { fData } from '../../../../../utils/formatNumber';

import Iconify from '../../../../../components/iconify';

import { varFade } from '../../../../../components/animate/variants';
import FileThumbnail, { fileData } from '../../../../../components/file-thumbnail';

import DowloadFilePreview from './DowloadFilePreview';

// ----------------------------------------------------------------------

MultiFilePreview.propTypes = {
  sx: PropTypes.object,
  files: PropTypes.array,
  onRemove: PropTypes.func,
  thumbnail: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default function MultiFilePreview({ thumbnail, files, isEdit, onRemove, sx }) {
  const { enqueueSnackbar } = useSnackbar();

  const [loadingAttachment, setLoadingAttachment] = useState(false);

  if (!files?.length) {
    return null;
  }

  return (
    <AnimatePresence initial={false}>
      {files.map((file, index) => {

        const { key, name = '', size = 0 } = fileData(file);

        const isNotFormatFile = typeof file === 'string';


        if (thumbnail) {
          return (
            <Stack
              key={index}
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
            key={index}
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

            {!file.preview && (
              <DowloadFilePreview file={file} loadingAttachment={loadingAttachment} />
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
