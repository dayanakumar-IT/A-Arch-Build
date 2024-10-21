import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your components
import ProjectManagerDashboard from './components/dashboards/ProjectManagerDashboard';
import FinancialManagerDashboard from './components/dashboards/FinancialManagerDashboard';
import ArchitectDashboard from './components/dashboards/ArchitectDashboard';
import CRMDashboard from './components/dashboards/CRMDashboard';
import QualityAssuranceDashboard from './components/dashboards/QualityAssuranceDashboard';
import SiteManagerDashboard from './components/dashboards/SiteManagerDashboard';
import NavScrollExample from './components/navibar';
import LoginPage from './components/login'; // Ensure the path is correct
import InspectionsDisplay from './components/Cinspectionsschedule/InspectionsDisplay';
import ProjectRead from './components/Cprojects/ProjectRead';
import InspectRecordForm from './components/CinspectRecords/inspectRecordForm';
import ProjectForDailyLog from './components/Cdailylog/projectDisplay'


function MainContent() {
    const location = useLocation(); // Hook must be inside Router

    // Conditionally render NavScrollExample for dashboard paths
    const showNavbar = location.pathname !== '/'; // Show navbar on all paths except root '/'

    return (
        <DndProvider backend={HTML5Backend}>
        <div className="container-fluid">
            {showNavbar && <NavScrollExample />}
            <div className="row">
                <div className="col">
                    <Routes>
                        <Route path="/" element={<LoginPage />} /> {/* Root path */}
                        <Route path="/inspections" element={<InspectionsDisplay />} />
                        <Route path="/project-manager" element={<ProjectManagerDashboard />} />
                        <Route path="/financial-manager" element={<FinancialManagerDashboard />} />
                        <Route path="/architect" element={<ArchitectDashboard />} />
                        <Route path="/crm" element={<CRMDashboard />} />
                        <Route path="/quality-assurance" element={<QualityAssuranceDashboard />} />
                        <Route path="/site-manager" element={<SiteManagerDashboard />} />
                       
                    </Routes>
                </div>
            </div>
        </div>
        </DndProvider>
    );
}

function App() {
    return (
        <Router>
            <MainContent />
        </Router>
    );
}

export default App;
