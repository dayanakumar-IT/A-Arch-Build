// src/components/dashboards/QualityAssuranceDashboard.js

import React, { useState } from 'react';
import Sidebar from '../sidebar';
import NotificationDashboard from '../Cinspectionsschedule/NotificationDashboard.js';
import MorganInspectionsTimeline from '../Cinspectionsschedule/morganinspection.js'; // Import the new component
import InspectRecordForm from '../CinspectRecords/inspectRecordForm.js'
import ProjectForDailyLog from '../Cdailylog/projectDisplay.js';
import ProgressForm from '../Cdailylog/ProgressForm.js';
import ProgressList from '../Cdailylog/ProgressList.js';
import Progress from '../Cdailylog/Progress.js';
import Issue from '../Cdailylog/Issues.js';

function QualityAssuranceDashboard() {
    // State to track the active section in the sidebar
    const [activeSection, setActiveSection] = useState('Inspection Hub');
    const [inspectionData, setInspectionData] = useState({});
    const [dailylogData, setDailyLog] = useState({});
    const [dailyissueData, setDailyIssue] = useState({});

    // Function to handle section change
    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    const handleCreateRecordWithInspection = (inspectionDetails) =>{
        setInspectionData(inspectionDetails);
        setActiveSection('CreateRecord');
    };

    const handleCreateDailyLogWithProject = (projectDetails) =>{
        setDailyLog(projectDetails);
        setActiveSection('CreateDailyLog');
    };

    const handleCreateDailyIssueWithProject = (project_Details) =>{
        setDailyIssue(project_Details);
        setActiveSection('CreateIssue');
    };

    const handleCreateDailyLogSuccess = () => {
        setActiveSection('DailyLogDisplay'); // Switch to the ProgressList section
    };
      
    const handledailylogEdit = () => {
        setActiveSection('editFetchProgres'); // Switch back to InspectionsDisplay
    };

    const handlenavigation = () => {
        setActiveSection('Inspection Reports'); // Switch back to InspectionsDisplay
    };



    // Function to render the appropriate component based on the active section
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'Inspection Hub':
                return (
                    <div style={{ padding: '20px' }}>
                        <NotificationDashboard />
                    </div>
                );
            case 'Inspection Reports':
                return (
                    <div style={{ padding: '20px' }}>
                        <MorganInspectionsTimeline setInsRecord={handleCreateRecordWithInspection} />
                    </div>
                );
            case 'editFetchProgres':
                    return (
                        <div style={{ padding: '20px' }}>
                            <ProgressForm  onSuccessProgress = {handleCreateDailyLogSuccess}/>
                        </div>
                    );
                    case 'CreateDailyLog':
                        return (
                          <div style={{ padding: '20px' }}>
                            <ProgressForm
                              onSuccessProgress={handleCreateDailyLogSuccess}  // Ensure this is passed
                              site_code={dailylogData.siteCode}
                              location_name={dailylogData.locationName}
                            />
                          </div>
                        );

                case 'CreateIssue':
                    return(
                        <div style={{ padding: '20px' }}>
                        <Issue
                            site_code = {dailyissueData.siteCode}
                            location_name = {dailyissueData.locationName}
                         />
                    </div>
                    );

                case 'CreateRecord':
                return(
                    <div style={{ padding: '20px' }}>
                    <InspectRecordForm
                        navigt={handlenavigation}
                        iTitle = {inspectionData.iTitle}
                        iType = {inspectionData.iType}
                        iDate = {inspectionData.iDate}
                        iTime = {inspectionData.iTime}
                     />
                </div>
                );

                case 'Daily Log':
                    return (
                        <div style={{ padding: '20px' }}>
                            <ProjectForDailyLog setDailyLog={handleCreateDailyLogWithProject} setDailyIssue={handleCreateDailyIssueWithProject}/>
                        </div>
                    );
                
                case 'DailyLogDisplay':
                    return (
                        <div style={{ padding: '20px' }}>
                                <ProgressList onSuccessEditDailyLog = {handledailylogEdit}/>
                        </div>
                    );
            // Add more cases for additional sections as needed
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    return (
        <div>
            <Sidebar role="QA Inspector" userName="Morgan" onSectionChange={handleSectionChange} />

            <div style={{ paddingLeft: '220px', marginTop: '100px' }}>
                {renderActiveSection()}
            </div>
        </div>
    );
}

export default QualityAssuranceDashboard;
