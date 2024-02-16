import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
// @mui
import { Box, Divider, IconButton, Stack, Container, Typography, Pagination, Chip } from '@mui/material';
// routes

import { isArray, isEmpty, isNull } from 'lodash';
// useResponsive
import useResponsive from '../../hooks/useResponsive';
// utils
import axios from '../../utils/axios';
import { useDispatch, useSelector } from '../../redux/store';

import { getBlogById, getBlogs } from '../../redux/slices/blog'
// components
import Markdown from '../../components/markdown';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import { SkeletonPostDetails } from '../../components/skeleton';
// sections
import BlogViewPost from '../../sections/@dashboard/blog/BlogViewPost';
import { BlogTableRow, BlogTableToolbar } from '../../sections/@dashboard/blog/list';
import FileListView from '../../sections/@dashboard/blog/file/FileListView';
import BlogFileDialog from '../../sections/@dashboard/blog/BlogFileDialog';
import { _folders, _files } from '../../_mock/arrays';
import { useSnackbar } from '../../components/snackbar';
import Iconify from '../../components/iconify';
import { PATH_DASHBOARD } from '../../routes/paths';
// ----------------------------------------------------------------------

export default function BlogViewDetailPage() {
  const { themeStretch } = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  const dispatch = useDispatch();

  const [recentFile, setRecentFile] = useState([]);

  const [post, setPost] = useState(null);

  const [loadingPost, setLoadingPost] = useState(true);

  const [error, setError] = useState(null);

  const [tableData, setTableData] = useState([]);

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const isDesktop = useResponsive('up', 'sm');

  const isMobile = useResponsive('down', 'sm');

  useEffect(() => {
    if (id) {
      getBlogById(id);
    }
  }, [id]);

  const refetchData = () => {
    if (id) {
      getBlogById(id);
    }
  };

  const getBlogById = async (id) => {
    await axios.get(`get-blog-by-id/${id}`).then((response) => {
      setPost(response?.data?.data);

      const valuesArray = JSON.parse(response?.data?.data?.attachments);
      setRecentFile(valuesArray);
      setLoadingPost(false);
    });
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  return (
    <>
      <Helmet>
        <title>{`Tin tức: ${post?.title || ''} | Rượu ngon`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Chi tiết tin tức"
          links={[
            {
              name: 'Hệ thống',
            },
            {
              name: 'Tin tức nội bộ',
              href: PATH_DASHBOARD.blog.list
            },
            {
              name: post?.title,
            },
          ]}
        />

        {post && (
          <Stack
            sx={{
              borderRadius: 2,
              boxShadow: (theme) => ({
                md: theme.customShadows.card,
              }),
            }}
          >
            <BlogViewPost post={post} />
            {/* <div className='format-css-blog'>
              <Markdown
                children={post.description}
                sx={{
                  px: { md: 5 },
                }}
              />

            </div> */}

            <Markdown
              children={post.description}
              sx={isMobile ? ({ pl: 1 }) : ({
                px: { md: 5 },
              })}
            />

            <Divider sx={{ mt: 5, mb: 2 }} />
            <Stack spacing={2}>
              {!isNull(recentFile) &&
                !(Array.isArray(recentFile) &&
                  recentFile.length === 0) &&
                <Typography
                  variant="h5"
                  sx={isDesktop ? ({ pl: 5, pr: 5, pt: 3 }) : ({ pl: 1, mt: 3, mb: 3 })}
                >
                  File đính kèm
                </Typography>
              }
              <Stack
                sx={isDesktop ? ({ pr: 5, pl: 5, pb: 5 }) : ({ pr: 5, pl: 1, pb: 5 })}
              >
                <Stack direction={isDesktop ? "row" : 'column'} flexWrap="wrap">
                  {recentFile?.map((file) => (
                    <FileListView
                      key={file.name}
                      file={file}
                      post={post}
                      refetchData={refetchData}
                    />
                  ))}
                </Stack>


              </Stack>

            </Stack>

          </Stack>
        )}

        {error && !loadingPost && <Typography variant="h6">404 {error}</Typography>}

        {loadingPost && <SkeletonPostDetails />}
      </Container >
    </>
  );
}
