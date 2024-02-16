import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { Stack, Dialog, Button, TextField, Typography, ListItemButton, InputAdornment, Box, Avatar } from '@mui/material';
// components
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import SearchNotFound from '../../../components/search-not-found';
import TableSkeleton from '../renvenue-employee/TableSkeleton';
import { HOST_ASSETS_URL } from '../../../config';
// ----------------------------------------------------------------------

GoodListDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};

export default function GoodListDialog({ open, selected, onClose, onSelect, goodData }) {

  const [visibleGoodCount, setVisibleGoodCount] = useState(20);

  const productsPerLoad = 20;

  const [searchAddress, setSearchAddress] = useState('');

  const dataFiltered = applyFilter(goodData.goods, searchAddress, selected);

  const isNotFound = !dataFiltered.length && !!searchAddress;

  useEffect(() => {
    if (!open) {
      setVisibleGoodCount(20);
    }
  }, [open]);

  const handleSearch = (event) => {
    setSearchAddress(event.target.value);
  };

  const handleSelect = (good) => {
    onSelect(good);
    setSearchAddress('');
  };

  const handleScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      setVisibleGoodCount((prevCount) => prevCount + productsPerLoad);
    }
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
        <div
          onScroll={handleScroll}
          style={{
            overflow: 'auto',
            height: '600px',
            padding: '10px'
          }}
          className='scroll-bar-custom-css'
        >
          {
            goodData.isLoading ? (
              <TableSkeleton />
            ) : (
              dataFiltered.slice(0, visibleGoodCount).map((good) => (
                <ListItemButton
                  key={good.id}
                  onClick={() => handleSelect(good)}
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
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      alt={good?.name || ''}
                      src={`${HOST_ASSETS_URL}storage/__good_photos__/${good?.photo}`}
                      variant="rounded"
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />

                    <Box>
                      <Typography variant="subtitle2">{good.name}</Typography>

                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          my: 0.5,
                          color: 'info.main',
                          fontWeight: 'fontWeightMedium',
                        }}
                      >
                        {good.code}
                      </Typography>

                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {good?.good_category?.name || ''} - {good?.unit_of_measure?.name || ''}
                      </Typography>
                    </Box>

                  </Stack>


                </ListItemButton>
              ))
            )
          }
        </div>
      )}
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter(array, query, selected) {
  return array.filter(
    (good) => !selected.some(notInItem => notInItem.id === good.id)
      &&
      (good.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        good.code.toLowerCase().indexOf(query.toLowerCase()) !== -1
      )
  );
}
