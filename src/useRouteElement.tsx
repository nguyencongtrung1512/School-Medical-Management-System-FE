import { useRoutes } from 'react-router-dom'
import path from './constants/path'
import MainLayout from './layouts/MainLayout/MainLayout'
import Login from './pages/login/login'
import Home from './pages/home/home'
import HealthRecord from './pages/parent/healthRecord/healthRecord'
import SendMedicine from './pages/parent/sendMedicine/sendMedicine'
import ProfileParent from './pages/parent/profile/profileParent'
import NurseLayout from './layouts/NurseLayout/NurseLayout'
import HealthRecordCensorship from './pages/nurse/healthRecordCensorship/HealthRecordCensorship'
import NurseProfile from './pages/nurse/nurseProfile/NurseProfile'
import ScheduleVaccination from './pages/nurse/scheduleVaccination/ScheduleVaccination'
import ResultsAfterVaccination from './pages/nurse/resultsAfterVaccination'
import ReceiveMedicine from './pages/nurse/receiveMedicine/ReceiveMedicine'
import MedicalReport from './pages/nurse/medicalReport/MedicalReport'

import DashBoardNurse from './pages/nurse/dashboardNurse/DashBoardNurse'
import PrivateConsultation from './pages/nurse/privateConsultation/PrivateConsultation'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import DashBoardAdmin from './pages/admin/dashBoardAdmin/DashBoardAdmin'
import CensorList from './pages/admin/censorManagement/CensorList'
import MedicalPlan from './pages/nurse/medicalPlan'
import UserList from './pages/admin/userManagement/UserList'
import StudentList from './pages/admin/studentManagement/StudentList'
import GradeList from './pages/admin/gradeManagement/GradeList'
import ClassList from './pages/admin/classroomManagement/Classlist'
import VaccinationSchedule from './pages/parent/vaccinationSchedule/VaccinationSchedule'
import MedicalEventParent from './pages/parent/medicalEvent/medicalEventParent'
import Blog, { BlogPost } from './pages/parent/blog'
import CategoryManagement from './pages/admin/CategoryManagement/CategoryManagement'
import BlogList from './pages/admin/BlogManagement/Bloglist'
import BlogDetail from './pages/admin/BlogManagement/BlogDetail'


export default function useRouteElements() {
  const routeElements = useRoutes([
    // MAIN routes
    {
      path: '',
      element: <MainLayout />,
      children: [

        {
          path: path.login,
          element: <Login />
        }
      ]
    },
    // PARENT routes
    {
      path: '',
      element: <MainLayout />,
      children: [
        {
          path: path.home,
          element: <Home />
        },
        {
          path: path.blog,
          element: <Blog />
        },
        {
          path: path.blogDetail,
          element: <BlogPost />
        },
        {
          path: path.healthRecord,
          element: <HealthRecord />
        },
        {
          path: path.sendMedicine,
          element: <SendMedicine />
        },
        {
          path: path.privateConsultation,
          element: <PrivateConsultation />
        },
        {
          path: path.vaccinationSchedule,
          element: <VaccinationSchedule />
        },
        {
          path: path.medicalEvent,
          element: <MedicalEventParent />
        },
        {
          path: path.profileParent,
          element: <ProfileParent />
        }
      ]
    },
    //================ NURSE routes ================
    {
      path: path.BASE_NURSE,
      element: <NurseLayout />,
      children: [
        {
          path: path.DASHBOARD_NURSE,
          element: <DashBoardNurse />
        },
        {
          path: path.HEALTH_RECORD_CENSORSHIP,
          element: <HealthRecordCensorship />
        },
        {
          path: path.NURSE_PROFILE,
          element: <NurseProfile />
        },
        {
          path: path.SCHEDULE_VACCINATION,
          element: <ScheduleVaccination />
        },
        {
          path: path.RESULTS_AFTER_VACCINATION,
          element: <ResultsAfterVaccination />
        },
        {
          path: path.RECEIVE_MEDICINE,
          element: <ReceiveMedicine />
        },
        {
          path: path.MEDICAL_REPORT,
          element: <MedicalReport />
        },
        {
          path: path.MEDICAL_PLAN,
          element: <MedicalPlan />
        },
        {
          path: path.PRIVATE_CONSULTATION,
          element: <PrivateConsultation />
        }
      ]
    },
    //================ ADMIN routes ================
    {
      path: path.BASE_ADMIN,
      element: <AdminLayout />,
      children: [
        {
          path: path.DASHBOARD_ADMIN,
          element: <DashBoardAdmin />
        },
        {
          path: path.CENSOR_LIST,
          element: <CensorList />
        },
        {
          path: path.USER_MANAGEMENT,
          element: <UserList />
        },
        {
          path: path.GRADE_MANAGEMENT,
          element: <GradeList />
        },
        {
          path: path.CLASS_MANAGEMENT,
          element: <ClassList />
        },
        {
          path: path.STUDENT_LIST,
          element: <StudentList />
        },
        {
          path: path.CATEGORY_MANAGEMENT,
          element: <CategoryManagement />
        },
        {
          path: path.BLOG_LIST_BY_CATEGORY,
          element: <BlogList />
        },
        {
          path: path.BLOG_DETAIL,
          element: <BlogDetail />
        }
      ]
    }
  ])
  return routeElements
}
