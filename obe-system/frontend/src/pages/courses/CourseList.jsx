import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Pagination,
  EmptyState,
  Spinner,
  Modal,
  Alert,
} from '../../components/ui';
import { useAuth, useApiQuery, useApiMutation } from '../../hooks';
import { courseService } from '../../services';

/**
 * CourseList Component
 * 
 * Displays a paginated, searchable, and filterable list of courses.
 * Features:
 * - Server-side pagination
 * - Search by code or title
 * - Filter by department
 * - Delete with confirmation
 * - Role-based access control
 */
const CourseList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthorized } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
  
  const itemsPerPage = 10;

  // Fetch courses with React Query
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    error: coursesError,
    refetch: refetchCourses,
  } = useApiQuery(
    ['courses', { page: currentPage, limit: itemsPerPage, search: searchTerm, department_id: departmentFilter }],
    '/courses',
    {
      keepPreviousData: true,
    },
    {
      page: currentPage,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(departmentFilter && { department_id: departmentFilter }),
    }
  );

  // Fetch departments for filter dropdown
  const {
    data: departmentsData,
    isLoading: isLoadingDepartments,
  } = useApiQuery(
    'departments-active',
    '/departments/active',
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - departments don't change often
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation(
    (id) => courseService.delete(id),
    {
      onSuccess: () => {
        // Show success toast
        toast.success('Course deleted successfully');
        // Close modal
        setDeleteModal({ isOpen: false, course: null });
        // Invalidate and refetch courses
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete course');
      },
    }
  );

  // Process courses data
  const courses = useMemo(() => {
    if (!coursesData) return [];
    // Handle both paginated response and array response
    return coursesData.data || coursesData || [];
  }, [coursesData]);

  // Get pagination info
  const pagination = useMemo(() => {
    if (!coursesData) return { total: 0, totalPages: 1 };
    return {
      total: coursesData.pagination?.total || coursesData.total || courses.length,
      totalPages: coursesData.pagination?.totalPages || coursesData.totalPages || Math.ceil(courses.length / itemsPerPage),
      currentPage: coursesData.pagination?.page || currentPage,
    };
  }, [coursesData, courses.length, currentPage]);

  // Process departments for select options
  const departmentOptions = useMemo(() => {
    const options = [{ value: '', label: 'All Departments' }];
    if (departmentsData) {
      const depts = departmentsData.data || departmentsData || [];
      depts.forEach((dept) => {
        options.push({
          value: dept.id.toString(),
          label: dept.name || dept.short_name,
        });
      });
    }
    return options;
  }, [departmentsData]);

  // Table columns configuration
  // Note: render function signature is (cellValue, row, index) per Table component
  const columns = [
    {
      key: 'course_code',
      label: 'Code',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || null;
        return (
          <span className="font-semibold text-gray-900">{course.course_code || course.code}</span>
        );
      },
    },
    {
      key: 'course_title',
      label: 'Title',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || null;
        return (
          <div>
            <div className="font-medium text-gray-900">{course.course_title || course.title}</div>
            <div className="text-sm text-gray-500">
              {course.offerings_count || course.offerings || 0} offering(s)
            </div>
          </div>
        );
      },
    },
    {
      key: 'credit',
      label: 'Credits',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || null;
        return (
          <span className="text-gray-700">{course.credit || course.credit_hours || course.credits}</span>
        );
      },
    },
    {
      key: 'department_id',
      label: 'Department',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || null;
        // Look up department name from departments list if available
        const dept = departmentsData?.data?.find(d => d.id === course.department_id) ||
                     departmentsData?.find?.(d => d.id === course.department_id);
        return (
          <span className="text-gray-700">
            {dept?.name || dept?.short_name || course.department_name || `Dept #${course.department_id}` || 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || null;
        const isActive = course.is_active === true || course.is_active === 1 || course.status === 'Active';
        return (
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'students',
      label: 'Students',
      sortable: true,
      render: (value, course) => {
        if (!course) return value || 0;
        return (
          <span className="text-gray-700">{course.students_count || course.students || 0}</span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, course) => {
        if (!course) return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course.id}/clos`);
              }}
              title="Manage CLOs"
            >
              <AcademicCapIcon className="h-4 w-4" />
            </Button>
            {isAuthorized(['admin', 'hod']) && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/courses/${course.id}/edit`);
                  }}
                  title="Edit Course"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(course);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete Course"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Handlers
  const handleRowClick = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleDeleteClick = (course) => {
    setDeleteModal({ isOpen: true, course });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.course) return;
    deleteMutation.mutate(deleteModal.course.id);
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, course: null });
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoadingCourses && !courses.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (coursesError) {
    return (
      <div className="space-y-6">
        <Alert type="error" title="Error loading courses">
          {coursesError.message || 'Failed to load courses. Please try again.'}
        </Alert>
        <Button onClick={() => refetchCourses()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage courses, CLOs, and course offerings
          </p>
        </div>
        {isAuthorized(['admin', 'hod']) && (
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => navigate('/courses/new')}
          >
            Add Course
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card>
        <CardBody padding="normal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Search by course code or title..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={MagnifyingGlassIcon}
              />
            </div>

            {/* Department Filter */}
            <div>
              <Select
                value={departmentFilter}
                onChange={handleDepartmentChange}
                options={departmentOptions}
                icon={FunnelIcon}
                disabled={isLoadingDepartments}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.total} Course{pagination.total !== 1 ? 's' : ''} Found
          </CardTitle>
        </CardHeader>
        <CardBody padding="none">
          {courses.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={courses}
                onRowClick={handleRowClick}
                striped
                hover
                loading={isLoadingCourses}
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={pagination.total}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-12">
              <EmptyState
                variant="search"
                title="No courses found"
                message={
                  searchTerm || departmentFilter
                    ? 'Try adjusting your search or filter criteria'
                    : 'No courses have been added yet'
                }
                action={
                  isAuthorized(['admin', 'hod']) && !searchTerm && !departmentFilter
                    ? {
                        label: 'Add Course',
                        onClick: () => navigate('/courses/new'),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <TrashIcon className="w-6 h-6 text-red-600" />
          </div>
          
          <h3 className="mt-4 text-lg font-semibold text-center text-gray-900">
            Delete Course
          </h3>
          
          <p className="mt-2 text-sm text-center text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">
              {deleteModal.course?.code} - {deleteModal.course?.title}
            </span>
            ? This action cannot be undone.
          </p>

          {deleteMutation.isError && (
            <Alert type="error" className="mt-4">
              {deleteMutation.error?.message || 'Failed to delete course'}
            </Alert>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              fullWidth
              onClick={handleDeleteCancel}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDeleteConfirm}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseList;
