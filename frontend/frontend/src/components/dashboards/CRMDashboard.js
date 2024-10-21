import React, { useState } from 'react';
import Sidebar from '../sidebar'; // Ensure this path is correct
import Client from '../Cclients/Client';
import Consultation from '../Cclients/Consultation';
import ReportPage from '../Creports/ReportPage';
import ReadPage from '../Creports/ReadPage';
import EnvironmentalReportRead from '../Creports/EnvironmentalReportRead'
import SurveyorReportRead from '../Creports/SurveyorReportRead';
import SoilReportForm from '../Creports/SoilReportForm';
import EnvironmentalReportForm from '../Creports/EnvironmentalReportForm';
import SurveyorReportForm from '../Creports/SurveyorReportForm';
import PermitDisplay from '../Cvendorspermits/PermitDisplay';
import ArchitectDashboard from '../Cappointments/ArchitectDashboard';

function CRMDashboard() {
  const [activeSection, setActiveSection] = useState('Client Control');
  const [clientData, setClients] = useState({}); // Store the current project details for inspection
  const [selectedReport, setSelectedReport] = useState(null); // To store the selected report for editing
  const [selectedEReport, setSelectedEReport] = useState(null); // To store the selected report for editing
  const [selectedSReport, setSelectedSReport] = useState(null); // To store the selected report for editing

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

   // Function to handle navigation to "Create Inspection" with project data
   const handleCreateReqWithClient = (clientsDetails) => {
    setClients(clientsDetails); // Store the project details for the inspection form
    setActiveSection('Clientreq'); // Switch to CreateInspection section
  };

  // Function to switch to the ReportsPage
  const handleReportPageSuccess = () => {
    setActiveSection('ReportsPage');
  };

  // Function to switch to the SoilPage (ReadPage)
  const handleSoilPageSuccess = () => {
    setActiveSection('SoilPage'); // Switch to ReadPage after submission
  };

  // Function to switch to the SoilPage (ReadPage)
  const handleEnvPageSuccess = () => {
    setActiveSection('EnvPage'); // Switch to ReadPage after submission
  };

  // Function to switch to the SoilPage (ReadPage)
  const handleSurveyPageSuccess = () => {
    setActiveSection('Survey'); // Switch to ReadPage after submission
  };

    // Function to handle switching to update form with selected report
  const handleEditReport = (report) => {
    setSelectedReport(report);  // Store the report details for editing
    setActiveSection('SoilReportForm');  // Switch to the SoilReportForm section
  };

     // Function to handle switching to update form with selected report
     const handleEditEReport = (report) => {
      setSelectedEReport(report);  // Store the report details for editing
      setActiveSection('EnvForm');  // Switch to the SoilReportForm section
    };

      // Function to handle switching to update form with selected report
      const handleEditSReport = (report) => {
        setSelectedSReport(report);  // Store the report details for editing
        setActiveSection('SurveyForm');  // Switch to the SoilReportForm section
      };
  

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Client Control':
        return (
          <div style={{ padding: '20px' }}>
            <Client setClients={handleCreateReqWithClient} onSucess={handleReportPageSuccess} />
          </div>
        );

        case 'Permits Hub':
          return (
            <div style={{ padding: '20px' }}>
              <PermitDisplay  />
            </div>
          );

      case 'ReportsPage':
        return (
          <div style={{ padding: '20px' }}>
            <ReportPage onSuccessSoil={handleSoilPageSuccess} onSucessEnv={handleEnvPageSuccess} onSuccessSurvey={handleSurveyPageSuccess} />
          </div>
        );
      case 'SoilPage':
        return (
          <div style={{ padding: '20px' }}>
            <ReadPage onEditReport={handleEditReport} backtoForm={handleReportPageSuccess} />
          </div>
        );
       
      case 'EnvPage':
          return (
            <div style={{ padding: '20px' }}>
              <EnvironmentalReportRead onEditEReport={handleEditEReport} backtoForm={handleReportPageSuccess}/>
            </div>
          );

      case 'Survey':
          return (
            <div style={{ padding: '20px' }}>
              <SurveyorReportRead onEditSReport = {handleEditSReport} backtoForm={handleReportPageSuccess}/>
            </div>
          );

      case 'Clientreq':
        return (
          <div style={{ padding: '20px' }}>
            <Consultation
              project_name={clientData.project_name}
              client_name={clientData.client_name}
              consul_date={clientData.consul_date}
            />
          </div>
        );
        case 'SoilReportForm':  // New case to handle SoilReportForm
            return (
                <div style={{ padding: '20px' }}>
                    <SoilReportForm
                        report={selectedReport}  // Pass the selected report
                        onSuccessSoil={handleSoilPageSuccess} // Handle success navigation
                    />
                </div>
            );
        case 'EnvForm':
              return (
                <div style={{ padding: '20px' }}>
                  <EnvironmentalReportForm 
                    report={selectedEReport}
                    onSucessEnv={handleEnvPageSuccess}
                  />
                </div>
              );

        case 'SurveyForm':
                return (
                  <div style={{ padding: '20px' }}>
                    <SurveyorReportForm 
                      report={selectedSReport}
                      onSuccessSurvey={handleSurveyPageSuccess}
                    />
                  </div>
                );
          case 'Meeting Scheduler':
                  return <ArchitectDashboard/>;
      default:
        return null;
    }
  };

  return (
    <div>
      <Sidebar
        role="CRM"
        userName="Taylor"
        onSectionChange={handleSectionChange}
      />
      <div style={{ paddingLeft: '220px', marginTop: '100px' }}>
        {renderActiveSection()}
      </div>
    </div>
  );
}

export default CRMDashboard;
