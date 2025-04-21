import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from './Pages/Home/Home'

import Interviewnext from './Pages/Interviewnext'
import UploadResume from './Pages/Resumeupload';
import InterviewPage from './Pages/InterviewPage';
import InterviewAnalysis from './Pages/InterviewAnalysis';
import CreateInterview from './Pages/CreateInterview/CreateInterview';
import Addqs from './Pages/Addqs';
import QuestionBox from './Pages/CreateInterview/Generatedq';
import SelectedQuestionsPage from './Pages/CreateInterview/selectedq';
import CandidateDashboard from './Pages/CandidateDashboard';
import CompanyDashboard from './Pages/CompanyDashboard';
import Interview from './Pages/CreateInterview/interview';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="app-container">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} /> //text color changes
            <Route path="/interviewnext" element={<Interviewnext />} />//ready
            <Route path="/uploadresume" element={<UploadResume />} />//ready
            <Route path="/interviewpage" element={<InterviewPage />} />/// done //more changes corner radius sizes and shadow
            <Route path="/interviewanalysis" element={<InterviewAnalysis />} />//progress bar remaining //done //dialog box for interview completion and go to analysis////done
            <Route path="/interview" element={<Interview />} />//changes to be done 1.//done level 1
            <Route path="/CandidateDashboard" element={<CandidateDashboard />} />
            <Route path="/CompanyDashboard" element={<CompanyDashboard />} />

            {/* bu  ading to dialog boxes  
            
ek new card for your progress  */}
            {/* pencils in front of company dashboards interviews */}//done
            {/* //convert these 3 pages into scrollable page */}
            {/* sidebar highlilghting differently */} //done
            {/*  navigation also only backward */}//navigation left

            {/* two dashboards remaining */}

          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
