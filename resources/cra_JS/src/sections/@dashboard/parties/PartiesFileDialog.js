import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { UploadCustomizeForGood } from '../../../components/upload';
import { FOLDER_IMAGE } from '../../../utils/constant';
// ----------------------------------------------------------------------

PartiesFileDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  refetchData: PropTypes.func,
};

export default function PartiesFileDialog({
  title = 'Tải lên tệp đính kèm',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  refetchData,
  folderId,
  attachments,
  isEdit,
  attachFiles,
  fileRemove,
  ...other
}) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isEdit) {
      setFiles(attachFiles || []);
    }
  }, [isEdit, open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      attachments([...files, ...newFiles]);
      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    attachments(filtered);
    setFiles(filtered);
    if (!inputFile.preview) {
      fileRemove(inputFile);
    }
  };

  const handleRemoveAllFiles = () => {
    files.forEach((file) => {
      fileRemove(file);
    });
    attachments([]);
    setFiles([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }} display="flex" justifyContent="space-between">
        {title}
        <Button
          color="error"
          variant="contained"
          size="small"
          startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
          onClick={onClose}
        >
          Đóng
        </Button>{' '}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <UploadCustomizeForGood
          multiple
          files={files}
          onDrop={handleDrop}
          onRemove={handleRemoveFile}
          isEdit={isEdit}
          folder={FOLDER_IMAGE.good_attachment}
        />
      </DialogContent>

      <DialogActions>
        {!!files.length && (
          <>
            <Button
              variant="contained"
              startIcon={<Iconify width="18" height="18" icon="eva:cloud-upload-fill" />}
              onClick={() => onClose()}
            >
              Tải lên
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
              Xóa tất cả
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
