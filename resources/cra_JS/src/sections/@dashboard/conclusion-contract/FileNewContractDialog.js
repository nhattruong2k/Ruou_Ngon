import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import { Stack, Dialog, Button, TextField, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import axios from '../../../utils/axios';
// components
import Iconify from '../../../components/iconify';
import UploadFile from './upload/UploadFile';
import { useSnackbar } from '../../../components/snackbar';
import { FOLDER_FILES } from '../../../utils/constant';
// ----------------------------------------------------------------------

FileNewContractDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  refetchData: PropTypes.func,
};

export default function FileNewContractDialog({
  title = 'Tải file đính kèm',
  open,
  onClose,
  isEdit,
  //
  onCreate,
  onUpdate,
  onHadleUploadFile,
  showFile,
  fileRemove,
  //
  folderName,
  onChangeFolderName,
  refetchData,
  folderId,
  ...other
}) {
  // const { enqueueSnackbar } = useSnackbar();

  const [files, setFiles] = useState([]);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  // const [loadingAttachment, setLoadingAttachment] = useState(false);

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
    setFiles(showFile);
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = async (typeUpload) => {
    let $notify = '';
    let isValid = false;
    switch (typeUpload) {
      default:
        $notify = 'Vui lòng chọn file muốn tải lên';
        isValid = files.length > 0;
        break;
    }
    onClose();
    onHadleUploadFile(files);
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    fileRemove(inputFile);
    setFiles(filtered);
    onHadleUploadFile(filtered);
  };

  const handleRemoveAllFiles = () => {
    files.forEach((file) => {
      fileRemove(file);
    });
    setFiles([]);
    onHadleUploadFile([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <UploadFile multiple isEdit={isEdit} files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
      </DialogContent>

      <DialogActions>
        <>
          <Button variant="contained"
            startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:cloud-upload-fill" />}
            disabled={loadingBtnSave}
            onClick={() => handleUpload('UploadFiles')}>
            Tải lên
          </Button>

          {!!files.length && (
            <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
              Xóa tất cả
            </Button>
          )}

          <Button variant="contained" color='error'
            startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
            onClick={() => onClose()}>
            Đóng
          </Button>
        </>
      </DialogActions>
    </Dialog>
  );
}
