import React, { useState } from 'react';
import Sidebar from '../sidebar';
import CreateInspectionForm from '../Cinspectionsschedule/createinspectionform';
import InspectionsDisplay from '../Cinspectionsschedule/InspectionsDisplay';
import ProjectRead from '../Cprojects/ProjectRead';
import ProjectCreate from '../Cprojects/ProjectCreate';
import CreateTask from '../Cprojects/CreateTask';
import ReadTasks from '../Cprojects/ReadTasks';
import VendorList from '../Cvendorspermits/VendorList';
import ProposalsList from '../Cproposals/ProposalsList';
import ProcurementList from '../Cproposals/ProcurementList';
import CreateProcurement from '../Cproposals/CreateProcurement';

function ProjectManagerDashboard() {
    // State to track the active section in the sidebar
    const [activeSection, setActiveSection] = useState('Project Hub'); // Default to Project Hub
    const [inspectionData, setInspectionData] = useState({}); // Store the current project details for inspection
    

    // Function to handle section change
    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

     // Function to handle navigation to "Create Inspection" with project data
     const handleCreateInspectionWithProject = (projectDetails) => {
        setInspectionData(projectDetails); // Store the project details for the inspection form
        setActiveSection('CreateInspection'); // Switch to CreateInspection section
    };

    // Function to handle successful inspection creation
    const handleCreateInspectionSuccess = () => {
        setActiveSection('Inspection'); // Switch back to InspectionsDisplay
    };

    const handleCreateProjectSuccess = () => {
        setActiveSection('Project Hub'); // Switch back to InspectionsDisplay
    };

    const handleTaskCreateSuccess = () => {
        setActiveSection('CreateTask'); // Switch back to InspectionsDisplay
    };

    const handleTaskDisplaySuccess = () => {
        setActiveSection('Control Center'); // Switch back to InspectionsDisplay
    };

    const createprocurement = () => {
        setActiveSection('CreateProcurement'); // Switch back to InspectionsDisplay
    };

    const getprolista = () => {
        setActiveSection('Procurements'); // Switch back to InspectionsDisplay
    };


  

    // Function to render the appropriate component based on the active section
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'Inspection':
                return (
                    <div style={{ padding: '20px' }}>
                       
                        <InspectionsDisplay onCreateSuccess={handleCreateInspectionSuccess} onAddInspectionClick={() => setActiveSection('CreateInspection')} />
                    </div>
                );
            case 'CreateInspection':
                return (
                    <div style={{ padding: '20px' }}>
                            <CreateInspectionForm
                                onSuccess={handleCreateInspectionSuccess}
                                projectName={inspectionData.projectName}
                                siteCode={inspectionData.siteCode}
                                locationState={inspectionData.locationState}
                            />
                    </div>
                );

            case 'Project Hub':
                    return <ProjectRead setActiveSection={setActiveSection} setInspection={handleCreateInspectionWithProject} />;
            case 'CreateProject':
                        return <ProjectCreate onSuccessProject={handleCreateProjectSuccess} />;
            case 'Control Center':
                            return <ReadTasks onSuccessTask={handleTaskCreateSuccess} />;
            case 'CreateTask':
                            return <CreateTask onSuccessTaskAssigned={handleTaskDisplaySuccess} />;
            case 'Vendor Vault':
                    return  <VendorList/>;
            case 'Proposals':
                        return  <ProposalsList/>;
            case 'Procurements':
                        return  <ProcurementList createformprocu={createprocurement}/>;
            case 'CreateProcurement':
                            return  <CreateProcurement getprolist={getprolista}/>;
                       
                
           
            
            // Add more cases for additional sections as needed
            default:
                return <div></div>;
        }
    };

    return (
        <div>
            <Sidebar
                role="Project Manager"
                userName="Akashwaran"
                onSectionChange={handleSectionChange}
            />

            <div style={{ paddingLeft: '220px', marginTop: '100px' }}>
                {renderActiveSection()}
            </div>
        </div>
    );
}

export default ProjectManagerDashboard;
