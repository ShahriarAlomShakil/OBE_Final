import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { assessmentService, cloService } from '@/services';
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
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

/**
 * Assessment List Page
 * 
 * Manages assessments for a specific course offering.
 * Features:
 * - List assessments with details
 * - Add new assessment with CLO mapping
 * - Edit existing assessment
 * - Delete assessment with confirmation
 * - Weightage validation (total must = 100%)
 * - CLO marks allocation
 */
const AssessmentList = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();

  // State management
  const [courseOffering, setCourseOffering] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [courseCLOs, setCourseCLOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCLOMappingModalOpen, setIsCLOMappingModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    assessment_type_id: '',
    total_marks: '',
    weightage: '',
    date: '',
    description: ''
  });
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [deletingAssessment, setDeletingAssessment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // CLO Mapping states
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [cloMappings, setCloMappings] = useState([]);
  const [mappingError, setMappingError] = useState(null);

  // Statistics
  const [totalWeightage, setTotalWeightage] = useState(0);
  const [weightageStatus, setWeightageStatus] = useState('incomplete');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [courseOfferingId]);

  // Calculate total weightage
  useEffect(() => {
    const total = assessments.reduce((sum, assessment) => sum + parseFloat(assessment.weightage || 0), 0);
    setTotalWeightage(total);
    
    if (total === 100) {
      setWeightageStatus('complete');
    } else if (total > 100) {
      setWeightageStatus('exceeded');
    } else {
      setWeightageStatus('incomplete');
    }
  }, [assessments]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assessments, types, and CLOs in parallel
      const [assessmentsRes, typesRes] = await Promise.all([
        assessmentService.getByCourseOffering(courseOfferingId),
        assessmentService.getTypes()
      ]);

      setAssessments(assessmentsRes.data || []);
      setAssessmentTypes(typesRes.data || []);

      // Get course ID from first assessment or fetch course offering details
      if (assessmentsRes.data && assessmentsRes.data.length > 0) {
        const courseId = assessmentsRes.data[0].course_id;
        const closRes = await cloService.getByCourse(courseId);
        setCourseCLOs(closRes.data || []);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Assessment name is required');
      return false;
    }
    if (!formData.assessment_type_id) {
      setFormError('Assessment type is required');
      return false;
    }
    if (!formData.total_marks || formData.total_marks <= 0) {
      setFormError('Total marks must be greater than 0');
      return false;
    }
    if (!formData.weightage || formData.weightage <= 0 || formData.weightage > 100) {
      setFormError('Weightage must be between 0 and 100');
      return false;
    }

    // Check if adding this weightage would exceed 100%
    if (!editingAssessment) {
      const newTotal = totalWeightage + parseFloat(formData.weightage);
      if (newTotal > 100) {
        setFormError(`Total weightage would exceed 100% (currently ${totalWeightage}%)`);
        return false;
      }
    } else {
      // When editing, subtract the old weightage first
      const otherWeightage = totalWeightage - parseFloat(editingAssessment.weightage);
      const newTotal = otherWeightage + parseFloat(formData.weightage);
      if (newTotal > 100) {
        setFormError(`Total weightage would exceed 100% (currently ${otherWeightage}% without this assessment)`);
        return false;
      }
    }

    if (!formData.date) {
      setFormError('Assessment date is required');
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      assessment_type_id: '',
      total_marks: '',
      weightage: '',
      date: '',
      description: ''
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      name: assessment.name,
      assessment_type_id: assessment.assessment_type_id,
      total_marks: assessment.total_marks,
      weightage: assessment.weightage,
      date: assessment.date ? assessment.date.split('T')[0] : '',
      description: assessment.description || ''
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = (assessment) => {
    setDeletingAssessment(assessment);
    setIsDeleteModalOpen(true);
  };

  const handleMapCLOs = async (assessment) => {
    try {
      setSelectedAssessment(assessment);
      setMappingError(null);

      // Load CLOs if not already loaded
      if (courseCLOs.length === 0 && assessment.course_id) {
        const closRes = await cloService.getByCourse(assessment.course_id);
        setCourseCLOs(closRes.data || []);
      }

      // Load existing mappings
      const mappingsRes = await assessmentService.getCLOMappings(assessment.id);
      const existingMappings = mappingsRes.data || [];

      // Initialize mappings for all CLOs
      const initialMappings = courseCLOs.map(clo => {
        const existing = existingMappings.find(m => m.clo_id === clo.id);
        return {
          clo_id: clo.id,
          clo_code: clo.code,
          clo_description: clo.description,
          marks_allocated: existing ? existing.marks_allocated : 0,
          mapping_id: existing ? existing.id : null
        };
      });

      setCloMappings(initialMappings);
      setIsCLOMappingModalOpen(true);
    } catch (err) {
      console.error('Error loading CLO mappings:', err);
      setError(err.response?.data?.message || 'Failed to load CLO mappings');
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const data = {
        ...formData,
        course_offering_id: parseInt(courseOfferingId),
        assessment_type_id: parseInt(formData.assessment_type_id),
        total_marks: parseFloat(formData.total_marks),
        weightage: parseFloat(formData.weightage)
      };

      await assessmentService.create(data);
      
      setSuccessMessage('Assessment created successfully');
      setIsAddModalOpen(false);
      loadData();

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error creating assessment:', err);
      setFormError(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const data = {
        name: formData.name,
        assessment_type_id: parseInt(formData.assessment_type_id),
        total_marks: parseFloat(formData.total_marks),
        weightage: parseFloat(formData.weightage),
        date: formData.date,
        description: formData.description
      };

      await assessmentService.update(editingAssessment.id, data);
      
      setSuccessMessage('Assessment updated successfully');
      setIsEditModalOpen(false);
      setEditingAssessment(null);
      loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating assessment:', err);
      setFormError(err.response?.data?.message || 'Failed to update assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);

      await assessmentService.delete(deletingAssessment.id);
      
      setSuccessMessage('Assessment deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingAssessment(null);
      loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError(err.response?.data?.message || 'Failed to delete assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCLOMappingChange = (cloId, marks) => {
    setCloMappings(prev => prev.map(mapping => 
      mapping.clo_id === cloId 
        ? { ...mapping, marks_allocated: parseFloat(marks) || 0 }
        : mapping
    ));
    setMappingError(null);
  };

  const validateCLOMappings = () => {
    const totalAllocated = cloMappings.reduce((sum, m) => sum + (parseFloat(m.marks_allocated) || 0), 0);
    const assessmentTotal = parseFloat(selectedAssessment.total_marks);

    if (totalAllocated !== assessmentTotal) {
      setMappingError(
        `Total marks allocated (${totalAllocated}) must equal assessment total marks (${assessmentTotal})`
      );
      return false;
    }

    // Check that at least one CLO has marks
    const hasAllocations = cloMappings.some(m => m.marks_allocated > 0);
    if (!hasAllocations) {
      setMappingError('At least one CLO must have marks allocated');
      return false;
    }

    return true;
  };

  const handleSubmitCLOMapping = async (e) => {
    e.preventDefault();

    if (!validateCLOMappings()) {
      return;
    }

    try {
      setSubmitting(true);
      setMappingError(null);

      // Filter mappings with marks > 0
      const mappingsToSave = cloMappings
        .filter(m => m.marks_allocated > 0)
        .map(m => ({
          clo_id: m.clo_id,
          marks_allocated: m.marks_allocated
        }));

      await assessmentService.mapCLOs(selectedAssessment.id, mappingsToSave);
      
      setSuccessMessage('CLO mappings saved successfully');
      setIsCLOMappingModalOpen(false);
      setSelectedAssessment(null);
      loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving CLO mappings:', err);
      setMappingError(err.response?.data?.message || 'Failed to save CLO mappings');
    } finally {
      setSubmitting(false);
    }
  };

  const getAssessmentTypeName = (typeId) => {
    const type = assessmentTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const getAssessmentTypeColor = (typeName) => {
    const colors = {
      'Quiz': 'info',
      'Assignment': 'primary',
      'Midterm': 'warning',
      'Final': 'danger',
      'Project': 'success',
      'Lab': 'secondary',
      'Presentation': 'info'
    };
    return colors[typeName] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeightageStatusColor = () => {
    if (weightageStatus === 'complete') return 'success';
    if (weightageStatus === 'exceeded') return 'danger';
    return 'warning';
  };

  const getWeightageStatusText = () => {
    if (weightageStatus === 'complete') return 'Complete';
    if (weightageStatus === 'exceeded') return 'Exceeded';
    return 'Incomplete';
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
  if (error && !successMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  const totalAllocatedInMapping = cloMappings.reduce((sum, m) => sum + (parseFloat(m.marks_allocated) || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Course Offerings', href: '/course-offerings' },
          { label: courseOffering?.course_code || 'Course', href: `/course-offerings/${courseOfferingId}` },
          { label: 'Assessments' }
        ]}
      />

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            Assessment Management
          </h1>
          <p className="text-gray-600 mt-1">
            {courseOffering?.course_code || 'Course'} - {courseOffering?.course_title || 'Loading...'}
          </p>
        </div>
        {isAuthorized(['admin', 'teacher']) && (
          <Button onClick={handleAdd} variant="primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Assessment
          </Button>
        )}
      </div>

      {/* Weightage Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600">{assessments.length}</div>
            <div className="text-gray-600 text-sm mt-1">Total Assessments</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className={`text-3xl font-bold ${
              weightageStatus === 'complete' ? 'text-green-600' :
              weightageStatus === 'exceeded' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {totalWeightage.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm mt-1">Total Weightage</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-gray-700">
              {totalWeightage < 100 ? (100 - totalWeightage).toFixed(1) : 0}%
            </div>
            <div className="text-gray-600 text-sm mt-1">Remaining</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Badge variant={getWeightageStatusColor()} className="text-base px-4 py-2">
              {weightageStatus === 'complete' && <CheckCircleIcon className="h-5 w-5 inline mr-1" />}
              {weightageStatus === 'exceeded' && <ExclamationTriangleIcon className="h-5 w-5 inline mr-1" />}
              {getWeightageStatusText()}
            </Badge>
          </CardBody>
        </Card>
      </div>

      {/* Weightage Warning */}
      {weightageStatus === 'exceeded' && (
        <Alert variant="danger" className="mb-6">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Total weightage exceeds 100%. Please adjust assessment weightages.
        </Alert>
      )}
      {weightageStatus === 'incomplete' && assessments.length > 0 && (
        <Alert variant="warning" className="mb-6">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Total weightage is {totalWeightage.toFixed(1)}%. Add more assessments to reach 100%.
        </Alert>
      )}

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments</CardTitle>
        </CardHeader>
        <CardBody>
          {assessments.length === 0 ? (
            <EmptyState
              icon={ClipboardDocumentListIcon}
              title="No Assessments"
              description="No assessments have been added for this course offering yet."
              action={isAuthorized(['admin', 'teacher']) ? (
                <Button onClick={handleAdd} variant="primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add First Assessment
                </Button>
              ) : null}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weightage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CLOs Mapped
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{assessment.name}</div>
                        {assessment.description && (
                          <div className="text-sm text-gray-500">{assessment.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getAssessmentTypeColor(getAssessmentTypeName(assessment.assessment_type_id))}>
                          {getAssessmentTypeName(assessment.assessment_type_id)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {assessment.total_marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">{assessment.weightage}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(assessment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMapCLOs(assessment)}
                        >
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          {assessment.clo_count || 0} CLOs
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {isAuthorized(['admin', 'teacher']) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(assessment)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(assessment)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Assessment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Add New Assessment"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd}>
          <div className="space-y-4">
            {formError && (
              <Alert variant="danger">
                {formError}
              </Alert>
            )}

            <Input
              label="Assessment Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Quiz 1, Midterm Exam"
              required
              disabled={submitting}
            />

            <Select
              label="Assessment Type"
              name="assessment_type_id"
              value={formData.assessment_type_id}
              onChange={handleInputChange}
              required
              disabled={submitting}
            >
              <option value="">Select Type</option>
              {assessmentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Marks"
                name="total_marks"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_marks}
                onChange={handleInputChange}
                placeholder="100"
                required
                disabled={submitting}
              />

              <Input
                label="Weightage (%)"
                name="weightage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.weightage}
                onChange={handleInputChange}
                placeholder="20"
                required
                disabled={submitting}
                helperText={`Current total: ${totalWeightage.toFixed(1)}%`}
              />
            </div>

            <Input
              label="Assessment Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional details about this assessment..."
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : <PlusIcon className="h-5 w-5 mr-2" />}
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Assessment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title="Edit Assessment"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit}>
          <div className="space-y-4">
            {formError && (
              <Alert variant="danger">
                {formError}
              </Alert>
            )}

            <Input
              label="Assessment Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Quiz 1, Midterm Exam"
              required
              disabled={submitting}
            />

            <Select
              label="Assessment Type"
              name="assessment_type_id"
              value={formData.assessment_type_id}
              onChange={handleInputChange}
              required
              disabled={submitting}
            >
              <option value="">Select Type</option>
              {assessmentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Marks"
                name="total_marks"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_marks}
                onChange={handleInputChange}
                placeholder="100"
                required
                disabled={submitting}
              />

              <Input
                label="Weightage (%)"
                name="weightage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.weightage}
                onChange={handleInputChange}
                placeholder="20"
                required
                disabled={submitting}
                helperText={`Without this: ${(totalWeightage - (editingAssessment?.weightage || 0)).toFixed(1)}%`}
              />
            </div>

            <Input
              label="Assessment Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              disabled={submitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional details about this assessment..."
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              Update Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Delete Assessment"
        size="md"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Are you sure you want to delete this assessment?
          </Alert>
          
          {deletingAssessment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900">{deletingAssessment.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                Type: {getAssessmentTypeName(deletingAssessment.assessment_type_id)} | 
                Total Marks: {deletingAssessment.total_marks} | 
                Weightage: {deletingAssessment.weightage}%
              </div>
            </div>
          )}

          <p className="text-gray-700">
            This action cannot be undone. All associated CLO mappings and student marks will also be deleted.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : <TrashIcon className="h-5 w-5 mr-2" />}
              Delete Assessment
            </Button>
          </div>
        </div>
      </Modal>

      {/* CLO Mapping Modal */}
      <Modal
        isOpen={isCLOMappingModalOpen}
        onClose={() => !submitting && setIsCLOMappingModalOpen(false)}
        title="Map CLOs to Assessment"
        size="xl"
      >
        <form onSubmit={handleSubmitCLOMapping}>
          <div className="space-y-4">
            {mappingError && (
              <Alert variant="danger">
                {mappingError}
              </Alert>
            )}

            {selectedAssessment && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900">{selectedAssessment.name}</div>
                <div className="text-sm text-blue-700 mt-1">
                  Total Marks: {selectedAssessment.total_marks} | 
                  Type: {getAssessmentTypeName(selectedAssessment.assessment_type_id)} | 
                  Date: {formatDate(selectedAssessment.date)}
                </div>
              </div>
            )}

            {courseCLOs.length === 0 ? (
              <Alert variant="warning">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                No CLOs found for this course. Please add CLOs first.
              </Alert>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Marks Allocation Instructions</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Allocate marks from this assessment to each CLO it measures</li>
                    <li>Total marks allocated must equal the assessment total marks ({selectedAssessment?.total_marks})</li>
                    <li>Leave marks as 0 for CLOs not measured by this assessment</li>
                  </ul>
                </div>

                {/* CLO Mapping Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                          CLO Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                          Marks Allocated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cloMappings.map((mapping) => (
                        <tr key={mapping.clo_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="primary">{mapping.clo_code}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {mapping.clo_description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <input
                              type="number"
                              min="0"
                              max={selectedAssessment?.total_marks}
                              step="0.01"
                              value={mapping.marks_allocated}
                              onChange={(e) => handleCLOMappingChange(mapping.clo_id, e.target.value)}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={submitting}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan="2" className="px-4 py-3 text-right text-gray-700">
                          Total Allocated:
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-lg font-bold ${
                            totalAllocatedInMapping === parseFloat(selectedAssessment?.total_marks)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {totalAllocatedInMapping.toFixed(2)} / {selectedAssessment?.total_marks}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Validation Status */}
                {selectedAssessment && (
                  <div className={`p-3 rounded-lg ${
                    totalAllocatedInMapping === parseFloat(selectedAssessment.total_marks)
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}>
                    {totalAllocatedInMapping === parseFloat(selectedAssessment.total_marks) ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Marks allocation is valid. Ready to save.
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        {totalAllocatedInMapping < parseFloat(selectedAssessment.total_marks)
                          ? `Still need to allocate ${(parseFloat(selectedAssessment.total_marks) - totalAllocatedInMapping).toFixed(2)} marks`
                          : `Over-allocated by ${(totalAllocatedInMapping - parseFloat(selectedAssessment.total_marks)).toFixed(2)} marks`
                        }
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCLOMappingModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || courseCLOs.length === 0}
            >
              {submitting ? <Spinner size="sm" className="mr-2" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              Save CLO Mappings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssessmentList;
