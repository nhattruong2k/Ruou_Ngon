import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import { Stack, Dialog, Button, TextField, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import axios from '../../../../utils/axios';
// components
import Iconify from '../../../../components/iconify';
import { Upload } from '../../../../components/upload';
import { useSnackbar } from '../../../../components/snackbar';
// ----------------------------------------------------------------------

FileNewFolderDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  refetchData: PropTypes.func,
};

export default function FileNewFolderDialog({
  title = 'Tải hồ sơ lên',
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
  ...other
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [files, setFiles] = useState([]);

  const [loadingBtnSave, setLoadingBtnSave] = useState(false);

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
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
      case 'NewFolder':
        $notify = 'Vui lòng nhập tên thư mục';
        isValid = folderName !== '';
        break;
      default:
        $notify = 'Vui lòng chọn file muốn tải lên';
        isValid = files.length > 0;
        break;
    }

    if (isValid) {
      setLoadingBtnSave(true);
      try {
        const newFormData = {
          file_uploads: files,
          parent_id: folderId,
          type_upload: typeUpload,
          folder_name: folderName
        };
        // newFormData._method = 'PUT';
        const response = await axios.post(`file-managements`, newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });

        onClose();
        setLoadingBtnSave(false);
        enqueueSnackbar(typeUpload === 'NewFolder' ? 'Tạo thư mục thành công' : 'Tải lên thành công');
        if (typeUpload === 'NewFolder') onCreate();
        if (response) {
          refetchData();
        }
      } catch (error) {
        setLoadingBtnSave(false);
        onClose();
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


  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        {(onCreate || onUpdate) && (
          <TextField fullWidth label="Tên thư mục" value={folderName} onChange={onChangeFolderName} sx={{ mb: 3 }} />
        )}
        {
          !onCreate &&
          <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
        }

      </DialogContent>

      <DialogActions>
        {
          !onCreate &&
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
          </>
        }


        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={() => handleUpload('NewFolder')}
              startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="ph:folder-fill" />}
              disabled={loadingBtnSave}
            >
              {onUpdate ? 'Lưu' : 'Tạo mới'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
