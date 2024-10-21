// src/components/EnvironmentalReportForm.js
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnvironmentalReportForm = ({report,onSucessEnv}) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingTemperature, setLoadingTemperature] = useState(false);

    const [formData, setFormData] = useState({
        location: '',
        document: null,
        temperature: '',
        airQualityIndex: '',
        waterQuality: '',
        hazardousMaterials: {
            chemicals: false,
            asbestos: false,
            lead: false,
        },
    });

    const [existingDocument, setExistingDocument] = useState('');

  

    useEffect(() => {
        if (report) {
            // Use the passed report prop to prefill the form
            setFormData({
                location: report.location || '',
                temperature: report.temperature || '',
                airQualityIndex: report.airQualityIndex || '',
                waterQuality: report.waterQuality || '',
                hazardousMaterials: report.hazardousMaterials || {
                    chemicals: false,
                    asbestos: false,
                    lead: false,
                },
            });
            setExistingDocument(report.document || '');
            setIsUpdate(true);
            setLoading(false);
        } else if (id) {
            // Fetch report details if the report is not passed but we have an ID
            fetchReportDetails(id);
            setIsUpdate(true);
        } else {
            // Fetch temperature only if creating a new report
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(fetchTemperature, handleGeolocationError);
            } else {
                toast.error('Geolocation is not supported by this browser.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
            setLoading(false);
        }
    }, [report, id]);

    const fetchReportDetails = async (reportId) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/environmental-report/${reportId}`);
            const data = await response.json();
            setFormData({
                location: data.location,
                temperature: data.temperature,
                airQualityIndex: data.airQualityIndex,
                waterQuality: data.waterQuality,
                hazardousMaterials: data.hazardousMaterials,
            });
            setExistingDocument(data.document);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setLoading(false);
        }
    };

    const fetchTemperature = async (position) => {
        const { latitude, longitude } = position.coords;
        setLoadingTemperature(true);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const temperature = data.main.temp;

            setFormData((prevState) => ({
                ...prevState,
                temperature: temperature.toFixed(1),
            }));
        } catch (error) {
            console.error('Error fetching temperature:', error);
        } finally {
            setLoadingTemperature(false);
        }
    };

    const handleGeolocationError = (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get your location. Please allow location access.', {
            position: 'top-right',
            autoClose: 3000,
        });
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
            hazardousMaterials: {
                ...prevState.hazardousMaterials,
                [name]: checked,
            },
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            document: e.target.files[0],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formDataObj = new FormData();
        formDataObj.append('location', formData.location);
        formDataObj.append('document', formData.document);
        formDataObj.append('temperature', formData.temperature);
        formDataObj.append('airQualityIndex', formData.airQualityIndex);
        formDataObj.append('waterQuality', formData.waterQuality);
        formDataObj.append('hazardousMaterials', JSON.stringify(formData.hazardousMaterials));

        try {
            const url = `http://localhost:8000/report/api/environmental-report${isUpdate ? `/${report._id}` : ''}`;
            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataObj,
            });

            if (response.ok) {
                toast.success(isUpdate ? 'Environment Report Updated' : 'Environmental Report Submitted', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                // Add a delay before calling onSuccessSoil
                setTimeout(() => {
                    onSucessEnv(); // Call the success callback to switch to ReadPage after the delay
                }, 2000); // Delay for 2 seconds (2000 milliseconds)

            } else {
                toast.error('Failed to submit Environmental Report', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error submitting Environmental Report:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            <ToastContainer />
            <h2>{isUpdate ? 'Update Environmental Report' : 'Environmental Report'}</h2>
            <form onSubmit={handleSubmit} >
                <div>
                    <label htmlFor="location">Location:</label>
                    <input
                        type="text"
                        style={{ marginBottom:'10px' }}
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="upload">Upload Document/Image:</label>
                    <input
                        type="file"
                        id="upload"
                        style={{ marginBottom:'10px' }}
                        name="document"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required={!isUpdate}
                    />
                    {isUpdate && existingDocument && !formData.document && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <p>Existing Document:</p>
                            <img
                                src={`http://localhost:8000/report/${existingDocument}`}
                                alt="Environmental Report"
                                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginBottom:'10px', marginTop:'10px' }}>
                    <label>Hazardous Materials:</label>
                    <FormGroup row>
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.chemicals} onChange={handleCheckboxChange} name="chemicals" />}
                            label="Chemicals"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.asbestos} onChange={handleCheckboxChange} name="asbestos" />}
                            label="Asbestos"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={formData.hazardousMaterials.lead} onChange={handleCheckboxChange} name="lead" />}
                            label="Lead"
                        />
                    </FormGroup>
                </div>

                <div style={{ marginBottom:'10px' }}>
                    <label htmlFor="temperature">Temperature (°C):</label>
                    <input
                        type="number"
                        id="temperature"
                        name="temperature"
                        value={formData.temperature}
                        readOnly={loadingTemperature}
                        disabled={loadingTemperature}
                        required
                    />
                    {loadingTemperature && <p>Loading temperature...</p>}
                </div>

                <div style={{ marginBottom:'10px' }}>
                    <label htmlFor="airQualityIndex">Air Quality Index (AQI):</label>
                    <input
                        type="number"
                        id="airQualityIndex"
                        name="airQualityIndex"
                        value={formData.airQualityIndex}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom:'10px', marginTop:'20px' }}>
                    <label htmlFor="waterQuality">Water Quality:</label>
                    <select id="waterQuality" name="waterQuality" value={formData.waterQuality} onChange={handleChange} required>
                        <option value="">Select Water Quality</option>
                        <option value="Clean">Clean</option>
                        <option value="Polluted">Polluted</option>
                        <option value="Contaminated">Contaminated</option>
                    </select>
                </div>

                <Button variant="contained" color="primary" type="submit" style={{ marginTop: '15px', width: '100%' }}>
                    {isUpdate ? 'Update Environmental Report' : 'Submit Environmental Report'}
                </Button>
            </form>

            <style jsx>{`
                .report-page {
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-start;
                    padding: 20px;
                    height: 100vh;
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

                .soil-report-button {
                    margin-top: 20px;
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

                .summary-content {
                    animation: slide-in 0.5s ease-in-out forwards;
                }

                .toast-message {
                    font-size: 1rem;
                    text-align: center;
                    white-space: nowrap;
                }

                .terrain-view-container {
                    margin-top: 15px;
                }

                .show-3dview-btn {
                    background-color: #075e86;
                    color: #fff;
                    margin-top: 10px;
                    padding: 10px 20px;
                    text-align: center;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default EnvironmentalReportForm;
