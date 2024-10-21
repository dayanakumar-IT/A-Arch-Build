// src/components/ReportPage.js
import React, { useState } from 'react';
import Modal from 'react-modal'; // Import Modal for the popup
import SoilReportForm from './SoilReportForm'; // Import the SoilReportForm component
import EnvironmentalReportForm from './EnvironmentalReportForm'; // Import the EnvironmentalReportForm component
import SurveyorReportForm from './SurveyorReportForm'; // Import the SurveyorReportForm component
import { Button } from '@mui/material'; // Import MUI Button

Modal.setAppElement('#root'); // Accessibility for screen readers

const ReportPage = ({onSuccessSoil, onSucessEnv, onSuccessSurvey}) => {
    const [activeReport, setActiveReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to open the modal and set the active report
    const openModal = (reportType) => {
        setActiveReport(reportType);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setActiveReport(null);
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: "space-around",
            padding: '20px', 
            height: 'auto', 
            flexGrow: 1, 
            flexWrap: 'nowrap' 
        }}>
            {/* Image containers */}
            <div 
                style={{ 
                    width: '30%', 
                    textAlign: 'center', 
                    cursor: 'pointer' 
                }} 
                onClick={() => openModal('soil')}
            >
                <img 
                    src="Soil-Testing-Labs.jpg" 
                    alt="Soil Report" 
                    style={{ 
                        width: '100%', 
                        height: '600px', 
                        objectFit: 'cover', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        transition: 'transform 0.3s ease' 
                    }} 
                    className="report-image" 
                />
                <p>Soil Report</p>
            </div>

            <div 
                style={{ 
                    width: '30%', 
                    textAlign: 'center', 
                    cursor: 'pointer' 
                }} 
                onClick={() => openModal('environmental')}
            >
                <img 
                    src="Env-Repo.avif" 
                    alt="Environmental Report" 
                    style={{ 
                        width: '100%', 
                        height: '600px', 
                        objectFit: 'cover', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        transition: 'transform 0.3s ease' 
                    }} 
                    className="report-image" 
                />
                <p>Environmental Report</p>
            </div>

            <div 
                style={{ 
                    width: '30%', 
                    textAlign: 'center', 
                    cursor: 'pointer' 
                }} 
                onClick={() => openModal('survey')}
            >
                <img 
                    src="Surveyor_Report.jpg" 
                    alt="Survey Report" 
                    style={{ 
                        width: '100%', 
                        height: '600px', 
                        objectFit: 'cover', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        transition: 'transform 0.3s ease' 
                    }} 
                    className="report-image" 
                />
                <p>Survey Report</p>
            </div>

            {/* Modal Popup */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Report Form"
                style={{
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '900px',
                        height: '550px',
                        overflowY: 'auto'
                    },
                    overlay: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    }
                }}
            >
                {activeReport === 'soil' && <SoilReportForm onSuccessSoil={onSuccessSoil} />}
                {activeReport === 'environmental' && <EnvironmentalReportForm onSucessEnv={onSucessEnv}/>}
                {activeReport === 'survey' && <SurveyorReportForm onSuccessSurvey={onSuccessSurvey}/>}
                
                {/* MUI Close Button at the bottom */}
                <Button variant="outlined" color="secondary" onClick={closeModal} style={{ marginTop: '20px' }}>
                    Close
                </Button>
            </Modal>
        </div>
    );
};

export default ReportPage;
