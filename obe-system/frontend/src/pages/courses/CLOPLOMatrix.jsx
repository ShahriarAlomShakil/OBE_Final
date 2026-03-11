import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cloPloMappingService } from '../../services';
import { Button, Spinner, Alert, Card } from '../../components/ui';

/**
 * CLO-PLO Mapping Matrix Component
 * 
 * Displays an interactive matrix for mapping Course Learning Outcomes (CLOs)
 * to Program Learning Outcomes (PLOs) with mapping strengths.
 */
export default function CLOPLOMatrix() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for matrix data
  const [matrixData, setMatrixData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch matrix data
  const { data: matrixResponse, isLoading, error } = useQuery({
    queryKey: ['clo-plo-matrix', courseId],
    queryFn: async () => {
      const response = await cloPloMappingService.getMatrix(courseId);
      return response.data;
    },
    enabled: !!courseId,
    onSuccess: (data) => {
      if (data?.data?.matrix) {
        setMatrixData(data.data.matrix);
        setHasChanges(false);
      }
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (matrix) => cloPloMappingService.updateMatrix(courseId, matrix),
    onSuccess: () => {
      toast.success('CLO-PLO mappings saved successfully!');
      setHasChanges(false);
      queryClient.invalidateQueries(['clo-plo-matrix', courseId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save mappings');
    },
  });

  /**
   * Handle cell click - cycle through mapping strengths
   * Empty → 1 (Low) → 2 (Medium) → 3 (High) → Empty
   */
  const handleCellClick = (cloId, ploId) => {
    setMatrixData(prev => {
      const newMatrix = { ...prev };
      
      // Ensure the nested structure exists
      if (!newMatrix[cloId]) {
        newMatrix[cloId] = {};
      }

      const currentValue = newMatrix[cloId][ploId] || null;
      
      // Cycle through values: null → 1 → 2 → 3 → null
      let newValue;
      if (currentValue === null || currentValue === undefined) {
        newValue = 1;
      } else if (currentValue === 1) {
        newValue = 2;
      } else if (currentValue === 2) {
        newValue = 3;
      } else {
        newValue = null;
      }

      newMatrix[cloId][ploId] = newValue;
      return newMatrix;
    });

    setHasChanges(true);
  };

  /**
   * Handle dropdown change for a specific cell
   */
  const handleDropdownChange = (cloId, ploId, value) => {
    setMatrixData(prev => {
      const newMatrix = { ...prev };
      
      if (!newMatrix[cloId]) {
        newMatrix[cloId] = {};
      }

      newMatrix[cloId][ploId] = value === '' ? null : parseInt(value);
      return newMatrix;
    });

    setHasChanges(true);
  };

  /**
   * Get color class for cell based on mapping strength
   */
  const getCellColorClass = (strength) => {
    if (!strength) return 'bg-gray-100 hover:bg-gray-200';
    
    switch (strength) {
      case 1:
        return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300';
      case 2:
        return 'bg-orange-100 hover:bg-orange-200 border-orange-300';
      case 3:
        return 'bg-green-100 hover:bg-green-200 border-green-300';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  /**
   * Get text display for cell
   */
  const getCellText = (strength) => {
    if (!strength) return '';
    
    switch (strength) {
      case 1:
        return '1 - Low';
      case 2:
        return '2 - Medium';
      case 3:
        return '3 - High';
      default:
        return '';
    }
  };

  /**
   * Handle save button click
   */
  const handleSave = () => {
    saveMutation.mutate(matrixData);
  };

  /**
   * Handle reset - reload original data
   */
  const handleReset = () => {
    if (matrixResponse?.data?.matrix) {
      setMatrixData(matrixResponse.data.matrix);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" title="Error Loading Matrix">
          {error.response?.data?.message || 'Failed to load CLO-PLO mapping matrix'}
        </Alert>
      </div>
    );
  }

  const { course, clos, plos } = matrixResponse?.data || {};

  if (!clos || clos.length === 0) {
    return (
      <div className="p-6">
        <Alert type="warning" title="No CLOs Found">
          This course has no CLOs defined yet. Please add CLOs before creating mappings.
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate(`/courses/${courseId}/clos`)}>
            Go to CLO Management
          </Button>
        </div>
      </div>
    );
  }

  if (!plos || plos.length === 0) {
    return (
      <div className="p-6">
        <Alert type="warning" title="No PLOs Found">
          The degree program has no PLOs defined yet. Please add PLOs before creating mappings.
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/plos')}>
            Go to PLO Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CLO-PLO Mapping Matrix</h1>
          <p className="text-gray-600 mt-1">
            {course?.code} - {course?.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Back to Course
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Click on any cell to cycle through mapping strengths: Empty → Low (1) → Medium (2) → High (3) → Empty</li>
            <li>Or use the dropdown in each cell to select a specific strength</li>
            <li>Hover over PLO column headers to see full descriptions</li>
            <li>Click "Save Changes" to persist your mappings</li>
          </ul>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs">
            Empty
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center text-xs font-medium">
            1 - Low
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-8 bg-orange-100 border border-orange-300 rounded flex items-center justify-center text-xs font-medium">
            2 - Medium
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-green-100 border border-green-300 rounded flex items-center justify-center text-xs font-medium">
            3 - High
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  CLO / PLO
                </th>
                {plos.map((plo) => (
                  <th
                    key={plo.id}
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[140px]"
                    title={plo.description}
                  >
                    <div className="group relative">
                      <div className="cursor-help">{plo.plo_code}</div>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-20 pointer-events-none">
                        <div className="font-semibold mb-1">{plo.plo_code}</div>
                        <div className="text-gray-200">{plo.description}</div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clos.map((clo, rowIndex) => (
                <tr key={clo.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{clo.clo_code}</span>
                      <span className="text-xs text-gray-600 mt-0.5 line-clamp-2" title={clo.description}>
                        {clo.description}
                      </span>
                    </div>
                  </td>
                  {plos.map((plo) => {
                    const strength = matrixData[clo.id]?.[plo.id] || null;
                    
                    return (
                      <td key={plo.id} className="px-2 py-2 text-center">
                        <div className="flex flex-col gap-1">
                          {/* Clickable cell */}
                          <button
                            onClick={() => handleCellClick(clo.id, plo.id)}
                            className={`
                              w-full h-12 rounded-md border-2 transition-all duration-200
                              flex items-center justify-center text-xs font-medium
                              ${getCellColorClass(strength)}
                              ${strength ? 'border-current' : 'border-gray-300'}
                            `}
                          >
                            {getCellText(strength)}
                          </button>
                          
                          {/* Dropdown selector */}
                          <select
                            value={strength || ''}
                            onChange={(e) => handleDropdownChange(clo.id, plo.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Empty</option>
                            <option value="1">1 - Low</option>
                            <option value="2">2 - Medium</option>
                            <option value="3">3 - High</option>
                          </select>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={!hasChanges || saveMutation.isPending}
          >
            Reset Changes
          </Button>
          <Button
            variant="success"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total CLOs</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{clos?.length || 0}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total PLOs</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{plos?.length || 0}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Mappings</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {Object.values(matrixData).reduce((total, cloMappings) => {
                return total + Object.values(cloMappings).filter(v => v !== null).length;
              }, 0)}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Coverage</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {clos?.length && plos?.length
                ? Math.round(
                    (Object.values(matrixData).reduce((total, cloMappings) => {
                      return total + Object.values(cloMappings).filter(v => v !== null).length;
                    }, 0) /
                      (clos.length * plos.length)) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </Card>
      </div>

      {/* Mapping Summary */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Mapping Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <div>
                <div className="text-xs text-gray-600">Low Strength</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Object.values(matrixData).reduce((total, cloMappings) => {
                    return total + Object.values(cloMappings).filter(v => v === 1).length;
                  }, 0)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
              <div>
                <div className="text-xs text-gray-600">Medium Strength</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Object.values(matrixData).reduce((total, cloMappings) => {
                    return total + Object.values(cloMappings).filter(v => v === 2).length;
                  }, 0)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <div>
                <div className="text-xs text-gray-600">High Strength</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Object.values(matrixData).reduce((total, cloMappings) => {
                    return total + Object.values(cloMappings).filter(v => v === 3).length;
                  }, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CLO and PLO Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLO List */}
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Course Learning Outcomes (CLOs)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clos.map((clo) => (
                <div key={clo.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-blue-600">{clo.clo_code}</div>
                  <div className="text-sm text-gray-700 mt-1">{clo.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mapped to {Object.values(matrixData[clo.id] || {}).filter(v => v !== null).length} PLO(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* PLO List */}
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Program Learning Outcomes (PLOs)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {plos.map((plo) => {
                const mappedCLOCount = clos.filter(clo => 
                  matrixData[clo.id]?.[plo.id] !== null && matrixData[clo.id]?.[plo.id] !== undefined
                ).length;
                
                return (
                  <div key={plo.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-indigo-600">{plo.plo_code}</div>
                    <div className="text-sm text-gray-700 mt-1">{plo.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Mapped from {mappedCLOCount} CLO(s)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
