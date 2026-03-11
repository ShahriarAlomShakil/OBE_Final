# Attainment API - Implementation Summary

## Overview
Complete implementation of CLO and PLO attainment calculation and retrieval APIs for the OBE System.

## Files Created

### 1. AttainmentController.js
**Location:** `obe-system/backend/controllers/AttainmentController.js`

**Purpose:** Handles HTTP requests for CLO and PLO attainment calculations

**Methods:**
- `calculateStudentCLO(req, res)` - Calculate CLO attainment for one student
- `calculateCourseCLO(req, res)` - Calculate CLO attainment for entire course
- `calculateStudentPLO(req, res)` - Calculate PLO attainment for one student
- `calculateProgramPLO(req, res)` - Calculate PLO attainment for program batch
- `getStudentCLOAttainment(req, res)` - Retrieve student CLO data
- `getCourseCLOAttainmentSummary(req, res)` - Retrieve course CLO summary
- `getStudentPLOAttainment(req, res)` - Retrieve student PLO data
- `getProgramPLOAttainmentSummary(req, res)` - Retrieve program PLO summary

**Validation Methods:**
- `validateCalculateStudentCLO()` - Validates studentId and courseOfferingId
- `validateCalculateCourseCLO()` - Validates courseOfferingId
- `validateCalculateStudentPLO()` - Validates studentId and degreeId
- `validateCalculateProgramPLO()` - Validates degreeId and batchYear
- `validateGetStudentCLO()` - Validates studentId param and courseOfferingId query
- `validateGetCourseCLO()` - Validates courseOfferingId param
- `validateGetStudentPLO()` - Validates studentId param and optional degreeId query
- `validateGetProgramPLO()` - Validates degreeId param and optional batch query

### 2. attainment.js Routes
**Location:** `obe-system/backend/routes/attainment.js`

**Purpose:** Defines API routes for attainment operations

**Routes:**

#### Calculation Endpoints (POST)
```
POST /api/v1/attainment/calculate/student-clo
POST /api/v1/attainment/calculate/course-clo
POST /api/v1/attainment/calculate/student-plo
POST /api/v1/attainment/calculate/program-plo
```

#### Retrieval Endpoints (GET)
```
GET /api/v1/attainment/student/:studentId/clo?courseOfferingId=X
GET /api/v1/attainment/course/:courseOfferingId/clo
GET /api/v1/attainment/student/:studentId/plo?degreeId=X
GET /api/v1/attainment/program/:degreeId/plo?batch=2023
```

## API Documentation

### 1. Calculate Student CLO Attainment
**Endpoint:** `POST /api/v1/attainment/calculate/student-clo`

**Access:** Teacher, HOD, Admin

**Request Body:**
```json
{
  "studentId": 1,
  "courseOfferingId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student CLO attainment calculated successfully",
  "data": [
    {
      "cloId": 1,
      "cloCode": "CLO1",
      "cloDescription": "Understand basic concepts",
      "attainmentPercentage": 75.5,
      "isAttained": true,
      "totalObtained": 45.3,
      "totalPossible": 60
    }
  ]
}
```

### 2. Calculate Course CLO Attainment
**Endpoint:** `POST /api/v1/attainment/calculate/course-clo`

**Access:** Teacher, HOD, Admin

**Request Body:**
```json
{
  "courseOfferingId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course CLO attainment calculated successfully",
  "data": [
    {
      "cloId": 1,
      "cloCode": "CLO1",
      "averageAttainment": 72.5,
      "attainmentRate": 85.0,
      "studentsAttained": 34,
      "totalStudents": 40,
      "minAttainment": 45.0,
      "maxAttainment": 95.0,
      "isAttained": true
    }
  ]
}
```

### 3. Calculate Student PLO Attainment
**Endpoint:** `POST /api/v1/attainment/calculate/student-plo`

**Access:** HOD, Admin

**Request Body:**
```json
{
  "studentId": 1,
  "degreeId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student PLO attainment calculated successfully",
  "data": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "ploDescription": "Engineering knowledge",
      "attainmentPercentage": 78.5,
      "isAttained": true,
      "contributingCLOs": 12
    }
  ]
}
```

### 4. Calculate Program PLO Attainment
**Endpoint:** `POST /api/v1/attainment/calculate/program-plo`

**Access:** HOD, Admin

**Request Body:**
```json
{
  "degreeId": 2,
  "batchYear": 2023
}
```

**Response:**
```json
{
  "success": true,
  "message": "Program PLO attainment calculated successfully",
  "data": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "averageAttainment": 75.5,
      "attainmentRate": 82.0,
      "studentsAttained": 82,
      "totalStudents": 100,
      "minAttainment": 55.0,
      "maxAttainment": 92.0,
      "isAttained": true
    }
  ]
}
```

### 5. Get Student CLO Attainment
**Endpoint:** `GET /api/v1/attainment/student/:studentId/clo?courseOfferingId=5`

**Access:** All authenticated users (students can view own)

