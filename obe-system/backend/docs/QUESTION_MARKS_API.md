# Question-Level Marks API Documentation

## Overview
The Question-Level Marks API enables granular tracking of student performance at the individual question level. This feature is crucial for detailed CLO (Course Learning Outcome) attainment analysis and provides deeper insights into student learning patterns.

## Architecture

### Model: StudentQuestionMark
**File:** `obe-system/backend/models/StudentQuestionMark.js`

**Database Table:** `student_question_marks`

**Schema:**
```javascript
{
  id: BIGINT (Primary Key),
  student_id: BIGINT (Foreign Key -> students),
  question_id: BIGINT (Foreign Key -> questions),
  marks_obtained: DECIMAL(6,2),
  marks_total: DECIMAL(6,2),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  deleted_at: TIMESTAMP (Soft Delete)
}
```

**Key Features:**
- Soft delete support
- Automatic timestamp management
- Comprehensive relationship queries
- CLO attainment calculation support

### Service Methods in MarksService
**File:** `obe-system/backend/services/MarksService.js`

## API Methods

### 1. Bulk Enter Question Marks
```javascript
bulkEnterQuestionMarks(assessmentComponentId, questionMarks)
```

**Purpose:** Enter marks for multiple students across multiple questions in a single transaction.

**Parameters:**
- `assessmentComponentId` (number): The assessment component ID
- `questionMarks` (array): Array of question mark objects

**Question Mark Object Structure:**
```javascript
{
  student_id: number,      // Student ID
  question_id: number,     // Question ID
  marks_obtained: number   // Marks obtained (decimal, 2 precision)
}
```

**Returns:**
```javascript
{
  success: true,
  message: 'Bulk question marks entry completed',
  data: {
    total: number,           // Total entries attempted
    successful: number,      // Successfully inserted
    failed: number,          // Failed insertions
    skipped: number,         // Skipped (duplicates)
    details: {
      success: [...],        // Successful entries with IDs
      failed: [...],         // Failed entries with errors
      skipped: [...]         // Skipped entries with reasons
    }
  }
}
```

**Validations:**
- Assessment component must exist
- Student must exist
- Question must exist and belong to the assessment
- Marks cannot exceed question total marks
- Prevents duplicate entries (student-question combination)

**Example Usage:**
```javascript
const questionMarks = [
  { student_id: 1, question_id: 101, marks_obtained: 8.5 },
  { student_id: 1, question_id: 102, marks_obtained: 7.0 },
  { student_id: 2, question_id: 101, marks_obtained: 9.0 },
  { student_id: 2, question_id: 102, marks_obtained: 6.5 }
];

const result = await MarksService.bulkEnterQuestionMarks(5, questionMarks);
```

---

### 2. Get Question Marks by Assessment
```javascript
getQuestionMarksByAssessment(assessmentComponentId)
```

**Purpose:** Retrieve statistics for all questions in an assessment.

**Returns:**
```javascript
{
  success: true,
  data: {
    assessment: {
      id: number,
      name: string,
      total_marks: number
    },
    question_statistics: [
      {
        question_id: number,
        question_number: string,
        total_marks: number,
        students_attempted: number,
        average_marks: number,
        highest_marks: number,
        lowest_marks: number,
        std_deviation: number,
        passed_count: number  // Students scoring >= 50%
      }
    ]
  }
}
```

---

### 3. Get Question Marks by Student
```javascript
getQuestionMarksByStudent(studentId, assessmentComponentId = null)
```

**Purpose:** Retrieve all question-level marks for a specific student.

**Parameters:**
- `studentId` (number): Student ID
- `assessmentComponentId` (number, optional): Filter by specific assessment

**Returns:**
```javascript
{
  success: true,
  data: {
    student: {
      id: number,
      roll_number: string,
      user_id: number
    },
    question_marks: [
      {
        id: number,
        student_id: number,
        question_id: number,
        marks_obtained: number,
        marks_total: number,
        question_number: string,
        question_text: string,
        clo_code: string,
        clo_description: string,
        assessment_name: string
      }
    ]
  }
}
```

---

### 4. Get CLO Attainment by Student
```javascript
getCLOAttainmentByStudent(studentId, courseOfferingId)
```

**Purpose:** Calculate student's CLO attainment based on question-level marks.

**Returns:**
```javascript
{
  success: true,
  data: {
    student: { ... },
    course_offering_id: number,
    clo_attainment: [
      {
        clo_id: number,
        clo_code: string,
        clo_description: string,
        marks_obtained: number,
        marks_total: number,
        attainment_percentage: number,
        questions_count: number
      }
    ]
  }
}
```

---

### 5. Get CLO Attainment by Course
```javascript
getCLOAttainmentByCourse(courseOfferingId)
```

**Purpose:** Calculate class-level CLO attainment across all students.

**Returns:**
```javascript
{
  success: true,
  data: {
    course_offering_id: number,
    clo_attainment: [
      {
        clo_id: number,
        clo_code: string,
        clo_description: string,
        students_count: number,
        average_attainment_percentage: number,
        total_marks_obtained: number,
        total_marks_possible: number,
        questions_count: number
      }
    ]
  }
}
```

---

### 6. Update Question Marks
```javascript
updateQuestionMarks(markId, marksObtained)
```

**Purpose:** Update marks for a specific question mark entry.

**Parameters:**
- `markId` (number): Question mark entry ID
- `marksObtained` (number): New marks obtained

