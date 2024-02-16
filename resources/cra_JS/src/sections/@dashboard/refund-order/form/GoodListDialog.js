import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Stack, Dialog, Button, TextField, Typography, ListItemButton, InputAdornment } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import SearchNotFound from '../../../../components/search-not-found';
import TableSkeleton from '../../renvenue-employee/TableSkeleton';
// ----------------------------------------------------------------------

GoodListDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};

export default function GoodListDialog({ open, selected, onClose, onSelect, goodData }) {

  const [searchAddress, setSearchAddress] = useState('');

  const dataFiltered = applyFilter(goodData, searchAddress, selected);

  const isNotFound = !dataFiltered.length && !!searchAddress;

  const handleSearch = (event) => {
    setSearchAddress(event.target.value);
  };

  const handleSelect = (good) => {
    onSelect(good);
    setSearchAddress('');
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2.5, px: 3 }}>
        <Typography variant="h6"> Chọn sản phẩm </Typography>

        <Button
          color="error"
          variant="contained"
          size="small"
          startIcon={<Iconify width="18" height="18" icon="eva:close-circle-fill" />}
          onClick={onClose}
        >
          Đóng
        </Button>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <TextField
          size='small'
          value={searchAddress}
          onChange={handleSearch}
          placeholder="Tìm tên, mã sản phẩm..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {isNotFound ? (
        <SearchNotFound query={searchAddress} sx={{ px: 3, pt: 5, pb: 10, height: '600px' }} />
      ) : (
        <Scrollbar sx={{ p: 1.5, pt: 0, height: '600px' }}>
          {

            dataFiltered.map((item) => (
              <ListItemButton
                key={item?.good?.id}
                onClick={() => handleSelect(item)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  },
                }}
              >
                <Typography variant="subtitle2">{item?.good?.name}</Typography>

                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    my: 0.5,
                    color: 'info.main',
                    fontWeight: 'fontWeightMedium',
                  }}
                >
                  {item?.good?.code}
                </Typography>
              </ListItemButton>
            ))

          }
        </Scrollbar>
      )}
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter(array, query, selected) {
  return array.filter(
    ({ good }) => !selected.some(notInItem => notInItem.good_id === good.id)
      &&
      (good.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        good.code.toLowerCase().indexOf(query.toLowerCase()) !== -1
      )
  );
}
