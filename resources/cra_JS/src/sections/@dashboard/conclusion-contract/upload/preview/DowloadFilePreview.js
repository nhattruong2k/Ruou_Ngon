import { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Stack, Typography, Tooltip, CircularProgress } from '@mui/material';
import axios from '../../../../../utils/axios';
import { useSnackbar } from '../../../../../components/snackbar';
import Iconify from '../../../../../components/iconify';
import { FOLDER_FILES } from '../../../../../utils/constant';

DowloadFilePreview.propTypes = {
    files: PropTypes.array,
    loadingAttachment: PropTypes.bool,
    isEdit: PropTypes.bool,
  };
export default function DowloadFilePreview({
    file,
}) {
    const { enqueueSnackbar } = useSnackbar();

    const [loadingAttachment, setLoadingAttachment] = useState(false);

    const haldeDowLoadFile = (filedata) => {
        setLoadingAttachment(true);
        axios
          .get(`download-file/${filedata?.path}/${FOLDER_FILES.conclusionContract}`, {
            method: 'GET',
            responseType: 'blob',
          })
          .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filedata?.name}`);
            document.body.appendChild(link);
            link.click();
            setLoadingAttachment(false);
          })
          .catch((error) => {
            setLoadingAttachment(false);
            enqueueSnackbar('Lỗi không tải được file đính kèm', { variant: 'error' });
          });
    }
    return (
        <>
            <Tooltip title={`Tải file đính kém`}>
                <IconButton
                    disabled={loadingAttachment}
                    color="primary"
                    onClick={()=>haldeDowLoadFile(file)}
                >
                    {loadingAttachment ? (
                        <CircularProgress style={{ color: 'red' }} size={20} />
                    ) : (
                        <Iconify icon="eva:download-outline" />
                    )}
                </IconButton>
            </Tooltip>
        </>
    )
}