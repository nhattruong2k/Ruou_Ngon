import { useState, useEffect, useCallback } from 'react';

import { paramCase } from 'change-case';
import { Helmet } from 'react-helmet-async';
import { Card, Container, Button, Drawer, Grid } from '@mui/material';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import moment from 'moment';

import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
import Iconify from '../../components/iconify';

import { useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';

import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../components/table';

import BlogTableAddNewAndEditForm from '../../sections/@dashboard/blog/BlogTableAddNewAndEditForm';
import { BlogTableRow, BlogTableToolbar } from '../../sections/@dashboard/blog/list'
import { SkeletonPostItem } from '../../components/skeleton';
import { getBlogs } from '../../redux/slices/blog'
import { getInternalOrg } from '../../redux/slices/internalOrg';
import { getEmployees } from '../../redux/slices/employee';
import { useSnackbar } from '../../components/snackbar';

export default function BlogListPage() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultRowsPerPage: 10,
    defaultCurrentPage: 1
  });

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const [post, setPost] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [filterInternal, setFilterInternal] = useState([]);

  const [postData, setPostData] = useState([]);

  const [openDrawer, setOpenDrawer] = useState(false);

  const { blogs, isLoading, dataPaging } = useSelector((state) => state.blog);

  const [isEdit, setIsEdit] = useState(false);

  const [filterStatus, setFilterStatus] = useState([]);

  const [filterService, setFilterService] = useState('all');

  const [currentBlog, setCurrentBlog] = useState(null);

  const isNotFound = (!postData.length && !!filterName) || (!isLoading && !postData.length);

  const internalOrgs = useSelector((state) => state.internalOrg.internalOrgs);

  const employees = useSelector((state) => state.employee.employees);

  const [filterStartDate, setFilterStartDate] = useState(moment().add(-30, 'days').format('YYYY-MM-DD'));

  const [filterEndDate, setFilterEndDate] = useState(moment().format('YYYY-MM-DD'));

  const isFiltered =
    filterName !== '' ||
    filterService !== 'all' ||
    filterStartDate !== moment().add(-30, 'days').format('YYYY-MM-DD') ||
    filterEndDate !== moment().format('YYYY-MM-DD');

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const onFilterInternal = (event) => {
    setPage(0);
    setFilterInternal(event);
  };


  useEffect(() => {
    const params = {
      filter_title: filterName,
      rows_per_page: rowsPerPage,
      page,
      filter_internal: filterInternal
    };

    dispatch(getBlogs(params));
  }, [dispatch, filterName, page, rowsPerPage, filterInternal]);

  useEffect(() => {
    if (!isLoading) {
      setPostData(blogs);
    }
  }, [isLoading]);


  useEffect(() => {
    dispatch(getInternalOrg({}));
  }, []);

  useEffect(() => {
    dispatch(getEmployees({}));
  }, []);

  const refetchData = () => {
    dispatch(getBlogs({
      filter_title: filterName,
      rows_per_page: rowsPerPage,
      page,
      filter_start_date: filterStartDate ? moment(filterStartDate).format('YYYY-MM-DD') : null,
      filter_end_date: filterEndDate ? moment(filterEndDate).format('YYYY-MM-DD') : null,
    }));
  };

  const denseHeight = dense ? 60 : 80;

  const addItem = () => {
    setOpenDrawer(true);
    setIsEdit(false);
    setCurrentBlog(null);
  };

  const handleCloseDetails = () => {
    setOpenDrawer(false);
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus([]);
    setFilterInternal([]);
    setFilterStartDate(moment().add(-30, 'days').format('YYYY-MM-DD'));
    setFilterEndDate(moment().format('YYYY-MM-DD'));
    setFilterService('all');
  };

  const handleDeleteRows = async (selected) => {
    try {
      const response = await axios.post('blogs/0', {
        ids: selected,
        _method: 'DELETE',
      });

      enqueueSnackbar('Xóa thành công!');

      refetchData();
      setSelected([])
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleEditRow = (post) => {
    setOpenDrawer(true);
    setIsEdit(true);
    setCurrentBlog({
      ...post,
    });
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.blog.view(id));
  };

  return (
    <>
      <Helmet>
        <title>Tin tức nội bộ | Rượu ngon</title>
      </Helmet>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          sx={{ mb: 2 }}
          heading="Tin tức nội bộ"
          links={[
            {
              name: 'Hệ thống',
            },
            { name: 'Tin tức nội bộ' },
          ]}
          action={
            <Button
              key={'keyitem1'}
              sx={{ mr: 1 }}
              size="small"
              onClick={addItem}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Thêm mới
            </Button>
          }
        />

        <BlogTableToolbar
          filterName={filterName}
          onFilterName={handleFilterName}
          isFiltered={isFiltered}
          onResetFilter={handleResetFilter}
          internalOrgs={internalOrgs}
          onFilterInternal={onFilterInternal}
        />


        <Grid container spacing={5}>
          {(isLoading ? [...Array(rowsPerPage)] : postData)
            .map((post, index) => post ? (
              <Grid key={post.id} item xs={12} sm={6} md={6}>
                <BlogTableRow
                  post={post}
                  index={index}
                  onDeleteRow={() => handleDeleteRows([post.id])}
                  onEditRow={() => handleEditRow(post)}
                  onViewRow={() => handleViewRow(post.id)}
                />
              </Grid>
            ) : (
              !isNotFound && <SkeletonPostItem key={index} sx={{ height: denseHeight }} />
            )
            )}
        </Grid>
        <Drawer
          open={openDrawer}
          anchor={'right'}
          onClose={() => {
            setOpenDrawer(false);
          }}
          PaperProps={{
            sx: {
              width: {
                xs: 1,
                sm: 480,
                md: 800,
              },
            },
          }}
        >
          <BlogTableAddNewAndEditForm
            isEdit={isEdit}
            refetchData={refetchData}
            onClose={handleCloseDetails}
            internalOrgs={internalOrgs}
            employees={employees}
            currentBlog={currentBlog}
          />
        </Drawer>

        {((dataPaging?.total || 0) / rowsPerPage) > 1 && (
          <Pagination
            count={Math.ceil(dataPaging?.total / rowsPerPage)}
            page={page}
            onChange={onChangePage}
            sx={{
              mt: 8,
              [`& .${paginationClasses.ul}`]: {
                justifyContent: 'center',
              },
            }}
          />
        )}
      </Container>
    </>
  )
}