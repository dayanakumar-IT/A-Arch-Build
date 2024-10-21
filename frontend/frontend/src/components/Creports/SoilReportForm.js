// src/components/SoilReportForm.js
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const SoilReportForm = ({report, onSuccessSoil}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [soilType, setSoilType] = useState('');
    const [moistureContent, setMoistureContent] = useState(50);
    const [phLevel, setPhLevel] = useState('');
    const [phColor, setPhColor] = useState('#ffffff');
    const [document, setDocument] = useState(null);
    const [existingDocumentName, setExistingDocumentName] = useState(''); 
    const [existingDocument, setExistingDocument] = useState(''); // Store the URL of the existing document
    const [compactionLevel, setCompactionLevel] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if we are updating an existing report or creating a new one
    useEffect(() => {
        if (report) {
            // If report is passed as a prop, pre-fill the form
            setSoilType(report.soilType);
            setMoistureContent(report.moistureContent);
            setPhLevel(report.phLevel);
            setCompactionLevel(report.compactionLevel);
            setExistingDocument(report.document);
            setIsUpdate(true);
            setLoading(false);
        } else if (id) {
            // If no report is passed but id is available, fetch the report details
            fetchReportDetails(id);
            setIsUpdate(true);
        } else {
            setLoading(false);
        }
    }, [report, id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/soil-report/${reportId}`);
            const data = await response.json();
            setSoilType(data.soilType);
            setMoistureContent(data.moistureContent);
            setPhLevel(data.phLevel);
            setCompactionLevel(data.compactionLevel);
            handlePhLevelChange({ target: { value: data.phLevel } });
            setExistingDocumentName(data.document.split('/').pop());
            setExistingDocument(data.document); // Store the document URL for preview
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setLoading(false);
        }
    };

    const handlePhLevelChange = (e) => {
        const value = e.target.value;
        setPhLevel(value);

        if (value < 3) {
            setPhColor('#ff9999');
        } else if (value >= 3 && value <= 6) {
            setPhColor('#ffff99');
        } else if (value > 6 && value <= 8) {
            setPhColor('#99ff99');
        } else if (value > 8 && value <= 10) {
            setPhColor('#99ccff');
        } else {
            setPhColor('#ccccff');
        }
    };

    const handleFileChange = (e) => {
        setDocument(e.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('soilType', soilType);
        formData.append('moistureContent', moistureContent);
        formData.append('phLevel', phLevel);
        formData.append('compactionLevel', compactionLevel);
        if (document) {
            formData.append('document', document);
        }

        try {
            const response = await fetch(
                `http://localhost:8000/report/api/soil-report${isUpdate ? `/${report._id}` : ''}`,
                {
                    method: isUpdate ? 'PUT' : 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const result = await response.json();
                toast.success(isUpdate ? 'Soil Report Updated' : 'Soil Report Submitted', {
                    position: 'top-right',
                    className: 'toast-message',
                });
                // Add a delay before calling onSuccessSoil
                setTimeout(() => {
                    onSuccessSoil(); // Call the success callback to switch to ReadPage after the delay
                }, 2000); // Delay for 2 seconds (2000 milliseconds)

            } else {
                toast.error('Failed to submit Soil Report', {
                    position: 'top-right',
                    className: 'toast-message',
                });
            }
        } catch (error) {
            toast.error('Error submitting Soil Report', {
                position: 'top-right',
                className: 'toast-message',
            });
            console.error('Error submitting Soil Report:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const getMoistureColor = (value) => {
        if (value <= 30) return '#ff9999';
        if (value > 30 && value <= 60) return '#99ff99';
        return '#ffcc99';
    };

    const getMoistureSuggestion = (value) => {
        if (value <= 30) {
            return 'The moisture content is too low, which may make the soil less stable for construction without proper treatment.';
        }
        if (value > 30 && value <= 60) {
            return 'The moisture content is optimal, making the soil suitable for construction with minimal adjustments.';
        }
        return 'The moisture content is too high, which may lead to soil instability and require drainage solutions before construction.';
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            <ToastContainer /> {/* Include ToastContainer for toasts */}
            <h2>{isUpdate ? 'Update Soil Report' : 'Soil Report'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="soilType">Soil Type:</label>
                    <select
                        id="soilType"
                        name="soilType"
                        
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        style={{ width: '100%', marginBottom:'20px' }}
                        required
                    >
                        <option value="">Select Soil Type</option>
                        <option value="Clay">Clay</option>
                        <option value="Silt">Silt</option>
                        <option value="Sand">Sand</option>
                        <option value="Loam">Loam</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="upload">Upload Document/Image:</label>
                    <input
                        type="file"
                        id="upload"
                        style={{ marginBottom:'20px' }}
                        name="upload"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required={!isUpdate}
                    />
                    {isUpdate && existingDocument && !document && (
                        <div style={{ marginTop: '10px' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8000/report/${existingDocument}`}
                                alt="Soil Report"
                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="moistureContent">Moisture Content: {moistureContent}%</label>
                    <input
                        type="range"
                        id="moistureContent"
                        name="moistureContent"
                        min="0"
                        max="100"
                        value={moistureContent}
                        onChange={(e) => setMoistureContent(e.target.value)}
                        style={{
                            background: `linear-gradient(to right, ${getMoistureColor(moistureContent)} ${moistureContent}%, #e0e0e0 ${moistureContent}%)`,
                            width: '100%',
                            height: '10px',
                            borderRadius: '5px',
                            appearance: 'none',
                            outline: 'none',
                        }}
                    />
                    <div style={{ color: '#000', marginTop: '10px' }}>
                        {getMoistureSuggestion(moistureContent)}
                    </div>
                </div>

                <div>
                    <label htmlFor="phLevel" style={{ marginTop:'10px' }}>pH Level:</label>
                    <input
                        type="number"
                        id="phLevel"
                        name="phLevel"
                        value={phLevel}
                        onChange={handlePhLevelChange}
                        min="0"
                        max="14"
                        step="0.1"
                        required
                        style={{ backgroundColor: phColor, width: '100%' }}
                    />
                </div>

                <div>
                    <label htmlFor="compactionLevel" style={{ marginTop:'20px' }}>Compaction Level (psi):</label>
                    <input
                        type="number"
                        id="compactionLevel"
                        name="compactionLevel"
                        value={compactionLevel}
                        onChange={(e) => setCompactionLevel(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                <Button variant="contained" color="primary" type="submit" style={{ marginTop: '15px', width: '100%' }}>
                    {isUpdate ? 'Update Soil Report' : 'Submit Soil Report'}
                </Button>
            </form>

            <style jsx>{`
                .report-image {
                    width: 100%;
                    border-radius: 8px;
                }

                .summary-title::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: #075e86;
                    visibility: hidden;
                    transform: scaleX(0);
                    transition: all 0.3s ease-in-out;
                }

                .summary-title:hover::after {
                    visibility: visible;
                    transform: scaleX(1);
                }

                .summary-content {
                    animation: slide-in 0.5s ease-in-out forwards;
                }

                @keyframes slide-in {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default SoilReportForm;
