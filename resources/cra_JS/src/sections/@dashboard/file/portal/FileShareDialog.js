import PropTypes from 'prop-types';
// @mui
import { List, Stack, Dialog, Button, TextField, DialogTitle, DialogActions, DialogContent, CircularProgress } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
//
import FileInvitedItem from '../FileInvitedItem';

// ----------------------------------------------------------------------

FileShareDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shared: PropTypes.array,
  onCopyLink: PropTypes.func,
  inviteEmail: PropTypes.string,
  onChangeInvite: PropTypes.func,
};

export default function FileShareDialog({
  shared,
  inviteEmail,
  onCopyLink,
  onChangeInvite,
  loadingBtnSave,
  //
  onSave,
  open,
  onClose,
  ...other
}) {
  const hasShared = shared && !!shared.length;

  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
        <DialogTitle> Cập nhật tên tệp </DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          {onChangeInvite && (
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <TextField fullWidth size="small" value={inviteEmail} placeholder="Tên tệp" onChange={onChangeInvite} />
              <Button
                startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:cloud-upload-fill" />}
                disabled={loadingBtnSave}
                variant="contained" sx={{ flexShrink: 0 }} onClick={onSave}>
                Lưu
              </Button>
            </Stack>
          )}

          {hasShared && (
            <Scrollbar sx={{ maxHeight: 60 * 6 }}>
              <List disablePadding>
                {shared.map((person) => (
                  <FileInvitedItem key={person.id} person={person} />
                ))}
              </List>
            </Scrollbar>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {onCopyLink && (
            <Button startIcon={<Iconify icon="eva:link-2-fill" />} onClick={onCopyLink}>
              Copy link
            </Button>
          )}

          {onClose && (
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Đóng
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