**Response:**
```json
{
  "success": true,
  "message": "Student CLO attainment retrieved successfully",
  "data": [
    {
      "cloId": 1,
      "cloCode": "CLO1",
      "attainmentPercentage": 75.5,
      "isAttained": true,
      "calculatedAt": "2026-02-04T10:30:00.000Z"
    }
  ]
}
```

### 6. Get Course CLO Attainment Summary
**Endpoint:** `GET /api/v1/attainment/course/:courseOfferingId/clo`

**Access:** Teacher, HOD, Admin

**Response:**
```json
{
  "success": true,
  "message": "Course CLO attainment summary retrieved successfully",
  "data": [
    {
      "cloId": 1,
      "cloCode": "CLO1",
      "averageAttainment": 72.5,
      "attainmentRate": 85.0,
      "studentsAttained": 34,
      "totalStudents": 40
    }
  ]
}
```

### 7. Get Student PLO Attainment
**Endpoint:** `GET /api/v1/attainment/student/:studentId/plo?degreeId=2`

**Access:** All authenticated users

**Note:** degreeId is optional. If not provided, uses student's degree.

**Response:**
```json
{
  "success": true,
  "message": "Student PLO attainment retrieved successfully",
  "data": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "attainmentPercentage": 78.5,
      "isAttained": true,
      "calculatedAt": "2026-02-04T10:30:00.000Z"
    }
  ]
}
```

### 8. Get Program PLO Attainment Summary
**Endpoint:** `GET /api/v1/attainment/program/:degreeId/plo?batch=2023`

**Access:** HOD, Admin

**Note:** batch is optional. If not provided, returns latest batch.

**Response:**
```json
{
  "success": true,
  "message": "Program PLO attainment summary retrieved successfully",
  "data": [
    {
      "ploId": 1,
      "ploCode": "PLO1",
      "averageAttainment": 75.5,
      "attainmentRate": 82.0,
      "studentsAttained": 82,
      "totalStudents": 100
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "studentId",
      "message": "Student ID must be a positive integer"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "CLO attainment not found. Please calculate attainment first."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to calculate student CLO attainment",
  "error": "Detailed error message here"
}
```

## Access Control

### Role-Based Authorization
- **Teacher, HOD, Admin**: Can calculate CLO attainment
- **HOD, Admin only**: Can calculate PLO attainment (requires higher privileges)
- **All authenticated users**: Can view attainment data
- **Students**: Can view their own attainment data

### Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Integration Points

### Dependencies
- `AttainmentCalculationService` - Core business logic for calculations
- `responseHelper` - Consistent response formatting
- `express-validator` - Request validation
- `authMiddleware` - Authentication and authorization

### Database Tables Used
- `student_clo_attainment` - Stores individual student CLO results
- `course_clo_attainment_summary` - Stores course-level CLO aggregates
- `student_plo_attainment` - Stores individual student PLO results
- `program_plo_attainment_summary` - Stores program-level PLO aggregates

## Validation Rules

### Student CLO Calculation
- `studentId`: Required, positive integer
- `courseOfferingId`: Required, positive integer

### Course CLO Calculation
- `courseOfferingId`: Required, positive integer

### Student PLO Calculation
- `studentId`: Required, positive integer
- `degreeId`: Required, positive integer

### Program PLO Calculation
- `degreeId`: Required, positive integer
- `batchYear`: Required, integer between 2000-2100

## Testing Endpoints

### Using cURL

**Calculate Student CLO:**
```bash
curl -X POST http://localhost:3000/api/v1/attainment/calculate/student-clo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"studentId": 1, "courseOfferingId": 5}'
```

**Get Student CLO Attainment:**
```bash
curl -X GET "http://localhost:3000/api/v1/attainment/student/1/clo?courseOfferingId=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Calculate Program PLO:**
```bash
curl -X POST http://localhost:3000/api/v1/attainment/calculate/program-plo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"degreeId": 2, "batchYear": 2023}'
```

## Next Steps

1. **Step 7.3**: Create Attainment Threshold Settings API
   - Allow customization of minimum/target thresholds
   - Store per-degree or system-wide settings

2. **Step 8**: Create Report Generation APIs
   - Generate formatted CLO/PLO attainment reports
   - Export to PDF/Excel formats
   - Create gap analysis reports

3. **Frontend Integration**
   - Create attainment calculation interfaces
   - Build CLO/PLO attainment dashboards
   - Add visualization charts

## Notes

- All calculation endpoints trigger database updates
- Retrieval endpoints return cached/saved data
- Attainment calculations use configurable thresholds (default: 60% minimum)
- Support for bulk operations via course-level calculations
- Transaction-based operations ensure data integrity
- Comprehensive error handling prevents partial updates

## Completion Status

✅ **Step 7.2 COMPLETED** - Attainment Controller & Routes fully implemented
- All 8 endpoints created and tested
- Comprehensive validation rules
- Role-based access control applied
- Integrated with main routes
- Documentation complete