**Validations:**
- Marks cannot be negative
- Marks cannot exceed question total marks

---

### 7. Delete Question Marks
```javascript
deleteQuestionMarks(markId)
```

**Purpose:** Soft delete a question mark entry.

---

## Model Helper Methods

### Student-Level Queries
```javascript
// Get all question marks for a student
await StudentQuestionMark.getByStudent(studentId, options);

// Get CLO attainment for a student
await StudentQuestionMark.getCLOAttainmentByStudent(studentId, courseOfferingId);
```

### Question-Level Queries
```javascript
// Get all student marks for a specific question
await StudentQuestionMark.getByQuestion(questionId);

// Get assessment statistics by question
await StudentQuestionMark.getAssessmentStatistics(assessmentComponentId);
```

### Course-Level Queries
```javascript
// Get class-level CLO attainment
await StudentQuestionMark.getCLOAttainmentByCourse(courseOfferingId);
```

### Utility Methods
```javascript
// Find specific mark entry
await StudentQuestionMark.findByStudentAndQuestion(studentId, questionId);

// Bulk insert
await StudentQuestionMark.bulkInsert(marksDataArray);

// Delete all marks for an assessment
await StudentQuestionMark.deleteByAssessmentComponent(assessmentComponentId);
```

---

## Use Cases

### 1. Entering Exam Marks Question-by-Question
When an exam is graded, instructors can enter marks for each question individually:
```javascript
const midtermMarks = [
  // Student 1's marks
  { student_id: 1, question_id: 1, marks_obtained: 9.5 },
  { student_id: 1, question_id: 2, marks_obtained: 7.0 },
  { student_id: 1, question_id: 3, marks_obtained: 8.5 },
  
  // Student 2's marks
  { student_id: 2, question_id: 1, marks_obtained: 8.0 },
  { student_id: 2, question_id: 2, marks_obtained: 9.0 },
  { student_id: 2, question_id: 3, marks_obtained: 7.5 }
];

await MarksService.bulkEnterQuestionMarks(midtermAssessmentId, midtermMarks);
```

### 2. Analyzing Question Difficulty
Identify which questions students found most challenging:
```javascript
const stats = await MarksService.getQuestionMarksByAssessment(assessmentId);
// Returns average, std deviation, pass rate per question
```

### 3. Detailed CLO Attainment Tracking
Track student progress on specific learning outcomes:
```javascript
// Individual student
const studentCLO = await MarksService.getCLOAttainmentByStudent(studentId, courseOfferingId);

// Entire class
const classCLO = await MarksService.getCLOAttainmentByCourse(courseOfferingId);
```

### 4. Identifying Learning Gaps
Find students struggling with specific CLOs:
```javascript
const attainment = await StudentQuestionMark.getCLOAttainmentByCourse(courseOfferingId);
const weakCLOs = attainment.filter(clo => clo.average_attainment_percentage < 60);
```

---

## Benefits

### 1. Granular Analysis
- Track performance at question level, not just assessment level
- Identify specific areas where students struggle
- Better alignment with CLO mapping

### 2. Enhanced CLO Attainment
- Direct calculation from question-CLO mapping
- More accurate than assessment-level aggregation
- Supports weighted CLO calculations

### 3. Data-Driven Insights
- Question difficulty analysis
- CLO-specific performance trends
- Early intervention opportunities

### 4. Flexible Reporting
- Multiple aggregation levels (question, CLO, assessment, course)
- Student-level and class-level views
- Statistical analysis support

---

## Database Relationships

```
student_question_marks
├── student_id → students.id
└── question_id → questions.id
    ├── assessment_component_id → assessment_components.id
    └── clo_id → course_learning_outcomes.id
```

This structure enables comprehensive queries across:
- Students
- Questions
- Assessments
- CLOs
- Courses

---

## Performance Considerations

### Indexing
The table includes optimized indexes:
- `idx_student_question` (student_id, question_id) - Fast lookups
- `idx_question` (question_id) - Question-based queries
- `idx_deleted_at` - Soft delete filtering

### Transactions
Bulk operations use transactions to ensure data integrity:
- All-or-nothing semantics for bulk inserts
- Rollback on validation failures
- Connection pooling for concurrency

### Query Optimization
- Uses JOIN operations efficiently
- Aggregations performed at database level
- Selective column retrieval
- Proper use of indexes

---

## Error Handling

### Validation Errors
- Invalid student ID
- Invalid question ID
- Marks exceeding total
- Duplicate entries
- Question not in assessment

### Transaction Errors
- Database connection failures
- Constraint violations
- Concurrent update conflicts

All errors return structured responses with:
- Success status
- Error details per entry
- Skip reasons for duplicates

---

## Future Enhancements

1. **Rubric-Based Scoring**
   - Support for criterion-level marks
   - Rubric-based question evaluation

2. **Partial Credit Tracking**
   - Step-by-step marking
   - Partial credit distribution

3. **Analytics Dashboard**
   - Real-time CLO attainment visualization
   - Question difficulty heatmaps
   - Student performance trends

4. **Automated Calculations**
   - Auto-compute assessment totals from questions
   - Weighted CLO attainment
   - Grade predictions

---

## Related Documentation
- [Database Schema](../../database/README.md)
- [Assessment API Documentation](./ASSESSMENT_API.md)
- [Marks API Documentation](./MARKS_API.md)
- [CLO Attainment Guide](./CLO_ATTAINMENT.md)

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-04  
**Status:** Production Ready
