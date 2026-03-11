import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import { MainLayout, AuthLayout } from './layouts';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

// Dashboard
import Dashboard from './pages/Dashboard';

// Course Pages
import CourseList from './pages/courses/CourseList';
import CourseForm from './pages/courses/CourseForm';
import CourseDetail from './pages/courses/CourseDetail';
import CLOManagement from './pages/courses/CLOManagement';
import CLOPLOMatrix from './pages/courses/CLOPLOMatrix';

// Assessment Pages
import AssessmentList from './pages/assessments/AssessmentList';

// Course Offering Pages
import CourseOfferingList from './pages/course-offerings/CourseOfferingList';
import CourseOfferingDetail from './pages/course-offerings/CourseOfferingDetail';

// Placeholder components for upcoming features (will be created in future steps)
const MarksEntry = () => <div className="p-6">Marks Entry - Coming Soon (Step 15.2)</div>;
const StudentMarks = () => <div className="p-6">Student Marks View - Coming Soon (Step 15.3)</div>;
const CLOAttainment = () => <div className="p-6">CLO Attainment Dashboard - Coming Soon (Step 16.1)</div>;
const PLOAttainment = () => <div className="p-6">PLO Attainment Dashboard - Coming Soon (Step 16.2)</div>;
const OBETranscript = () => <div className="p-6">OBE Transcript - Coming Soon (Step 16.3)</div>;
const PLOManagement = () => <div className="p-6">PLO Management - Coming Soon (Step 17.1)</div>;
const PEOManagement = () => <div className="p-6">PEO Management - Coming Soon (Step 17.2)</div>;
const Reports = () => <div className="p-6">Reports - Coming Soon (Step 18.1)</div>;
const Settings = () => <div className="p-6">Settings - Coming Soon</div>;
const StudentList = () => <div className="p-6">Student List - Coming Soon</div>;
const StudentDetail = () => <div className="p-6">Student Detail - Coming Soon</div>;
const TeacherList = () => <div className="p-6">Teacher List - Coming Soon</div>;

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Course Management */}
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="courses/:courseId/edit" element={<CourseForm />} />
            <Route path="courses/:courseId/clos" element={<CLOManagement />} />
            <Route path="courses/:courseId/clo-plo-matrix" element={<CLOPLOMatrix />} />
            
            {/* Course Offerings */}
            <Route path="course-offerings" element={<CourseOfferingList />} />
            <Route path="course-offerings/:courseOfferingId/assessments" element={<AssessmentList />} />
            <Route path="course-offerings/:courseOfferingId/marks" element={<MarksEntry />} />
            <Route path="course-offerings/:courseOfferingId" element={<CourseOfferingDetail />} />
            
            {/* Students */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/:id/marks" element={<StudentMarks />} />
            <Route path="students/:id/transcript" element={<OBETranscript />} />
            
            {/* Teachers */}
            <Route path="teachers" element={<TeacherList />} />
            
            {/* PLO & PEO Management */}
            <Route path="plos" element={<PLOManagement />} />
            <Route path="peos" element={<PEOManagement />} />
            
            {/* Attainment Dashboards */}
            <Route path="attainment/clo" element={<CLOAttainment />} />
            <Route path="attainment/plo" element={<PLOAttainment />} />
            
            {/* Reports */}
            <Route path="reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
