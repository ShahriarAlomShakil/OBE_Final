# Attainment Threshold Settings API

## Overview
The Attainment Threshold Settings API provides endpoints for managing CLO and PLO attainment thresholds. These thresholds define the minimum, target, and excellence percentages required for different levels of attainment.

## Base URL
```
/api/v1/settings/thresholds
```

## Authentication
All endpoints require authentication. Create and update operations require Admin or HOD roles.

## Endpoints

### 1. Get All Thresholds
```http
GET /api/v1/settings/thresholds
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Success",
  "meta": {
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 10,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Thresholds by Degree
```http
GET /api/v1/settings/thresholds/degree/:degreeId
```

**Parameters:**
- `degreeId` (required): Degree ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "degree_id": 5,
      "threshold_type": "clo",
      "minimum_percentage": 60.00,
      "target_percentage": 75.00,
      "excellence_percentage": 85.00,
      "degree_name": "Bachelor of Science in Computer Science",
      "degree_short_name": "BS(CS)",
      "from_session_code": "2023-2024",
      "to_session_code": null
    },
    {
      "id": 2,
      "degree_id": 5,
      "threshold_type": "plo",
      "minimum_percentage": 60.00,
      "target_percentage": 70.00,
      "excellence_percentage": 85.00,
      "degree_name": "Bachelor of Science in Computer Science",
      "degree_short_name": "BS(CS)",
      "from_session_code": "2023-2024",
      "to_session_code": null
    }
  ],
  "message": "Thresholds retrieved successfully"
}
```

### 3. Get Current Active Thresholds
```http
GET /api/v1/settings/thresholds/degree/:degreeId/current
```

**Parameters:**
- `degreeId` (required): Degree ID

**Response:**
```json
{
  "success": true,
  "data": {
    "clo": {
      "id": 1,
      "degree_id": 5,
      "threshold_type": "clo",
      "minimum_percentage": 60.00,
      "target_percentage": 75.00,
      "excellence_percentage": 85.00,
      "from_session_code": "2023-2024"
    },
    "plo": {
      "id": 2,
      "degree_id": 5,
      "threshold_type": "plo",
      "minimum_percentage": 60.00,
      "target_percentage": 70.00,
      "excellence_percentage": 85.00,
      "from_session_code": "2023-2024"
    }
  },
  "message": "Current thresholds retrieved successfully"
}
```

### 4. Get Threshold by Type
```http
GET /api/v1/settings/thresholds/degree/:degreeId/type/:type
```

**Parameters:**
- `degreeId` (required): Degree ID
- `type` (required): 'clo' or 'plo'

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "degree_id": 5,
    "threshold_type": "clo",
    "minimum_percentage": 60.00,
    "target_percentage": 75.00,
    "excellence_percentage": 85.00,
    "degree_name": "Bachelor of Science in Computer Science",
    "from_session_code": "2023-2024",
    "to_session_code": null
  },
  "message": "Threshold retrieved successfully"
}
```

### 5. Get Historical Thresholds
```http
GET /api/v1/settings/thresholds/degree/:degreeId/history
```

**Parameters:**
- `degreeId` (required): Degree ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "degree_id": 5,
      "threshold_type": "clo",
      "minimum_percentage": 55.00,
      "target_percentage": 70.00,
      "excellence_percentage": 80.00,
      "from_session_code": "2021-2022",
      "to_session_code": "2022-2023"
    },
    {
      "id": 1,
      "degree_id": 5,
      "threshold_type": "clo",
      "minimum_percentage": 60.00,
      "target_percentage": 75.00,
      "excellence_percentage": 85.00,
      "from_session_code": "2023-2024",
      "to_session_code": null
    }
  ],
  "message": "Historical thresholds retrieved successfully"
}
```

### 6. Create Threshold
```http
POST /api/v1/settings/thresholds
```

**Authorization:** Admin, HOD only

**Request Body:**
```json
{
  "degree_id": 5,
  "threshold_type": "clo",
  "minimum_percentage": 60.00,
  "target_percentage": 75.00,
  "excellence_percentage": 85.00,
  "effective_from_session_id": 10,
  "effective_to_session_id": null
}
```

