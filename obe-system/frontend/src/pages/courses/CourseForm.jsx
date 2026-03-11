import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks';
import { 
  Input, 
  Select, 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardBody,
  Alert,
  Spinner,
  Breadcrumb
} from '@/components/ui';
import { 
  BookOpenIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

/**
 * CourseForm Component
 * Handles both creating new courses and editing existing courses
 * Determines mode based on courseId URL parameter
 */
const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  const isEditMode = !!courseId;
  
  // Form validation
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      courseCode: '',
      title: '',
      departmentId: '',
      creditHours: '',
      theoryHours: '',
      labHours: '',
      description: '',
    }
  });

  // Watch credit hours to show validation message
  const creditHours = watch('creditHours');
  const theoryHours = watch('theoryHours');
  const labHours = watch('labHours');

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Courses', path: '/courses' },
    { label: isEditMode ? 'Edit Course' : 'New Course', path: '#' }
  ];

  // Check authorization
  useEffect(() => {
    if (!isAuthorized(['admin', 'hod'])) {
      navigate('/unauthorized');
    }
  }, [isAuthorized, navigate]);

  // Fetch departments and courses for dropdowns
  useEffect(() => {
    fetchDepartments();
    fetchCourses();
    
    if (isEditMode) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchDepartments = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/departments');
      // setDepartments(response.data);
      
      // Mock data
      setDepartments([
        { id: '1', name: 'Computer Science', code: 'CS' },
        { id: '2', name: 'Electrical Engineering', code: 'EE' },
        { id: '3', name: 'Mechanical Engineering', code: 'ME' },
        { id: '4', name: 'Civil Engineering', code: 'CE' },
        { id: '5', name: 'Business Administration', code: 'BA' }
      ]);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/courses');
      // setCourses(response.data);
      
      // Mock data
      setCourses([
        { id: '1', courseCode: 'CS101', title: 'Introduction to Programming' },
        { id: '2', courseCode: 'CS102', title: 'Data Structures' },
        { id: '3', courseCode: 'CS201', title: 'Algorithms' },
        { id: '4', courseCode: 'CS202', title: 'Database Systems' },
        { id: '5', courseCode: 'CS301', title: 'Software Engineering' },
        { id: '6', courseCode: 'CS302', title: 'Operating Systems' },
        { id: '7', courseCode: 'MATH101', title: 'Calculus I' },
        { id: '8', courseCode: 'MATH102', title: 'Linear Algebra' },
      ]);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchCourseData = async () => {
    try {
      setInitialLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/courses/${courseId}`);
      // const course = response.data;
      
      // Mock data for edit mode
      const course = {
        courseCode: 'CS203',
        title: 'Web Development',
        departmentId: '1',
        creditHours: 3,
        theoryHours: 2,
        labHours: 1,
        description: 'An introduction to modern web development technologies including HTML, CSS, JavaScript, and frameworks.',
        prerequisites: ['1', '2'] // IDs of prerequisite courses
      };
      
      // Populate form with existing data
      reset({
        courseCode: course.courseCode,
        title: course.title,
        departmentId: course.departmentId,
        creditHours: course.creditHours,
        theoryHours: course.theoryHours,
        labHours: course.labHours,
        description: course.description,
      });
      
      setSelectedPrerequisites(course.prerequisites || []);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      setLoading(true);

      const courseData = {
        ...data,
        creditHours: parseFloat(data.creditHours),
        theoryHours: parseFloat(data.theoryHours),
        labHours: parseFloat(data.labHours),
        prerequisites: selectedPrerequisites
      };

      if (isEditMode) {
        // TODO: Replace with actual API call
        // await api.put(`/courses/${courseId}`, courseData);
        console.log('Updating course:', courseData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to courses list
        navigate('/courses', { 
          state: { message: 'Course updated successfully!' }
        });
      } else {
        // TODO: Replace with actual API call
        // await api.post('/courses', courseData);
        console.log('Creating course:', courseData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to courses list
        navigate('/courses', { 
          state: { message: 'Course created successfully!' }
        });
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} course`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/courses');
  };

  const handlePrerequisiteToggle = (courseId) => {
    setSelectedPrerequisites(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Show loading spinner while fetching course data in edit mode
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEditMode 
            ? 'Update course information and settings' 
            : 'Add a new course to the system'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert 
          type="error" 
          title="Error"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Course Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Code */}
              <Input
                label="Course Code"
                icon={BookOpenIcon}
                placeholder="e.g., CS101"
                error={errors.courseCode?.message}
                required
                {...register('courseCode', {
                  required: 'Course code is required',
                  pattern: {
                    value: /^[A-Z]{2,4}\d{3}$/,
                    message: 'Course code must be in format: 2-4 uppercase letters followed by 3 digits (e.g., CS101)'
                  }
                })}
              />

              {/* Department */}
              <Select
                label="Department"
                icon={BuildingOfficeIcon}
                error={errors.departmentId?.message}
                required
                {...register('departmentId', {
                  required: 'Department is required'
                })}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </Select>

              {/* Course Title */}
              <div className="md:col-span-2">
                <Input
                  label="Course Title"
                  icon={AcademicCapIcon}
                  placeholder="e.g., Introduction to Programming"
                  error={errors.title?.message}
                  required
                  {...register('title', {
                    required: 'Course title is required',
                    minLength: {
                      value: 5,
                      message: 'Title must be at least 5 characters'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Title must not exceed 200 characters'
                    }
                  })}
                />
              </div>

              {/* Credit Hours */}
              <Input
                type="number"
                label="Credit Hours"
                icon={ClockIcon}
                placeholder="e.g., 3"
                step="0.5"
                min="0"
                error={errors.creditHours?.message}
                required
                {...register('creditHours', {
                  required: 'Credit hours is required',
                  min: {
                    value: 0.5,
                    message: 'Credit hours must be at least 0.5'
                  },
                  max: {
                    value: 10,
                    message: 'Credit hours must not exceed 10'
                  }
                })}
              />

              {/* Theory Hours */}
              <Input
                type="number"
                label="Theory Hours per Week"
                icon={ClockIcon}
                placeholder="e.g., 2"
                step="1"
                min="0"
                error={errors.theoryHours?.message}
                required
                {...register('theoryHours', {
                  required: 'Theory hours is required',
                  min: {
                    value: 0,
                    message: 'Theory hours cannot be negative'
                  },
                  max: {
                    value: 10,
                    message: 'Theory hours must not exceed 10'
                  }
                })}
              />

              {/* Lab Hours */}
              <Input
                type="number"
                label="Lab Hours per Week"
                icon={ClockIcon}
                placeholder="e.g., 1"
                step="1"
                min="0"
                error={errors.labHours?.message}
                required
                {...register('labHours', {
                  required: 'Lab hours is required',
                  min: {
                    value: 0,
                    message: 'Lab hours cannot be negative'
                  },
                  max: {
                    value: 10,
                    message: 'Lab hours must not exceed 10'
                  }
                })}
              />

              {/* Hours Summary */}
              {(theoryHours || labHours) && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Total Contact Hours:</span>{' '}
                      {(parseFloat(theoryHours || 0) + parseFloat(labHours || 0)).toFixed(1)} hours per week
                      {creditHours && (
                        <span className="ml-2">
                          ({creditHours} credit hours)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    rows="4"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Provide a detailed description of the course content, objectives, and outcomes..."
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 20,
                        message: 'Description must be at least 20 characters'
                      },
                      maxLength: {
                        value: 1000,
                        message: 'Description must not exceed 1000 characters'
                      }
                    })}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Prerequisites Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Prerequisites (Optional)</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              Select courses that students must complete before taking this course.
            </p>
            
            {courses.length === 0 ? (
              <p className="text-sm text-gray-500">No courses available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {courses.map(course => (
                  <label
                    key={course.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPrerequisites.includes(course.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedPrerequisites.includes(course.id)}
                      onChange={() => handlePrerequisiteToggle(course.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.courseCode}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {course.title}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedPrerequisites.length > 0 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">
                    {selectedPrerequisites.length} prerequisite(s) selected
                  </span>
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
