import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AcademicCapIcon,
  UserGroupIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { courseService, studentService } from '../services';

/**
 * Dashboard Component
 * 
 * Main dashboard page that shows different content based on user role
 * - Admin/HOD: Stats, charts, recent activity
 * - Teacher: Courses, pending marks, quick links
 * - Student: Enrolled courses, PLO progress, upcoming assessments
 */

// Demo data for Admin/HOD dashboard
const adminStats = [
  { label: 'Total Courses', value: 48, icon: BookOpenIcon, color: 'primary', change: '+12%' },
  { label: 'Students', value: 1250, icon: UserGroupIcon, color: 'success', change: '+8%' },
  { label: 'Teachers', value: 85, icon: UsersIcon, color: 'warning', change: '+5%' },
  { label: 'Departments', value: 8, icon: BuildingOfficeIcon, color: 'secondary', change: '0%' },
];

const cloAttainmentData = [
  { name: 'CS101', CLO1: 78, CLO2: 85, CLO3: 62, CLO4: 91 },
  { name: 'CS201', CLO1: 72, CLO2: 68, CLO3: 80, CLO4: 75 },
  { name: 'CS301', CLO1: 88, CLO2: 79, CLO3: 85, CLO4: 70 },
  { name: 'CS401', CLO1: 65, CLO2: 82, CLO3: 77, CLO4: 88 },
  { name: 'CS501', CLO1: 90, CLO2: 75, CLO3: 68, CLO4: 82 },
];

const ploAttainmentData = [
  { plo: 'PLO1', attainment: 82, fullMark: 100 },
  { plo: 'PLO2', attainment: 75, fullMark: 100 },
  { plo: 'PLO3', attainment: 88, fullMark: 100 },
  { plo: 'PLO4', attainment: 65, fullMark: 100 },
  { plo: 'PLO5', attainment: 78, fullMark: 100 },
  { plo: 'PLO6', attainment: 70, fullMark: 100 },
];

const recentActivity = [
  { id: 1, action: 'Marks entered', course: 'CS301 - Data Structures', user: 'Dr. Ahmad', time: '5 minutes ago', type: 'marks' },
  { id: 2, action: 'CLO mapping updated', course: 'CS401 - Database Systems', user: 'Dr. Fatima', time: '15 minutes ago', type: 'clo' },
  { id: 3, action: 'New assessment created', course: 'CS201 - OOP', user: 'Dr. Hassan', time: '1 hour ago', type: 'assessment' },
  { id: 4, action: 'Course added', course: 'CS601 - Machine Learning', user: 'Admin', time: '2 hours ago', type: 'course' },
  { id: 5, action: 'Report generated', course: 'PLO Attainment Report', user: 'HOD', time: '3 hours ago', type: 'report' },
];

// Demo data for Teacher dashboard
const teacherCourses = [
  { id: 1, code: 'CS301', name: 'Data Structures', students: 45, cloAttainment: 78, pending: 2 },
  { id: 2, code: 'CS401', name: 'Database Systems', students: 38, cloAttainment: 82, pending: 0 },
  { id: 3, code: 'CS501', name: 'Software Engineering', students: 42, cloAttainment: 65, pending: 5 },
];

const pendingMarksAlerts = [
  { id: 1, course: 'CS301', assessment: 'Quiz 3', dueDate: '2026-02-10', students: 45 },
  { id: 2, course: 'CS301', assessment: 'Assignment 2', dueDate: '2026-02-08', students: 12 },
  { id: 3, course: 'CS501', assessment: 'Midterm', dueDate: '2026-02-15', students: 42 },
];

const recentSubmissions = [
  { id: 1, student: 'Ahmed Khan', course: 'CS301', assessment: 'Quiz 2', marks: '8/10', time: '2 hours ago' },
  { id: 2, student: 'Sara Ali', course: 'CS401', assessment: 'Assignment 1', marks: '18/20', time: '3 hours ago' },
  { id: 3, student: 'Usman Malik', course: 'CS501', assessment: 'Lab 5', marks: '9/10', time: '5 hours ago' },
];

// Demo data for Student dashboard
const studentCourses = [
  { id: 1, code: 'CS301', name: 'Data Structures', teacher: 'Dr. Ahmad', progress: 75, clos: [
    { name: 'CLO1', attainment: 82 },
    { name: 'CLO2', attainment: 68 },
    { name: 'CLO3', attainment: 75 },
  ]},
  { id: 2, code: 'CS401', name: 'Database Systems', teacher: 'Dr. Fatima', progress: 88, clos: [
    { name: 'CLO1', attainment: 90 },
    { name: 'CLO2', attainment: 85 },
    { name: 'CLO3', attainment: 88 },
  ]},
  { id: 3, code: 'CS501', name: 'Software Engineering', teacher: 'Dr. Hassan', progress: 62, clos: [
    { name: 'CLO1', attainment: 55 },
    { name: 'CLO2', attainment: 70 },
    { name: 'CLO3', attainment: 60 },
  ]},
];

