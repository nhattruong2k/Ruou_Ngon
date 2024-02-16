import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Divider,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  AvatarGroup,
  CircularProgress,
} from '@mui/material';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { useSnackbar } from '../../../../components/snackbar';
import ConfirmDialog from '../../../../components/confirm-dialog';
import FileThumbnail from '../../../../components/file-thumbnail';
//
import FileShareDialog from '../portal/FileShareDialog';
import axios from '../../../../utils/axios';
import { FOLDER_IMAGE } from '../../../../utils/constant';

// ----------------------------------------------------------------------

FileTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
};

export default function FileTableRow({ row, selected, onSelectRow, setViewFolder, refetchData }) {
  const { name, type, createdAt, user } = row;

  const { enqueueSnackbar } = useSnackbar();

  const { copy } = useCopyToClipboard();

  const [inviteEmail, setInviteEmail] = useState('');

  const [openShare, setOpenShare] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const [favorited, setFavorited] = useState('');

  const [openPopover, setOpenPopover] = useState(null);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  const handleFavorite = () => {
    setFavorited(!favorited);
  };

  const handleOpenDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

  const handleClick = useDoubleClick({
    click: () => {
      // handleOpenDetails();
    },
    doubleClick: () => {
      if (row.type === 'folder') {
        setViewFolder(row);
      }
    },
  });

  const handleDownload = () => {
    if (row.type === 'folder') {
      enqueueSnackbar('Chỉ có thể tải file không thể tải folder ', { variant: 'error' });
    } else {
      const fileUrl = row.path;
      axios
        .get(`download-file/${fileUrl}/${FOLDER_IMAGE.file_managements}`, {
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
        })
        .catch((error) => {
          enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
        });
    }
  };

  const onSave = async () => {
    const $notify = 'Vui lòng nhập tên';
    let isValid = false;
    isValid = inviteEmail !== '';

    if (isValid) {
      setLoadingBtnSave(true);
      try {
        const newFormData = {
          name: inviteEmail,
        };

        const response = await axios.put(`file-managements/${row.id}`, newFormData);

        handleCloseShare();
        setLoadingBtnSave(false);
        enqueueSnackbar('Cập nhật thành công');

        if (response) {
          refetchData();
        }
      } catch (error) {
        setLoadingBtnSave(false);
        handleCloseShare();
        if (error.code === 422) {
          const responseErrors = Object.entries(error.data);
          responseErrors.forEach((item) => {
            setTimeout(() => {
              enqueueSnackbar(item[1], { variant: 'error' });
            }, 500);
          });
        }
      }
    } else {
      enqueueSnackbar($notify, { variant: 'error' });
    }
  };

  const onDeleteRow = async () => {
    setLoadingBtnSave(true);
    try {
      const response = await axios.delete(`file-managements/${row.id}`);

      handleCloseShare();
      setLoadingBtnSave(false);
      enqueueSnackbar('Xóa thành công');

      if (response) {
        refetchData();
      }
    } catch (error) {
      setLoadingBtnSave(false);
      handleCloseShare();
      if (error.code === 422) {
        const responseErrors = Object.entries(error.data);
        responseErrors.forEach((item) => {
          setTimeout(() => {
            enqueueSnackbar(item[1], { variant: 'error' });
          }, 500);
        });
      }else{
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  return (
    <>
      <TableRow
        sx={{
          borderRadius: 1,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
          ...(openDetails && {
            '& .MuiTableCell-root': {
              color: 'text.primary',
              typography: 'subtitle2',
              bgcolor: 'background.default',
            },
          }),
        }}
      >
        {/* <TableCell
          padding="checkbox"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
        >
          <Checkbox checked={selected} onDoubleClick={() => console.log('ON DOUBLE CLICK')} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell onClick={handleClick}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <FileThumbnail file={type} />

            <Typography noWrap variant="inherit" sx={{ maxWidth: 360, cursor: 'pointer' }}>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="center" onClick={handleClick} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {type}
        </TableCell>

        <TableCell align="center" onClick={handleClick} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {fDate(row?.created_at)}
        </TableCell>

        <TableCell align="center" onClick={handleClick}>
          {user?.name || ''}
        </TableCell>

        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            handleClosePopover();
            handleDownload();
          }}
        >
          <Iconify icon="basil:download-outline" />
          Tải File
        </MenuItem>

        <MenuItem
          onClick={() => {
            setInviteEmail(row?.name || '');
            handleClosePopover();
            handleOpenShare();
          }}
        >
          <Iconify icon="mdi:rename-outline" />
          Đổi tên
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleOpenConfirm();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" />
          Xóa File
        </MenuItem>
      </MenuPopover>

      {/* <FileDetailsDrawer
        item={row}
        favorited={favorited}
        onFavorite={handleFavorite}
        onCopyLink={handleCopy}
        open={openDetails}
        onClose={handleCloseDetails}
        onDelete={onDeleteRow}
      /> */}

      <FileShareDialog
        open={openShare}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onSave={onSave}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
        loadingBtnSave={loadingBtnSave}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Xóa"
        content={`Bạn chắn chắc muốn xóa tệp "${row.name}"?`}
        action={
          <Button
            startIcon={
              loadingBtnSave ? (
                <CircularProgress style={{ color: 'white' }} size={24} />
              ) : (
                <Iconify width="18" height="18" icon="eva:trash-2-outline" />
              )
            }
            disabled={loadingBtnSave}
            variant="contained"
            color="error"
            onClick={onDeleteRow}
          >
            Xóa
          </Button>
        }
      />
    </>
  );
}
