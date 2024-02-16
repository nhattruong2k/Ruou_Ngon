
import { useState } from 'react';
// @mui
import {
  Button,
  Tooltip,
} from '@mui/material';
// components
import DialPad from '../../../components/dial-pad/DialPad';
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';

// ----------------------------------------------------------------------

export default function DialPadPopever({onCallFinish, currentContact}) {
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <Tooltip title="Save this">
        <Button
          color="success"
          variant="contained"
          size="small"
          
          className="btn-call-test"
          startIcon={<Iconify width="18" height="18" icon="eva:checkmark-circle-2-fill" />}
          onClick={handleOpenPopover}
        >
          Make call
        </Button>
      </Tooltip>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 350, p: 0 }}>
        <DialPad onCallFinish={onCallFinish} currentContact={currentContact}><></></DialPad>
      </MenuPopover>
    </>
  );
}