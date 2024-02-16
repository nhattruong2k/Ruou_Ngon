import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Button, Card, Avatar, Typography, CardContent, Stack, Link } from '@mui/material';

import { useState, useMemo, useCallback, useRef } from "react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { PATH_DASHBOARD } from '../../../../routes/paths';

import { fDate } from '../../../../utils/formatTime';
import TextMaxLine from '../../../../components/text-max-line';
import { fShortenNumber } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import Image from '../../../../components/image';
import Label from '../../../../components/label';

BlogTableRow.propTypes = {
  index: PropTypes.number,
  post: PropTypes.object,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function BlogTableRow({ index, post, onDeleteRow, onEditRow, onViewRow }) {
  const { attachments, title, view, description, comment, share, createdAt } = post;

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const getText = (html) => {
    const divContainer = document.createElement("div");
    divContainer.innerHTML = html;
    return divContainer.textContent || divContainer.innerText || "";
  };

  const options = [
    'View',
    'Edit',
    'Delete',
  ];

  const POST_INFO = [
    { number: comment, icon: 'eva:message-circle-fill' },
    { number: view, icon: 'eva:eye-fill' },
    { number: share, icon: 'eva:share-fill' },
  ];

  const attachmentsArray = JSON.parse(attachments);

  const imageUrl = 'https://c.pxhere.com/photos/b9/52/goblet_wine_glasses_rose_red_cmky-1201177.jpg!s2';

  return (
    <Card>
      <Box sx={{ display: 'flex', position: 'relative' }}>
        <CardContent sx={{ width: '100%', p: 2, pb: 0 }} className='blog-card-content'>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Label variant="soft" color={'default'}>
              {fDate(post?.created_at || '')}
            </Label>
            {
              post.attachments && JSON.parse(post.attachments).length > 0 &&
              <Stack
                spacing={1.5}
                flexGrow={1}
                direction="row"
                justifyContent="flex-end"
                sx={{
                  typography: 'caption',
                  color: 'text.disabled',
                }}
              >
                <Stack direction="row" alignItems="center" sx={{ color: '#078DEE' }}>
                  <Iconify icon="tdesign:attach" width={16} sx={{ mr: 0.5 }} />
                  File đính kèm
                </Stack>


              </Stack>
            }

          </Stack>

          <Link
            color="inherit"
            to={PATH_DASHBOARD.blog.view(post.id)}
            component={RouterLink}
          >
            <TextMaxLine variant="h5" line={1} persistent>
              {title}
            </TextMaxLine>
          </Link>
          <TextMaxLine line={5} persistent>
            {getText(description)}
          </TextMaxLine>

          <Stack
            flexWrap="wrap"
            direction="row"
            justifyContent="flex-start"
            sx={{ mt: 1, color: 'text.disabled', opacity: 0.64 }}
          >
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={openPopover ? 'long-menu' : undefined}
              aria-expanded={openPopover ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleOpenPopover}
            >
              <MoreHorizIcon />
            </IconButton>
            <MenuPopover open={openPopover} onClose={handleClosePopover} arrow="right-top" sx={{ width: 140 }}>
              <MenuItem
                onClick={() => {
                  handleOpenConfirm();
                  handleClosePopover();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="eva:trash-2-outline" />
                Xóa
              </MenuItem>

              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleClosePopover();
                }}
              >
                <Iconify icon="eva:edit-fill" />
                Sửa
              </MenuItem>

              <MenuItem
                onClick={() => {
                  onViewRow();
                  handleClosePopover();
                }}
              >
                <Iconify icon="eva:eye-fill" />
                Xem
              </MenuItem>
            </MenuPopover>
            <ConfirmDialog
              open={openConfirm}
              onClose={handleCloseConfirm}
              title="Xóa"
              content="Bạn có chắc chắn muốn xóa?"
              action={
                <Button variant="contained" color="error" onClick={onDeleteRow}>
                  Xóa
                </Button>
              }
            />

            <Stack
              spacing={1.5}
              flexGrow={1}
              direction="row"
              justifyContent="flex-end"
              sx={{
                typography: 'caption',
                color: 'text.disabled',
              }}
            >
              <Stack direction="row" alignItems="center">
                <Iconify icon="ph:user-bold" width={16} sx={{ mr: 0.5 }} />
                {post.user.name}
              </Stack>


            </Stack>
          </Stack>
        </CardContent>
        {/* <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Image alt={`abc`} src={`https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_13.jpg`} sx={{ height: 1, borderRadius: 1.5 }} />
        </Box> */}
      </Box>
    </Card>
  );
}
