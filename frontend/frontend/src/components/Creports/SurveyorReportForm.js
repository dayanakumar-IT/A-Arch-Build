import React, { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SurveyorReportForm = ({ report, onSuccessSurvey }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        landArea: '',
        document: null, // Document is handled separately
        elevation: '',
        topography: '',
        boundaryDetails: {
            clearlyMarked: false,
            disputed: false,
        },
    });

    const [existingDocument, setExistingDocument] = useState(''); // Store existing document URL
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        // If report prop is passed, prefill the form fields
        if (report) {
            setFormData({
                landArea: report.landArea || '',
                elevation: report.elevation || '',
                topography: report.topography || '',
                boundaryDetails: {
                    clearlyMarked: report.boundaryDetails?.clearlyMarked || false,
                    disputed: report.boundaryDetails?.disputed || false,
                },
            });
            setExistingDocument(report.document || ''); // Store existing document for preview
            setIsUpdate(true); // Set update mode
        }
    }, [report]);

    useEffect(() => {
        if (id && !report) {
            fetchReportDetails(id);
        }
    }, [id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/surveyor-report/${reportId}`);
            const data = await response.json();
            setFormData({
                landArea: data.landArea || '',
                elevation: data.elevation || '',
                topography: data.topography || '',
                boundaryDetails: {
                    clearlyMarked: data.boundaryDetails?.clearlyMarked || false,
                    disputed: data.boundaryDetails?.disputed || false,
                },
            });
            setExistingDocument(data.document || ''); // Store existing document for preview
            setIsUpdate(true); // Set update mode
        } catch (error) {
            console.error('Error fetching report details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            boundaryDetails: {
                ...prevState.boundaryDetails,
                [name]: checked,
            },
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            document: e.target.files[0], // Set new document
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formDataObj = new FormData();
        formDataObj.append('landArea', formData.landArea);
        formDataObj.append('elevation', formData.elevation);
        formDataObj.append('topography', formData.topography);
        formDataObj.append('boundaryDetails', JSON.stringify(formData.boundaryDetails));
        if (formData.document) {
            formDataObj.append('document', formData.document); // Append new document if uploaded
        }

        try {
            const response = await fetch(
                `http://localhost:8000/report/api/surveyor-report${id ? `/${id}` : ''}`,
                {
                    method: id ? 'PUT' : 'POST',
                    body: formDataObj,
                }
            );

            if (response.ok) {
                toast.success(id ? 'Surveyor Report Updated' : 'Surveyor Report Submitted', {
                    position: 'top-right',
                    className: 'toast-message',
                });

                // Add a delay before calling onSuccessSurvey
                setTimeout(() => {
                    onSuccessSurvey(); // Call the success callback to switch to ReadPage after the delay
                }, 2000); // Delay for 2 seconds (2000 milliseconds)
            } else {
                toast.error('Failed to submit Surveyor Report', {
                    position: 'top-right',
                    className: 'toast-message',
                });
            }
        } catch (error) {
            toast.error('Error submitting Surveyor Report', {
                position: 'top-right',
                className: 'toast-message',
            });
            console.error('Error submitting Surveyor Report:', error);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '350px', margin: '0 auto', padding: '15px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
            <ToastContainer />
            <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>{isUpdate ? 'Update Surveyor Report' : 'New Surveyor Report'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="landArea">Land Area (sq.m):</label>
                    <input
                        type="number"
                        id="landArea"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label htmlFor="upload">Upload Document/Image:</label>
                    <input
                        type="file"
                        id="upload"
                        name="document"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required={!isUpdate}
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                    {isUpdate && existingDocument && !formData.document && (
                        <div style={{ marginTop: '5px', textAlign: 'center' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8000/report/${existingDocument}`}
                                alt="Surveyor Report"
                                style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <label>Boundary Details:</label>
                    <FormGroup row>
                        <FormControlLabel
                            control={<Checkbox checked={formData.boundaryDetails.clearlyMarked} onChange={handleCheckboxChange} name="clearlyMarked" />}
                            label="Clearly Marked"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.boundaryDetails.disputed} onChange={handleCheckboxChange} name="disputed" />}
                            label="Disputed"
                        />
                    </FormGroup>
                </div>
                <div>
                    <label htmlFor="topography">Topography:</label>
                    <select
                        id="topography"
                        name="topography"
                        value={formData.topography}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                    >
                        <option value="">Select Topography</option>
                        <option value="Flat">Flat</option>
                        <option value="Hilly">Hilly</option>
                        <option value="Sloped">Sloped</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="elevation">Elevation (m):</label>
                    <input
                        type="number"
                        id="elevation"
                        name="elevation"
                        value={formData.elevation}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                    />
                </div>
                <Button variant="contained" color="primary" type="submit" style={{ width: '100%' }}>
                    {isUpdate ? 'Update Surveyor Report' : 'Submit Surveyor Report'}
                </Button>
            </form>

            <style jsx>{`
                /* Layout for the ReportPage */
                .report-page {
                  display: flex;
                  justify-content: space-around;
                  align-items: flex-start;
                  padding: 20px;
                  height: 100vh;
                }

                /* Styling for each image container */
                .image-containerR {
                  width: 30%;
                  text-align: center;
                  cursor: pointer;
                }

                .report-image {
                  width: 100%;
                  height: 600px;
                  object-fit: cover;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  transition: transform 0.3s ease;
                }

                .report-image:hover {
                  transform: scale(1.05);
                }

                /* Modal Styles */
                .modal-overlay {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-color: rgba(0, 0, 0, 0.75);
                }

                .modal-contentR {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                  max-width: 500px;
                  width: 90%;
                  max-height: 700px;
                  height: auto;
                  overflow-y: auto;
                }

                /* Styling for the form card inside the modal */
                .card-report-soil {
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                  background-color: white;
                  padding: 20px;
                }

                .soil-report-form {
                  display: flex;
                  flex-direction: column;
                  gap: 10px;
                }

                .soil-report-input,
                .soil-report-select,
                .soil-report-button {
                  padding: 8px;
                  font-size: 1em;
                  width: 100%;
                  border-radius: 5px;
                  border: 1px solid #ccc;
                }

                .soil-report-label {
                  font-size: 1.1em;
                  margin-bottom: 5px;
                }

                input[type="file"] {
                  padding: 5px;
                }

                input[type="range"] {
                  margin-top: 10px;
                }

                div {
                  margin-top: 10px;
                }

                h2 {
                  font-size: 1.5em;
                }

                .soil-report-button {
                  margin-top: 20px;
                }

                .moisture-slider-soil {
                  width: 100%;
                  height: 10px;
                  border-radius: 5px;
                  appearance: none;
                  outline: none;
                }

                .moisture-slider-soil::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #555;
                  cursor: pointer;
                  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                }

                .moisture-slider-soil::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #555;
                  cursor: pointer;
                  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                }

                .toast-message-soil-report {
                  font-size: 1rem;
                  text-align: center;
                  white-space: nowrap;
                }

                .toastify-container {
                  width: auto;
                  max-width: 300px;
                }

                .hazardous-materials {
                  display: flex;
                  flex-direction: row;
                  gap: 10px;
                  margin-top: 10px;
                }

                .card-containerR {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: 20px;
                }

                .cardR {
                  background: #fff;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  padding: 15px;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }

                .report-info {
                  margin-top: 10px;
                }

                .report-info p {
                  margin: 8px 0;
                  font-size: 14px;
                }

                .buttonr-container {
                  display: flex;
                  justify-content: space-between;
                  gap: 5px;
                }

                button {
                  padding: 8px 12px;
                  border: none;
                  background-color: #007bff;
                  color: white;
                  cursor: pointer;
                  border-radius: 4px;
                  transition: background-color 0.3s ease;
                }

                button:hover {
                  background-color: #0056b3;
                }

                button:active {
                  background-color: #004494;
                }

                .summary-title {
                  position: relative;
                  display: inline-block;
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

                .show-3dview-btn {
                  background-color: #075e86;
                  color: #fff;
                  margin-top: 10px;
                  padding: 10px 20px;
                  text-align: center;
                  width: 100%;
                }

                .terrain-view-container {
                  margin-top: 15px;
                }
            `}</style>
        </div>
    );
};

export default SurveyorReportForm;
