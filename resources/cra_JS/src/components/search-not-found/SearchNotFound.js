import PropTypes from 'prop-types';
// @mui
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  query: PropTypes.string,
  sx: PropTypes.object,
};

export default function SearchNotFound({ query, sx, ...other }) {
  return query ? (
    <Paper
      sx={{
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" paragraph>
        Không tìm thấy
      </Typography>

      <Typography variant="body2">
        Không tìm thấy kết quả nào &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> Hãy thử kiểm tra lỗi chính tả hoặc sử dụng các từ hoàn chỉnh.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      Vui lòng nhập từ khóa
    </Typography>
  );
}
