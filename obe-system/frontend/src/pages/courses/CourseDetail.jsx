import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  Spinner,
  Alert,
  Modal,
  ModalFooter,
  Input,
  Select,
  EmptyState,
  Breadcrumb
} from '@/components/ui';
import {
  BookOpenIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { courseOfferingService } from '../../services';

/**
 * CourseDetail Component
 * Tabbed interface for viewing and managing course details
 * Tabs: Overview, CLOs, Offerings, PLO Mapping
 */
const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [clos, setClos] = useState([]);
  const [plos, setPlos] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [cloPlomapping, setCloPlomapping] = useState({});

  // CLO Modal states
  const [showCloModal, setShowCloModal] = useState(false);
  const [editingClo, setEditingClo] = useState(null);
  const [cloFormData, setCloFormData] = useState({
    code: '',
    description: '',
    bloomLevel: ''
  });

  // Delete confirmation
  const [deletingClo, setDeletingClo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bloom Taxonomy Levels
  const bloomLevels = [
    { value: '1', label: 'Level 1 - Remember', description: 'Recall facts and basic concepts' },
    { value: '2', label: 'Level 2 - Understand', description: 'Explain ideas or concepts' },
    { value: '3', label: 'Level 3 - Apply', description: 'Use information in new situations' },
    { value: '4', label: 'Level 4 - Analyze', description: 'Draw connections among ideas' },
    { value: '5', label: 'Level 5 - Evaluate', description: 'Justify a decision or course of action' },
    { value: '6', label: 'Level 6 - Create', description: 'Produce new or original work' }
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Courses', path: '/courses' },
    { label: course?.title || 'Course Detail', path: '#' }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpenIcon },
    { id: 'clos', label: 'CLOs', icon: AcademicCapIcon },
    { id: 'offerings', label: 'Offerings', icon: UserGroupIcon },
    { id: 'plo-mapping', label: 'PLO Mapping', icon: ArrowPathIcon }
  ];

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API calls
      // const courseResponse = await api.get(`/courses/${courseId}`);
      // const closResponse = await api.get(`/courses/${courseId}/clos`);
      // const plosResponse = await api.get('/plos');
      
      // Fetch real course offerings
      const offeringsResponse = await courseOfferingService.getByCourse(courseId);

      // Mock data
      const mockCourse = {
        id: courseId,
        courseCode: 'CS203',
        title: 'Web Development',
        departmentId: '1',
        departmentName: 'Computer Science',
        creditHours: 3,
        theoryHours: 2,
        labHours: 1,
        description: 'An introduction to modern web development technologies including HTML, CSS, JavaScript, and frameworks. Students will learn to build responsive, interactive web applications using industry-standard tools and practices.',
        status: 'Active',
        prerequisites: ['CS101', 'CS102']
      };

      const mockClos = [
        {
          id: '1',
          code: 'CLO1',
          description: 'Demonstrate proficiency in HTML5 and CSS3 for creating structured and styled web pages',
          bloomLevel: '3',
          mappedPlos: ['PLO1', 'PLO2']
        },
        {
          id: '2',
          code: 'CLO2',
          description: 'Apply JavaScript programming concepts to create interactive web applications',
          bloomLevel: '3',
          mappedPlos: ['PLO1', 'PLO3']
        },
        {
          id: '3',
          code: 'CLO3',
          description: 'Analyze and implement responsive design principles for mobile-friendly interfaces',
          bloomLevel: '4',
          mappedPlos: ['PLO2', 'PLO4']
        },
        {
          id: '4',
          code: 'CLO4',
          description: 'Evaluate and utilize modern web frameworks and libraries for efficient development',
          bloomLevel: '5',
          mappedPlos: ['PLO3', 'PLO5']
        }
      ];

      const mockPlos = [
        { id: '1', code: 'PLO1', description: 'An ability to apply knowledge of computing fundamentals' },
        { id: '2', code: 'PLO2', description: 'An ability to design and implement computing solutions' },
        { id: '3', code: 'PLO3', description: 'An ability to analyze complex computing problems' },
        { id: '4', code: 'PLO4', description: 'An ability to function effectively in teams' },
        { id: '5', code: 'PLO5', description: 'An ability to communicate effectively' },
        { id: '6', code: 'PLO6', description: 'An ability to engage in lifelong learning' }
      ];

      // Use real course offerings data
      const offeringsData = offeringsResponse.data || [];

      // Mock CLO-PLO mapping (strength: 0=none, 1=low, 2=medium, 3=high)
      const mockMapping = {
        '1': { '1': 3, '2': 2, '3': 0, '4': 0, '5': 0, '6': 0 }, // CLO1 mappings
        '2': { '1': 3, '2': 0, '3': 2, '4': 0, '5': 0, '6': 0 }, // CLO2 mappings
        '3': { '1': 0, '2': 3, '3': 0, '4': 2, '5': 0, '6': 0 }, // CLO3 mappings
        '4': { '1': 0, '2': 0, '3': 3, '4': 0, '5': 2, '6': 0 }  // CLO4 mappings
      };

      setCourse(mockCourse);
      setClos(mockClos);
      setPlos(mockPlos);
      setOfferings(offeringsData);
      setCloPlomapping(mockMapping);

    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  // CLO Management Functions
  const handleAddClo = () => {
    const nextCloNumber = clos.length + 1;
    setCloFormData({
      code: `CLO${nextCloNumber}`,
      description: '',
      bloomLevel: ''
    });
    setEditingClo(null);
    setShowCloModal(true);
  };

  const handleEditClo = (clo) => {
    setCloFormData({
      code: clo.code,
      description: clo.description,
      bloomLevel: clo.bloomLevel
    });
    setEditingClo(clo);
    setShowCloModal(true);
  };

  const handleSaveClo = async () => {
    try {
      // TODO: Replace with actual API call
      if (editingClo) {
        // await api.put(`/clos/${editingClo.id}`, cloFormData);
        console.log('Updating CLO:', cloFormData);
        
        // Update local state
        setClos(clos.map(clo => 
          clo.id === editingClo.id 
            ? { ...clo, ...cloFormData }
            : clo
        ));
      } else {
        // await api.post(`/courses/${courseId}/clos`, cloFormData);
        console.log('Creating CLO:', cloFormData);
        
        // Add to local state
        const newClo = {
          id: String(clos.length + 1),
          ...cloFormData,
          mappedPlos: []
        };
        setClos([...clos, newClo]);
        
        // Initialize mapping for new CLO
        setCloPlomapping({
          ...cloPlomapping,
          [newClo.id]: plos.reduce((acc, plo) => ({ ...acc, [plo.id]: 0 }), {})
        });
      }

      setShowCloModal(false);
      setCloFormData({ code: '', description: '', bloomLevel: '' });
    } catch (err) {
      console.error('Error saving CLO:', err);
    }
  };

  const handleDeleteClo = async () => {
    if (!deletingClo) return;

    try {
      setDeleteLoading(true);

      // TODO: Replace with actual API call
      // await api.delete(`/clos/${deletingClo.id}`);
      console.log('Deleting CLO:', deletingClo.id);

      // Remove from local state
      setClos(clos.filter(clo => clo.id !== deletingClo.id));
      
      // Remove from mapping
      const newMapping = { ...cloPlomapping };
      delete newMapping[deletingClo.id];
      setCloPlomapping(newMapping);

      setDeletingClo(null);
    } catch (err) {
      console.error('Error deleting CLO:', err);
      setError(err.message || 'Failed to delete CLO');
    } finally {
      setDeleteLoading(false);
    }
  };

  // PLO Mapping Functions
  const handleMappingClick = (cloId, ploId) => {
    const currentStrength = cloPlomapping[cloId]?.[ploId] || 0;
    const newStrength = (currentStrength + 1) % 4; // Cycle: 0 -> 1 -> 2 -> 3 -> 0

    setCloPlomapping({
      ...cloPlomapping,
      [cloId]: {
        ...cloPlomapping[cloId],
        [ploId]: newStrength
      }
    });
  };

  const getMappingColor = (strength) => {
    switch (strength) {
      case 1: return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 2: return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 3: return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-50 text-gray-400 hover:bg-gray-100';
    }
  };

  const getMappingLabel = (strength) => {
    switch (strength) {
      case 1: return 'L';
      case 2: return 'M';
      case 3: return 'H';
      default: return '-';
    }
  };

  const savePloMapping = async () => {
    try {
      // TODO: Replace with actual API call
      // await api.post(`/courses/${courseId}/plo-mapping`, cloPlomapping);
      console.log('Saving PLO mapping:', cloPlomapping);
      
      // Show success message
      alert('PLO mapping saved successfully!');
    } catch (err) {
      console.error('Error saving PLO mapping:', err);
      setError(err.message || 'Failed to save PLO mapping');
    }
  };

  // Get Bloom level badge
  const getBloomBadge = (level) => {
    const colors = {
      '1': 'default',
      '2': 'info',
      '3': 'primary',
      '4': 'warning',
      '5': 'secondary',
      '6': 'success'
    };
    const labels = bloomLevels.find(b => b.value === level);
    return (
      <Badge variant={colors[level] || 'default'} size="sm">
        {labels ? labels.label : `Level ${level}`}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <EmptyState
          title="Course Not Found"
          message="The course you're looking for doesn't exist or has been removed."
          actionLabel="Back to Courses"
          onAction={() => navigate('/courses')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {course.courseCode} - {course.title}
            </h1>
            <StatusBadge status={course.status.toLowerCase()} />
          </div>
          <p className="mt-2 text-gray-600">
            {course.departmentName} • {course.creditHours} Credit Hours
          </p>
        </div>
        {isAuthorized(['admin', 'hod']) && (
          <Button
            variant="primary"
            icon={PencilIcon}
            onClick={() => navigate(`/courses/${courseId}/edit`)}
          >
            Edit Course
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Course Code</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">{course.courseCode}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="mt-1 text-sm text-gray-900">{course.departmentName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Credit Hours</dt>
                      <dd className="mt-1 text-sm text-gray-900">{course.creditHours}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Theory Hours</dt>
                      <dd className="mt-1 text-sm text-gray-900">{course.theoryHours} hours/week</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lab Hours</dt>
                      <dd className="mt-1 text-sm text-gray-900">{course.labHours} hours/week</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <StatusBadge status={course.status.toLowerCase()} />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-2 text-sm text-gray-900 leading-relaxed">
                      {course.description}
                    </dd>
                  </div>

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mt-6">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Prerequisites</dt>
                      <dd className="flex flex-wrap gap-2">
                        {course.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="info">
                            {prereq}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total CLOs</span>
                    <span className="text-2xl font-bold text-primary-600">{clos.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Offerings</span>
                    <span className="text-2xl font-bold text-success-600">
                      {offerings.filter(o => o.is_active).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="text-2xl font-bold text-warning-600">
                      {offerings.reduce((sum, o) => sum + (o.enrolled_count || 0), 0)}
                    </span>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardBody className="space-y-2">
                  <Button
                    variant="outline-primary"
                    fullWidth
                    onClick={() => navigate(`/courses/${courseId}/clos`)}
                  >
                    Manage CLOs
                  </Button>
                  <Button
                    variant="outline-primary"
                    fullWidth
                    onClick={() => setActiveTab('plo-mapping')}
                  >
                    PLO Mapping
                  </Button>
                  <Button
                    variant="outline-primary"
                    fullWidth
                    onClick={() => setActiveTab('offerings')}
                  >
                    View Offerings
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* CLOs Tab */}
        {activeTab === 'clos' && (
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Learning Outcomes (CLOs)</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${courseId}/clos`)}
                    >
                      Manage CLOs
                    </Button>
                    {isAuthorized(['admin', 'hod', 'teacher']) && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={PlusIcon}
                        onClick={handleAddClo}
                      >
                        Add CLO
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {clos.length === 0 ? (
                  <EmptyState
                    title="No CLOs Defined"
                    message="Add Course Learning Outcomes to define what students should achieve."
                    actionLabel="Add CLO"
                    onAction={handleAddClo}
                  />
                ) : (
                  <div className="space-y-4">
                    {clos.map(clo => (
                      <div
                        key={clo.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-bold text-primary-600">
                                {clo.code}
                              </span>
                              {getBloomBadge(clo.bloomLevel)}
                            </div>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {clo.description}
                            </p>
                            {clo.mappedPlos && clo.mappedPlos.length > 0 && (
                              <div className="mt-3">
                                <span className="text-xs text-gray-500">Mapped to: </span>
                                <div className="inline-flex flex-wrap gap-1 mt-1">
                                  {clo.mappedPlos.map(ploCode => (
                                    <Badge key={ploCode} variant="secondary" size="sm">
                                      {ploCode}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {isAuthorized(['admin', 'hod', 'teacher']) && (
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEditClo(clo)}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Edit CLO"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeletingClo(clo)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete CLO"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Offerings Tab */}
        {activeTab === 'offerings' && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Offerings</CardTitle>
              </CardHeader>
              <CardBody>
                {offerings.length === 0 ? (
                  <EmptyState
                    title="No Offerings Yet"
                    message="This course has not been offered in any semester."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Semester
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teacher
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrollment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {offerings.map(offering => (
                          <tr key={offering.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {offering.semester_name || `${offering.session_name} - ${offering.semester_type}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Section {offering.section}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {offering.teacher_name || 'Not Assigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                                {offering.enrolled_count || 0} / {offering.max_students}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={offering.is_active ? 'active' : 'inactive'} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/course-offerings/${offering.id}`}
                                className="text-primary-600 hover:text-primary-900 font-medium"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* PLO Mapping Tab */}
        {activeTab === 'plo-mapping' && (
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>CLO-PLO Mapping Matrix</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Click cells to cycle through: Empty → Low (L) → Medium (M) → High (H) → Empty
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${courseId}/clo-plo-matrix`)}
                    >
                      Full Matrix View
                    </Button>
                    {isAuthorized(['admin', 'hod', 'teacher']) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={savePloMapping}
                      >
                        Save Mapping
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {clos.length === 0 ? (
                  <EmptyState
                    title="No CLOs to Map"
                    message="Add CLOs first before creating PLO mappings."
                    actionLabel="Go to CLOs"
                    onAction={() => setActiveTab('clos')}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                            CLO / PLO
                          </th>
                          {plos.map(plo => (
                            <th
                              key={plo.id}
                              className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                              title={plo.description}
                            >
                              {plo.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clos.map(clo => (
                          <tr key={clo.id}>
                            <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                              <div>
                                <div className="font-semibold text-primary-600">{clo.code}</div>
                                <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                  {clo.description}
                                </div>
                              </div>
                            </td>
                            {plos.map(plo => {
                              const strength = cloPlomapping[clo.id]?.[plo.id] || 0;
                              return (
                                <td
                                  key={plo.id}
                                  className="px-4 py-3 text-center border-l border-gray-200"
                                >
                                  <button
                                    onClick={() => handleMappingClick(clo.id, plo.id)}
                                    className={`
                                      w-12 h-12 rounded-lg font-semibold text-sm transition-all
                                      ${getMappingColor(strength)}
                                      ${isAuthorized(['admin', 'hod', 'teacher']) ? 'cursor-pointer' : 'cursor-default'}
                                    `}
                                    disabled={!isAuthorized(['admin', 'hod', 'teacher'])}
                                    title={`${clo.code} → ${plo.code}: ${getMappingLabel(strength) === '-' ? 'Not Mapped' : strength === 1 ? 'Low' : strength === 2 ? 'Medium' : 'High'}`}
                                  >
                                    {getMappingLabel(strength)}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Legend */}
                    <div className="mt-6 flex items-center space-x-6">
                      <span className="text-sm font-medium text-gray-700">Legend:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                          -
                        </div>
                        <span className="text-sm text-gray-600">No Mapping</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center text-xs font-semibold text-yellow-800">
                          L
                        </div>
                        <span className="text-sm text-gray-600">Low</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-800">
                          M
                        </div>
                        <span className="text-sm text-gray-600">Medium</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-xs font-semibold text-green-800">
                          H
                        </div>
                        <span className="text-sm text-gray-600">High</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* CLO Add/Edit Modal */}
      <Modal
        isOpen={showCloModal}
        onClose={() => setShowCloModal(false)}
        title={editingClo ? 'Edit CLO' : 'Add CLO'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="CLO Code"
            value={cloFormData.code}
            onChange={(e) => setCloFormData({ ...cloFormData, code: e.target.value })}
            placeholder="e.g., CLO1"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={cloFormData.description}
              onChange={(e) => setCloFormData({ ...cloFormData, description: e.target.value })}
              placeholder="Describe what students should be able to do..."
              required
            />
          </div>

          <Select
            label="Bloom's Taxonomy Level"
            value={cloFormData.bloomLevel}
            onChange={(e) => setCloFormData({ ...cloFormData, bloomLevel: e.target.value })}
            required
          >
            <option value="">Select Bloom Level</option>
            {bloomLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label} - {level.description}
              </option>
            ))}
          </Select>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowCloModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveClo}
            disabled={!cloFormData.code || !cloFormData.description || !cloFormData.bloomLevel}
          >
            {editingClo ? 'Update CLO' : 'Add CLO'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete CLO Confirmation Modal */}
      <Modal
        isOpen={!!deletingClo}
        onClose={() => setDeletingClo(null)}
        title="Delete CLO"
        size="md"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete {deletingClo?.code}?
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this CLO? This will also remove all associated PLO mappings. This action cannot be undone.
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeletingClo(null)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteClo}
            loading={deleteLoading}
            disabled={deleteLoading}
          >
            Delete CLO
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CourseDetail;
