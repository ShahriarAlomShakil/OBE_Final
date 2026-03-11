import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

/**
 * Sidebar - Navigation sidebar component
 * Features: Logo, collapsible, role-based navigation, active state
 */
const Sidebar = ({ isCollapsed, onToggle }) => {
  // Navigation items with role-based visibility
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      roles: ['admin', 'hod', 'teacher', 'student']
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpenIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'Course Offerings',
      href: '/course-offerings',
      icon: AcademicCapIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'Students',
      href: '/students',
      icon: UserGroupIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'Teachers',
      href: '/teachers',
      icon: UserGroupIcon,
      roles: ['admin', 'hod']
    },
    {
      name: 'Assessments',
      href: '/assessments',
      icon: ClipboardDocumentListIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'Marks Entry',
      href: '/marks',
      icon: ClipboardDocumentCheckIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'PLO Management',
      href: '/plos',
      icon: BeakerIcon,
      roles: ['admin', 'hod']
    },
    {
      name: 'CLO Attainment',
      href: '/attainment/clo',
      icon: ChartBarIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'PLO Attainment',
      href: '/attainment/plo',
      icon: ChartBarIcon,
      roles: ['admin', 'hod']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: DocumentTextIcon,
      roles: ['admin', 'hod', 'teacher']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      roles: ['admin']
    }
  ];

  // TODO: Get user role from auth store
  const userRole = 'admin'; // Placeholder

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside
      className={`
        bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r-2 border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}
        flex flex-col
      `}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OBE System</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">O</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:border-blue-200 border-2 border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  `
                }
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 transition-transform group-hover:scale-110`} />
                {!isCollapsed && (
                  <span className="font-semibold text-sm">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t-2 border-blue-100 bg-gradient-to-r from-gray-50 to-slate-50">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 font-semibold"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="w-5 h-5 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
