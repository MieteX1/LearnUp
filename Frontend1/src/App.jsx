import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/DashboardPage';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import ContactPage from "./pages/ContactPage.jsx";
import AddTaskCollection from './pages/AddTaskCollection';
import { PrivateRoute } from './context/PrivateRoute.jsx';
import EditTaskCollection from './pages/EditTaskCollection.jsx';
import SearchTaskCollection from './pages/SearchTaskCollection.jsx';
import EmailVerification from './components/Register/EmailVerification.jsx';
import PasswordReset from './components/Register/PasswordReset.jsx';
import ForgotPassword from "./components/Register/ForgotPassword.jsx";
import PostRegistration from "./components/Register/PostRegistration.jsx";
import UserSettingsPage from "./pages/UserSettingsPage.jsx";
import UserProfile from "./pages/ProfilePage.jsx";
import AdminPanel from "./pages/AdminPanelPage.jsx";
import ModeratorRegisterStage2 from "./components/Register/ModeratorRegisterStage2.jsx";
import TaskCollectionDetails from "./pages/TaskCollectionDetails.jsx";
import { AdminRoute } from './context/AdminRoute.jsx';
import CollectionTaskProgess from './pages/CollectionTaskProgess.jsx';
import TaskDetails from './pages/TaskDetails';
import LibraryPage from './pages/LibraryPage';
import { AlertProvider } from './components/ui/Alert';
import ScrollToTop from './hooks/ScrollToTop.js';
import ErrorPage from "./components/ErrorPage.jsx";
function App() {
  return (
    <AlertProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mt-[88px]">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/email-verify" element={<EmailVerification />} />
            <Route path="/post-registration" element={<PostRegistration />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/moderator-registration-stage2" element={<ModeratorRegisterStage2 />} />
            <Route path="/403" element={<ErrorPage code={403} />} />
            <Route path="*" element={<ErrorPage code={404} />} />
            {/* Protected routes */}
            <Route path="/task-collection/:id" element={<TaskCollectionDetails />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>}/>
            <Route path="/settings" element={<PrivateRoute><UserSettingsPage /></PrivateRoute>} />
            <Route path="/add-task-collection" element={<PrivateRoute><AddTaskCollection /></PrivateRoute>}/>
            <Route path="/profile/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>}/>
            <Route path="/collection/progress/:id" element={<PrivateRoute><CollectionTaskProgess /></PrivateRoute>} />
            <Route path="/edit/task-collection/:id" element={<PrivateRoute><EditTaskCollection /></PrivateRoute>}/>
            <Route path="/:type/:id" element={<PrivateRoute><TaskDetails /></PrivateRoute>} />
            <Route path="/library" element={<PrivateRoute><LibraryPage /></PrivateRoute>} />
            <Route path="/search-task-collection/:line" element={<PrivateRoute><SearchTaskCollection /></PrivateRoute>} />
            {/* Admin route  */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>}/>
          </Routes>
        </main>
        <Footer />
      </div>
   </AlertProvider>
  );
}

export default App;