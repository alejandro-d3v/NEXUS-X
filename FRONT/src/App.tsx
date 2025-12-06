import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { GenerateActivity } from './pages/GenerateActivity';
import { GenerateExam } from './pages/GenerateExam';
import { GenerateSummary } from './pages/GenerateSummary';
import { GenerateRubric } from './pages/GenerateRubric';
import { GenerateFlashcards } from './pages/GenerateFlashcards';
import { GenerateEssay } from './pages/GenerateEssay';
import { GenerateGame } from './pages/GenerateGame';
import { WritingCorrection } from './pages/WritingCorrection';
import { GenerateSurvey } from './pages/GenerateSurvey';
import { MyActivities } from './pages/MyActivities';
import { PublicActivities } from './pages/PublicActivities';
import { ActivityDetail } from './pages/ActivityDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GenerateActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-exam"
            element={
              <ProtectedRoute>
                <GenerateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-summary"
            element={
              <ProtectedRoute>
                <GenerateSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-rubric"
            element={
              <ProtectedRoute>
                <GenerateRubric />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-flashcards"
            element={
              <ProtectedRoute>
                <GenerateFlashcards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-essay"
            element={
              <ProtectedRoute>
                <GenerateEssay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-game"
            element={
              <ProtectedRoute>
                <GenerateGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/writing-correction"
            element={
              <ProtectedRoute>
                <WritingCorrection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-survey"
            element={
              <ProtectedRoute>
                <GenerateSurvey />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-activities"
            element={
              <ProtectedRoute>
                <MyActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public-activities"
            element={
              <ProtectedRoute>
                <PublicActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity/:id"
            element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
