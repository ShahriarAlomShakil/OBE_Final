import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { cloService, courseService } from '@/services';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Modal,
  Input,
  Select,
  Badge,
  Alert,
  Spinner,
  EmptyState,
  Breadcrumb
} from '@/components/ui';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

/**
 * CLO Management Page
 * 
 * Manages Course Learning Outcomes (CLOs) for a specific course.
 * Features:
 * - List CLOs in card format
 * - Add new CLO with auto-increment code
 * - Edit existing CLO
 * - Delete CLO with confirmation
 * - Bloom taxonomy level display
 * - Role-based access control
 */
const CLOManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  // State management
  const [course, setCourse] = useState(null);
  const [clos, setClos] = useState([]);
  const [bloomLevels, setBloomLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    bloom_level_id: ''
  });
  const [editingCLO, setEditingCLO] = useState(null);
  const [deletingCLO, setDeletingCLO] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Bloom level color mapping
  const getBloomColor = (levelId) => {
    const colors = {
      1: 'default',
      2: 'primary',
      3: 'info',
      4: 'warning',
      5: 'secondary',
      6: 'success'
    };
    return colors[levelId] || 'default';
  };

  // Fetch course, CLOs, and Bloom levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch course details, CLOs, and Bloom levels in parallel
        const [courseResponse, closResponse, bloomResponse] = await Promise.all([
          courseService.getWithDepartment(courseId),
          cloService.getByCourse(courseId),
          cloService.getBloomLevels()
        ]);
        
        setCourse(courseResponse.data.data);
        setClos(closResponse.data.data || []);
        setBloomLevels(bloomResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching CLO data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load CLOs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Check authorization
  useEffect(() => {
    if (!loading && !isAuthorized(['admin', 'hod', 'teacher'])) {
      navigate('/unauthorized');
    }
  }, [loading, isAuthorized, navigate]);

  // Get Bloom level details
  const getBloomLevel = (bloomLevelId) => {
    return bloomLevels.find(level => level.id === bloomLevelId) || bloomLevels[0];
  };

  // Generate next CLO code
  const getNextCLOCode = () => {
    if (clos.length === 0) return 'CLO1';
    const lastNumber = Math.max(...clos.map(clo => parseInt(clo.code.replace('CLO', '')) || 0));
    return `CLO${lastNumber + 1}`;
  };

  // Handle Add CLO
  const handleAddClick = () => {
    setFormData({
      code: getNextCLOCode(),
      description: '',
      bloom_level_id: ''
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handle Edit CLO
  const handleEditClick = (clo) => {
    setEditingCLO(clo);
    setFormData({
      code: clo.code,
      description: clo.description,
      bloom_level_id: clo.bloom_level_id
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Delete CLO
  const handleDeleteClick = (clo) => {
    setDeletingCLO(clo);
    setIsDeleteModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.code.trim()) {
      setFormError('CLO code is required');
      return false;
    }
    if (!formData.description.trim()) {
      setFormError('CLO description is required');
      return false;
    }
    if (!formData.bloom_level_id) {
      setFormError('Bloom taxonomy level is required');
      return false;
    }
    return true;
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError(null);

      // Call API to create CLO
      const response = await cloService.create(courseId, {
        ...formData,
        bloom_level_id: parseInt(formData.bloom_level_id),
        order: clos.length + 1
      });

      // Add to local state
      const newCLO = response.data.data;
      setClos([...clos, newCLO]);

      // Close modal and show success
      setIsAddModalOpen(false);
      setSuccessMessage('CLO added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding CLO:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to add CLO');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setFormError(null);

      // Call API to update CLO
      const response = await cloService.update(editingCLO.id, {
        ...formData,
        bloom_level_id: parseInt(formData.bloom_level_id)
      });

      // Update local state
      const updatedCLO = response.data.data;
      setClos(clos.map(clo => 
        clo.id === editingCLO.id ? updatedCLO : clo
      ));

      // Close modal and show success
      setIsEditModalOpen(false);
      setEditingCLO(null);
      setSuccessMessage('CLO updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating CLO:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to update CLO');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      // Call API to delete CLO
      await cloService.delete(deletingCLO.id);

      // Remove from local state
      setClos(clos.filter(clo => clo.id !== deletingCLO.id));

      // Close modal and show success
      setIsDeleteModalOpen(false);
      setDeletingCLO(null);
      setSuccessMessage('CLO deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting CLO:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to delete CLO');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingCLO(null);
    setDeletingCLO(null);
    setFormError(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" title="Error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Courses', href: '/courses' },
          { label: course?.code || 'Course', href: `/courses/${courseId}` },
          { label: 'CLO Management' }
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-primary-600" />
            CLO Management
          </h1>
          <p className="text-gray-600 mt-1">
            {course?.code} - {course?.title} | {course?.department?.name || course?.department || 'N/A'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={PlusIcon}
          onClick={handleAddClick}
        >
          Add CLO
        </Button>
      </div>

      {/* CLO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{clos.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total CLOs</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">
                {clos.filter(clo => clo.bloom_level_id >= 4).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Higher-Order CLOs</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-3xl font-bold text-info-600">
                {clos.length > 0 
                  ? Math.round(clos.reduce((sum, clo) => sum + clo.bloom_level_id, 0) / clos.length * 10) / 10
                  : 0
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Bloom Level</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* CLO List */}
      {clos.length === 0 ? (
        <EmptyState
          icon={AcademicCapIcon}
          title="No CLOs Added Yet"
          message="Start by adding Course Learning Outcomes for this course"
          actionLabel="Add First CLO"
          onAction={handleAddClick}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {clos.map((clo, index) => {
            const bloomLevel = getBloomLevel(clo.bloom_level_id);
            return (
              <Card key={clo.id} className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between">
                    {/* CLO Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-900">{clo.code}</span>
                        <Badge variant={getBloomColor(clo.bloom_level_id)}>
                          {bloomLevel.level_name || bloomLevel.name} (Level {bloomLevel.level_number || clo.bloom_level_id})
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Order: {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{clo.description}</p>
                      <p className="text-sm text-gray-500 italic mt-2">
                        Bloom Level: {bloomLevel.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={PencilIcon}
                        onClick={() => handleEditClick(clo)}
                        title="Edit CLO"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                        onClick={() => handleDeleteClick(clo)}
                        title="Delete CLO"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bloom Taxonomy Legend */}
      {clos.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bloom's Taxonomy Levels</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloomLevels.map((level) => (
                <div key={level.id} className="flex items-center gap-3">
                  <Badge variant={getBloomColor(level.level_number || level.id)}>Level {level.level_number || level.id}</Badge>
                  <div>
                    <div className="font-semibold text-gray-900">{level.level_name || level.name}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add CLO Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        title="Add New CLO"
        size="lg"
      >
        <form onSubmit={handleAddSubmit}>
          {formError && (
            <Alert type="error" className="mb-4" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <div className="space-y-4">
            {/* CLO Code */}
            <Input
              label="CLO Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="CLO1, CLO2, etc."
              required
              icon={AcademicCapIcon}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what students should be able to do after completing this course..."
                required
              />
            </div>

            {/* Bloom Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bloom Taxonomy Level <span className="text-red-500">*</span>
              </label>
              <select
                name="bloom_level_id"
                value={formData.bloom_level_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Bloom Level</option>
                {bloomLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    Level {level.level_number || level.id} - {level.level_name || level.name} ({level.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {submitting ? 'Adding...' : 'Add CLO'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit CLO Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        title="Edit CLO"
        size="lg"
      >
        <form onSubmit={handleEditSubmit}>
          {formError && (
            <Alert type="error" className="mb-4" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <div className="space-y-4">
            {/* CLO Code */}
            <Input
              label="CLO Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="CLO1, CLO2, etc."
              required
              icon={AcademicCapIcon}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what students should be able to do after completing this course..."
                required
              />
            </div>

            {/* Bloom Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bloom Taxonomy Level <span className="text-red-500">*</span>
              </label>
              <select
                name="bloom_level_id"
                value={formData.bloom_level_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Bloom Level</option>
                {bloomLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    Level {level.level_number || level.id} - {level.level_name || level.name} ({level.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {submitting ? 'Updating...' : 'Update CLO'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        title="Delete CLO"
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete {deletingCLO?.code}?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this CLO? This action cannot be undone.
            All associated mappings and data will be removed.
          </p>
          {formError && (
            <Alert type="error" className="mb-4" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleModalClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            loading={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete CLO'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CLOManagement;
