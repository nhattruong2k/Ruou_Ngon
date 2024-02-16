import PropTypes from 'prop-types';
// @mui
import { Stack, Button, Tooltip, IconButton, Typography, CircularProgress } from '@mui/material';

// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';
import { STATUSES } from '../../../utils/constant';
// ----------------------------------------------------------------------

ConclusionContractRsbToolbar.propTypes = {
    onCloseDetails: PropTypes.func,
};

export default function ConclusionContractRsbToolbar({ onCloseDetails, onSave, isEdit, isConfirm, isView, title, loadingBtnSave }) {
    const isDesktop = useResponsive('up', 'sm');

    const isMobile = useResponsive('down', 'sm');


    return (
        <>
            <Stack p={2.5} direction="row" alignItems="center">
                <>
                    <Tooltip title="Back">
                        <IconButton onClick={onCloseDetails} sx={{ mr: 1 }}>
                            <Iconify icon="eva:arrow-ios-back-fill" />
                        </IconButton>
                    </Tooltip>
                </>

                <Typography variant="subtitle1"> {isView ? 'Xem chi tiết' : title}  </Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexGrow={1}>
                    {isDesktop && (
                        <>
                            {!isConfirm && !isView && (
                                <>
                                    <Tooltip title={isEdit ? "Cập nhật" : 'Lưu'}>
                                        <Button
                                            color="success"
                                            variant="contained"
                                            size="small"
                                            startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                                            disabled={loadingBtnSave}
                                            onClick={() => {
                                                onSave(STATUSES.pending)
                                            }}
                                        >
                                            {isEdit ? "Cập nhật" : 'Lưu'}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Đóng">
                                        <Button
                                            color="error"
                                            variant="contained"
                                            size="small"
                                            startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                                            onClick={onCloseDetails}
                                        >
                                            Đóng
                                        </Button>
                                    </Tooltip>
                                </>
                            )}
                            {isConfirm && (
                                <>
                                    <Tooltip title={'Duyệt'}>
                                        <Button
                                            color="success"
                                            variant="contained"
                                            size="small"
                                            startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                                            disabled={loadingBtnSave}
                                            onClick={() => {
                                                onSave(STATUSES.confirm)
                                            }}
                                        >
                                            {'Duyệt'}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Đóng">
                                        <Button
                                            color="error"
                                            variant="contained"
                                            size="small"
                                            startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                                            onClick={onCloseDetails}
                                        >
                                            Đóng
                                        </Button>
                                    </Tooltip>
                                </>
                            )}
                            {isView && (
                                <>
                                    <Tooltip title="Đóng">
                                        <Button
                                            color="error"
                                            variant="contained"
                                            size="small"
                                            startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
                                            onClick={onCloseDetails}
                                        >
                                            Đóng
                                        </Button>
                                    </Tooltip>

                                </>
                            )}
                        </>
                    )}

                    {isMobile && (
                        <>
                            <Tooltip title={isEdit ? "Cập nhật" : (isConfirm ? 'Duyệt' : 'Lưu')}>
                                <Button
                                    color="success"
                                    variant="contained"
                                    size="small"
                                    startIcon={loadingBtnSave ? <CircularProgress style={{ color: 'white' }} size={24} /> : <Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
                                    disabled={loadingBtnSave}
                                    onClick={() => {
                                        onSave(isConfirm ? 2 : 1)
                                    }}
                                >
                                    {isEdit ? "Cập nhật" : (isConfirm ? 'Duyệt' : 'Lưu')}
                                </Button>
                            </Tooltip>
                        </>
                    )}

                </Stack>
            </Stack>

        </>
    )
}