**Validation Rules:**
- `degree_id`: Required, integer >= 1
- `threshold_type`: Required, must be 'clo' or 'plo'
- `minimum_percentage`: Optional, float 0-100
- `target_percentage`: Optional, float 0-100
- `excellence_percentage`: Optional, float 0-100
- `effective_from_session_id`: Required, integer >= 1
- `effective_to_session_id`: Optional, integer >= 1
- Constraint: minimum <= target <= excellence

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "degree_id": 5,
    "threshold_type": "clo",
    "minimum_percentage": 60.00,
    "target_percentage": 75.00,
    "excellence_percentage": 85.00,
    "effective_from_session_id": 10,
    "effective_to_session_id": null,
    "created_at": "2026-02-04T10:30:00.000Z",
    "updated_at": "2026-02-04T10:30:00.000Z"
  },
  "message": "Threshold created successfully"
}
```

### 7. Update Threshold
```http
PUT /api/v1/settings/thresholds/:id
```

**Authorization:** Admin, HOD only

**Parameters:**
- `id` (required): Threshold ID

**Request Body:** (all fields optional)
```json
{
  "minimum_percentage": 65.00,
  "target_percentage": 80.00,
  "excellence_percentage": 90.00,
  "effective_from_session_id": 11,
  "effective_to_session_id": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "degree_id": 5,
    "threshold_type": "clo",
    "minimum_percentage": 65.00,
    "target_percentage": 80.00,
    "excellence_percentage": 90.00,
    "effective_from_session_id": 11,
    "effective_to_session_id": 15,
    "updated_at": "2026-02-04T11:00:00.000Z"
  },
  "message": "Threshold updated successfully"
}
```

### 8. Check Attainment
```http
POST /api/v1/settings/thresholds/check-attainment
```

**Request Body:**
```json
{
  "degree_id": 5,
  "threshold_type": "clo",
  "achieved_percentage": 78.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threshold_type": "clo",
    "achieved_percentage": 78.5,
    "minimum_percentage": 60.00,
    "target_percentage": 75.00,
    "excellence_percentage": 85.00,
    "status": "target",
    "level": "Target Attained",
    "is_attained": true
  },
  "message": "Attainment status checked successfully"
}
```

**Attainment Levels:**
- `below_minimum`: Achieved < Minimum (Not Attained)
- `minimum`: Minimum <= Achieved < Target (Minimum Attained)
- `target`: Target <= Achieved < Excellence (Target Attained)
- `excellence`: Achieved >= Excellence (Excellence)

### 9. Get Threshold by ID
```http
GET /api/v1/settings/thresholds/:id
```

**Parameters:**
- `id` (required): Threshold ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "degree_id": 5,
    "threshold_type": "clo",
    "minimum_percentage": 60.00,
    "target_percentage": 75.00,
    "excellence_percentage": 85.00,
    "effective_from_session_id": 10,
    "effective_to_session_id": null,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-02-04T11:00:00.000Z"
  },
  "message": "Success"
}
```

### 10. Delete Threshold
```http
DELETE /api/v1/settings/thresholds/:id
```

**Authorization:** Admin only

**Parameters:**
- `id` (required): Threshold ID

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Threshold deleted successfully"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "degree_id",
        "message": "Valid degree_id is required"
      }
    ]
  }
}
```

### Invalid Percentages
```json
{
  "success": false,
  "error": {
    "message": "Invalid percentage values",
    "code": "INVALID_PERCENTAGES",
    "details": [
      "minimum_percentage cannot be greater than target_percentage"
    ]
  }
}
```

### Not Found
```json
{
  "success": false,
  "error": {
    "message": "No CLO threshold found for this degree",
    "code": "THRESHOLD_NOT_FOUND"
  }
}
```

### Rate Limit
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

## Default Thresholds

When seeded, the system creates default thresholds for each degree:

**CLO Thresholds:**
- Minimum: 60%
- Target: 75%
- Excellence: 85%

**PLO Thresholds:**
- Minimum: 60%
- Target: 70%
- Excellence: 85%

## Usage Examples

### Example 1: Get Current Thresholds for a Degree
```bash
curl -X GET \
  'http://localhost:5000/api/v1/settings/thresholds/degree/5/current' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Example 2: Update CLO Target Percentage
```bash
curl -X PUT \
  'http://localhost:5000/api/v1/settings/thresholds/1' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "target_percentage": 80.00
  }'
```

### Example 3: Check if 68% Meets CLO Threshold
```bash
curl -X POST \
  'http://localhost:5000/api/v1/settings/thresholds/check-attainment' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "degree_id": 5,
    "threshold_type": "clo",
    "achieved_percentage": 68.0
  }'
```

### Example 4: Create New PLO Threshold
```bash
curl -X POST \
  'http://localhost:5000/api/v1/settings/thresholds' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "degree_id": 5,
    "threshold_type": "plo",
    "minimum_percentage": 65.00,
    "target_percentage": 75.00,
    "excellence_percentage": 90.00,
    "effective_from_session_id": 12
  }'
```

## Notes

1. **Effective Dates**: Thresholds are time-bound using academic sessions. Multiple thresholds can exist for the same degree and type across different time periods.

2. **Current Thresholds**: The system automatically identifies "current" thresholds based on the current academic session.

3. **Soft Deletes**: Deleted thresholds are soft-deleted and can be recovered if needed.

4. **Rate Limiting**: All endpoints are rate-limited to 100 requests per 15 minutes per IP address.

5. **Permissions**: 
   - Read operations: Any authenticated user
   - Create/Update: Admin or HOD only
   - Delete: Admin only

6. **Validation**: The system validates that minimum <= target <= excellence percentages and all percentages are between 0 and 100.
