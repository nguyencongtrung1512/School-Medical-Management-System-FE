import { useRoutes } from 'react-router-dom'
import path from './constants/path'
import MainLayout from './layouts/MainLayout/MainLayout'
import NurseLayout from './layouts/NurseLayout/NurseLayout'
import Home from './pages/home/home'
import Login from './pages/login/login'
import HealthRecordCensorship from './pages/nurse/healthRecordCensorship/HealthRecordCensorship'
import HealthRecord from './pages/parent/healthRecord/healthRecord'
import ProfileParent from './pages/parent/profile/profileParent'
// import ScheduleVaccination from './pages/nurse/scheduleVaccination/ScheduleVaccination'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import AppointmentCheck from './pages/admin/AppointmentCheck/AppointmentCheck'
import BlogDetail from './pages/admin/BlogManagement/BlogDetail'
import BlogList from './pages/admin/BlogManagement/Bloglist'
import CategoryManagement from './pages/admin/CategoryManagement/CategoryManagement'
import CensorList from './pages/admin/censorManagement/CensorList'
import ClassList from './pages/admin/classroomManagement/Classlist'
import DashBoardAdmin from './pages/admin/dashBoardAdmin/DashBoardAdmin'
import GradeList from './pages/admin/gradeManagement/GradeList'
import MedicalCheckEvent from './pages/admin/medicalCheckEvent'
import StudentList from './pages/admin/studentManagement/StudentList'
import UserList from './pages/admin/userManagement/UserList'
import DashBoardNurse from './pages/nurse/dashboardNurse/DashBoardNurse'
import MedicalReport from './pages/nurse/medicalReport/MedicalReport'
import MedicalSuppliesList from './pages/nurse/medicalSupplies/MedicalSuppliesList'
import MedicinesList from './pages/nurse/medicines/MedicinesList'
import PrivateConsultation from './pages/nurse/privateConsultation/PrivateConsultation'
import ReceiveMedicine from './pages/nurse/receiveMedicine/ReceiveMedicine'
import ResultsAfterMedicalEvent from './pages/nurse/resultsAfterMedicalEvent/ResultsAfterMedicalEvent'
import ResultsAfterVaccination from './pages/nurse/resultsAfterVaccination'
import Blog, { BlogPost } from './pages/parent/blog'
import MedicalEventParent from './pages/parent/medicalEvent/medicalEventParent'
import MedicineSubmissions from './pages/parent/medicineSubmissions/medicineSubmissions'
import AppointmentPage from './pages/parent/privateConsultation/AppointmentPage'
import VaccinationSchedule from './pages/parent/vaccinationSchedule/VaccinationSchedule'
import Register from './pages/register'
import VaccineRegistrationList from './pages/admin/censorManagement/VaccineRegistrationList'
import AppointmentVaccine from './pages/nurse/appointmentVaccine/AppointmentVaccine'
import RegisterVaccine from './pages/registerVaccine/RegisterVaccine'
import RegisterMedicalCheck from './pages/registerMedicalCheck/RegisterMedicalCheck'
import AppointmentMedicalCheck from './pages/nurse/appointmentMedicalCheck/AppointmentMedicalCheck'

export default function useRouteElements() {
  const routeElements = useRoutes([
    // MAIN routes

    {
      path: path.login,
      element: <Login />
    },
    {
      path: path.register,
      element: <Register loading={false} />
    },

    // PARENT routes
    {
      path: '',
      element: <ProtectedRoute requiredRole='PARENT' />,
      children: [
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
              path: path.medicineSubmissions,
              element: <MedicineSubmissions />
            },
            {
              path: path.Appointment,
              element: <AppointmentPage />
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
        }
      ]
    },

    //================ NURSE routes ================
    {
      path: path.BASE_NURSE,
      element: <ProtectedRoute requiredRole='SCHOOL-NURSE' />,
      children: [
        {
          path: path.BASE_NURSE,
          element: <NurseLayout />,
          children: [
            // {
            //   path: path.DASHBOARD_NURSE,
            //   element: <DashBoardNurse />
            // },
            {
              path: path.HEALTH_RECORD_CENSORSHIP,
              element: <HealthRecordCensorship />
            },
            // {
            //   path: path.SCHEDULE_VACCINATION,
            //   element: <ScheduleVaccination />
            // },
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
              path: path.MEDICINES,
              element: <MedicinesList />
            },
            {
              path: path.MEDICAL_SUPPLIES,
              element: <MedicalSuppliesList />
            },
            {
              path: path.RESULTS_AFTER_MEDICAL_CHECK,
              element: <ResultsAfterMedicalEvent />
            },
            {
              path: path.PRIVATE_CONSULTATION,
              element: <PrivateConsultation />
            },
            {
              path: path.APPOINTMENT_VACCINE,
              element: <AppointmentVaccine />
            },
            {
              path: path.REGISTER_VACCINE,
              element: <RegisterVaccine />
            },
            {
              path: path.REGISTER_MEDICAL_CHECK,
              element: <RegisterMedicalCheck />
            },
            {
              path: path.MEDICAL_CHECK_APPOINTMENT,
              element: <AppointmentMedicalCheck />
            }
          ]
        }
      ]
    },

    //================ ADMIN routes ================
    {
      path: path.BASE_ADMIN,
      element: <ProtectedRoute requiredRole='ADMIN' />,
      children: [
        {
          path: path.BASE_ADMIN,
          element: <AdminLayout />,
          children: [
            {
              path: path.DASHBOARD_ADMIN,
              element: <DashBoardAdmin />
            },
            {
              path: path.MEDICAL_PLAN,
              element: <MedicalCheckEvent />
            },
            {
              path: path.CENSOR_LIST,
              element: <CensorList />
            },
            {
              path: path.Appointment_Check,
              element: <AppointmentCheck />
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
            },
            {
              path: path.VACCINE_REGISTRATION,
              element: <VaccineRegistrationList />
            }
          ]
        }
      ]
    }
  ])
  return routeElements
}