const studentPLOProgress = [
  { name: 'PLO1', attainment: 78, target: 60 },
  { name: 'PLO2', attainment: 65, target: 60 },
  { name: 'PLO3', attainment: 82, target: 60 },
  { name: 'PLO4', attainment: 58, target: 60 },
  { name: 'PLO5', attainment: 75, target: 60 },
  { name: 'PLO6', attainment: 70, target: 60 },
];

const upcomingAssessments = [
  { id: 1, course: 'CS301', name: 'Quiz 4', date: '2026-02-10', type: 'Quiz' },
  { id: 2, course: 'CS401', name: 'Midterm Exam', date: '2026-02-15', type: 'Exam' },
  { id: 3, course: 'CS501', name: 'Project Submission', date: '2026-02-20', type: 'Project' },
];

const recentResults = [
  { id: 1, course: 'CS301', assessment: 'Quiz 3', marks: '9/10', percentage: 90 },
  { id: 2, course: 'CS401', assessment: 'Assignment 2', marks: '17/20', percentage: 85 },
  { id: 3, course: 'CS501', assessment: 'Lab 4', marks: '8/10', percentage: 80 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

// Stats Card Component
const StatsCard = ({ stat }) => {
  const Icon = stat.icon;
  const colorClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
    success: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30',
    warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
    secondary: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30',
    danger: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30',
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
          {stat.change && (
            <p className={`text-sm mt-2 font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change === '0%' ? 'text-gray-500' : 'text-red-600'}`}>
              <ArrowTrendingUpIcon className="w-4 h-4 inline mr-1" />
              {stat.change} from last month
            </p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClasses[stat.color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

// Admin/HOD Dashboard Component
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(adminStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch actual stats from API
        const [courseCountResponse, studentStatsResponse] = await Promise.all([
          courseService.getCount(),
          studentService.getStats()
        ]);

        const actualCourseCount = courseCountResponse.data?.count || 0;
        const actualStudentStats = studentStatsResponse.data || {};
        const actualStudentCount = actualStudentStats.total || 0;

        // Update stats with actual data from API
        setStats(prevStats => 
          prevStats.map(stat => {
            if (stat.label === 'Total Courses') {
              return { ...stat, value: actualCourseCount };
            } else if (stat.label === 'Students') {
              return { ...stat, value: actualStudentCount };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep the demo data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLO Attainment Bar Chart */}
        <Card className="p-0 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader divider={false} className="p-6 pb-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">CLO Attainment by Course</CardTitle>
              <Badge variant="primary" className="shadow-md">Current Semester</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cloAttainmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #3B82F6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="CLO1" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="CLO2" fill="#059669" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="CLO3" fill="#D97706" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="CLO4" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Threshold Line Indicator */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-danger-500"></span>
                Threshold: 60%
              </span>
            </div>
          </CardBody>
        </Card>

        {/* PLO Attainment Radar Chart */}
        <Card className="p-0 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader divider={false} className="p-6 pb-0 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">PLO Attainment Overview</CardTitle>
              <Badge variant="secondary" className="shadow-md">BSc Computer Science</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={ploAttainmentData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="plo" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Radar
                    name="Attainment"
                    dataKey="attainment"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fill="#A78BFA"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #7C3AED', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    formatter={(value) => [`${value}%`, 'Attainment']}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-success-500"></span>
                Above Threshold (≥60%)
              </span>
              <span className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-danger-500"></span>
                Below Threshold (&lt;60%)
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-0 border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader divider={false} className="p-6 pb-4 border-b-2 border-blue-100">
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-3">
              <Link to="/courses/new">
                <Button variant="outline-primary" fullWidth className="justify-start">
                  <PlusIcon className="w-5 h-5 mr-3" />
                  Add New Course
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" fullWidth className="justify-start">
                  <DocumentTextIcon className="w-5 h-5 mr-3" />
                  Generate Reports
                </Button>
              </Link>
              <Link to="/attainment/clo">
                <Button variant="outline" fullWidth className="justify-start">
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  View CLO Attainment
                </Button>
              </Link>
              <Link to="/attainment/plo">
                <Button variant="outline" fullWidth className="justify-start">
                  <AcademicCapIcon className="w-5 h-5 mr-3" />
                  View PLO Attainment
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 p-0 border-2 border-gray-200 shadow-lg">
          <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              <Link to="/activity" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-200">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    activity.type === 'marks' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                    activity.type === 'clo' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                    activity.type === 'assessment' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' :
                    activity.type === 'course' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' :
                    'bg-gradient-to-br from-gray-500 to-slate-600 text-white'
                  }`}>
                    {activity.type === 'marks' && <ClipboardDocumentCheckIcon className="w-5 h-5" />}
                    {activity.type === 'clo' && <ChartBarIcon className="w-5 h-5" />}
                    {activity.type === 'assessment' && <DocumentTextIcon className="w-5 h-5" />}
                    {activity.type === 'course' && <BookOpenIcon className="w-5 h-5" />}
                    {activity.type === 'report' && <DocumentTextIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.course}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{activity.user}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// Teacher Dashboard Component
const TeacherDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard stat={{ label: 'My Courses', value: 3, icon: BookOpenIcon, color: 'primary' }} />
        <StatsCard stat={{ label: 'Total Students', value: 125, icon: UserGroupIcon, color: 'success' }} />
        <StatsCard stat={{ label: 'Pending Entries', value: 7, icon: ClipboardDocumentCheckIcon, color: 'warning' }} />
      </div>

      {/* My Courses with CLO Status */}
      <Card className="p-0 border-2 border-blue-200 shadow-lg">
        <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">My Courses</CardTitle>
            <Badge variant="primary" className="shadow-md">{teacherCourses.length} Courses</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-6 pt-0">
          <div className="space-y-4">
            {teacherCourses.map((course) => (
              <div key={course.id} className="p-5 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.code} - {course.name}</h4>
                    <p className="text-sm text-gray-500">{course.students} students enrolled</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {course.pending > 0 && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <BellAlertIcon className="w-4 h-4" />
                        {course.pending} pending
                      </Badge>
                    )}
                    <StatusBadge status={course.cloAttainment >= 70 ? 'active' : course.cloAttainment >= 60 ? 'pending' : 'inactive'}>
                      CLO: {course.cloAttainment}%
                    </StatusBadge>
                  </div>
                </div>
                {/* CLO Progress Bar */}
                <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all shadow-md ${
                      course.cloAttainment >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                      course.cloAttainment >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                    style={{ width: `${course.cloAttainment}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <Link to={`/courses/${course.id}/marks`}>
                      <Button variant="outline" size="sm">Enter Marks</Button>
                    </Link>
                    <Link to={`/courses/${course.id}/attainment`}>
                      <Button variant="ghost" size="sm">View Attainment</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Pending Marks & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Marks Alerts */}
        <Card className="p-0 border-2 border-amber-300 shadow-lg bg-gradient-to-br from-white to-amber-50">
          <CardHeader divider={false} className="p-6 pb-4 border-b-2 border-amber-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                Pending Marks Entry
              </CardTitle>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-3">
              {pendingMarksAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300 shadow-md hover:shadow-lg transition-all">
                  <div>
                    <p className="font-medium text-gray-900">{alert.course} - {alert.assessment}</p>
                    <p className="text-sm text-gray-500">Due: {new Date(alert.dueDate).toLocaleDateString()} • {alert.students} students</p>
                  </div>
                  <Link to={`/marks/entry?course=${alert.course}`}>
                    <Button variant="warning" size="sm">Enter Marks</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Submissions */}
        <Card className="p-0 border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Assessment Submissions</CardTitle>
              <Link to="/submissions" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {submission.student.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{submission.student}</p>
                      <p className="text-sm text-gray-500">{submission.course} - {submission.assessment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{submission.marks}</p>
                    <p className="text-xs text-gray-400">{submission.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="p-0 border-2 border-gray-200 shadow-lg">
        <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
          <CardTitle className="text-gray-900">Quick Links</CardTitle>
        </CardHeader>
        <CardBody className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/marks/entry" className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all">
              <ClipboardDocumentCheckIcon className="w-9 h-9 mx-auto text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Enter Marks</p>
            </Link>
            <Link to="/attainment/clo" className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 shadow-md hover:shadow-lg transition-all">
              <ChartBarIcon className="w-9 h-9 mx-auto text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">View Attainment</p>
            </Link>
            <Link to="/assessments" className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-center hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 hover:border-amber-400 shadow-md hover:shadow-lg transition-all">
              <DocumentTextIcon className="w-9 h-9 mx-auto text-amber-600 mb-2" />
              <p className="font-semibold text-gray-900">Assessments</p>
            </Link>
            <Link to="/reports" className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl text-center hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 shadow-md hover:shadow-lg transition-all">
              <DocumentTextIcon className="w-9 h-9 mx-auto text-indigo-600 mb-2" />
              <p className="font-semibold text-gray-900">Reports</p>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// Student Dashboard Component
const StudentDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard stat={{ label: 'Enrolled Courses', value: 3, icon: BookOpenIcon, color: 'primary' }} />
        <StatsCard stat={{ label: 'Average CLO', value: '75%', icon: ChartBarIcon, color: 'success' }} />
        <StatsCard stat={{ label: 'PLOs Achieved', value: '5/6', icon: AcademicCapIcon, color: 'secondary' }} />
      </div>

      {/* Enrolled Courses with CLO Progress */}
      <Card className="p-0 border-2 border-blue-200 shadow-lg">
        <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Enrolled Courses & CLO Progress</CardTitle>
            <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-6 pt-0">
          <div className="space-y-6">
            {studentCourses.map((course) => (
              <div key={course.id} className="p-5 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.code} - {course.name}</h4>
                    <p className="text-sm text-gray-500">{course.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{course.progress}%</p>
                    <p className="text-xs text-gray-500">Overall Progress</p>
                  </div>
                </div>
                {/* CLO Progress Bars */}
                <div className="space-y-2">
                  {course.clos.map((clo, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700 w-12">{clo.name}</span>
                      <div className="flex-1 bg-gray-300 rounded-full h-3 shadow-inner">
                        <div 
                          className={`h-3 rounded-full shadow-md transition-all ${
                            clo.attainment >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                            clo.attainment >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                          }`}
                          style={{ width: `${clo.attainment}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${
                        clo.attainment >= 70 ? 'text-green-700' : 
                        clo.attainment >= 60 ? 'text-amber-700' : 'text-red-700'
                      }`}>{clo.attainment}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* PLO Progress and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PLO Progress Bars */}
        <Card className="p-0 border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white to-purple-50">
          <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">PLO Attainment Progress</CardTitle>
              <Badge variant="secondary" className="shadow-md">Target: 60%</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-4">
              {studentPLOProgress.map((plo) => (
                <div key={plo.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{plo.name}</span>
                    <div className="flex items-center gap-2">
                      {plo.attainment >= plo.target ? (
                        <CheckCircleIcon className="w-4 h-4 text-success-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-danger-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        plo.attainment >= plo.target ? 'text-success-600' : 'text-danger-600'
                      }`}>{plo.attainment}%</span>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-300 rounded-full h-4 shadow-inner">
                    {/* Target line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-gray-600 z-10 shadow"
                      style={{ left: `${plo.target}%` }}
                    ></div>
                    {/* Progress bar */}
                    <div 
                      className={`h-4 rounded-full shadow-md transition-all ${
                        plo.attainment >= plo.target ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
                      }`}
                      style={{ width: `${plo.attainment}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-success-600">5 of 6 PLOs</span> achieved above threshold
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Upcoming Assessments & Recent Results */}
        <div className="space-y-6">
          {/* Upcoming Assessments */}
          <Card className="p-0 border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardHeader divider={false} className="p-6 pb-4 border-b-2 border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                  Upcoming Assessments
                </CardTitle>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              <div className="space-y-3">
                {upcomingAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 shadow-md hover:shadow-lg transition-all">
                    <div>
                      <p className="font-medium text-gray-900">{assessment.name}</p>
                      <p className="text-sm text-gray-500">{assessment.course}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        assessment.type === 'Exam' ? 'danger' : 
                        assessment.type === 'Quiz' ? 'warning' : 'primary'
                      }>
                        {assessment.type}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(assessment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Results */}
          <Card className="p-0 border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader divider={false} className="p-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Recent Results</CardTitle>
                <Link to="/results" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-6 pt-0">
              <div className="space-y-3">
                {recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{result.assessment}</p>
                      <p className="text-sm text-gray-500">{result.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{result.marks}</p>
                      <p className={`text-sm ${
                        result.percentage >= 80 ? 'text-success-600' : 
                        result.percentage >= 60 ? 'text-warning-600' : 'text-danger-600'
                      }`}>{result.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { user, isAdmin, isHOD, isTeacher, isStudent } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-primary-600">{user?.name || 'User'}</span>! 
          Here's what's happening today.
        </p>
      </div>

      {/* Role-based Dashboard Content */}
      {(isAdmin() || isHOD()) && <AdminDashboard user={user} />}
      {isTeacher() && !isAdmin() && !isHOD() && <TeacherDashboard user={user} />}
      {isStudent() && <StudentDashboard user={user} />}

      {/* Fallback for unknown role */}
      {!isAdmin() && !isHOD() && !isTeacher() && !isStudent() && (
        <div className="text-center py-12">
          <AcademicCapIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to OBE System</h2>
          <p className="text-gray-600">
            Your role-specific dashboard will be displayed once your account is fully configured.
          </p>
        </div>
      )}
    </div>
  );
}
