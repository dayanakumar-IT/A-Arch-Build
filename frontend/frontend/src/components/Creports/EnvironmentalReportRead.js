// src/components/EnvironmentalReportRead.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnvironmentalReportRead = ({onEditEReport, backtoForm}) => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleSummaries, setVisibleSummaries] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8000/report/api/environmental-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching environmental reports:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/environmental-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                fetchReports();
                
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('An error occurred while deleting the report.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleEdit = (report) => {
        onEditEReport(report);
    };

    const toggleSummaryVisibility = (id) => {
        setVisibleSummaries((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const generateSummaryAndSuggestions = (report) => {
        const summary = [];
        const suggestions = [];

        if (report.temperature > 35) {
            summary.push('High temperature detected.');
            suggestions.push('Ensure proper ventilation and cooling systems.');
        } else if (report.temperature < 10) {
            summary.push('Low temperature detected.');
            suggestions.push('Consider insulation to maintain warmth.');
        } else {
            summary.push('Temperature is within a comfortable range.');
        }

        if (report.airQualityIndex > 100) {
            summary.push('Air quality is poor.');
            suggestions.push('Use air purifiers and wear masks.');
        } else {
            summary.push('Air quality is acceptable.');
        }

        if (report.waterQuality === 'Contaminated') {
            summary.push('Water is contaminated.');
            suggestions.push('Use filtration or alternative sources for water.');
        } else if (report.waterQuality === 'Polluted') {
            summary.push('Water quality is below ideal.');
            suggestions.push('Consider basic filtration methods.');
        } else {
            summary.push('Water quality is clean.');
        }

        if (report.hazardousMaterials.chemicals) {
            summary.push('Presence of chemical hazards.');
            suggestions.push('Use appropriate protective gear.');
        }

        if (report.hazardousMaterials.asbestos) {
            summary.push('Asbestos detected.');
            suggestions.push('Handle with extreme caution and use specialized removal services.');
        }

        if (report.hazardousMaterials.lead) {
            summary.push('Lead detected.');
            suggestions.push('Avoid direct contact and seek remediation services.');
        }

        return { summary, suggestions };
    };

    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            report.location.toLowerCase().includes(searchValue) ||
            report.temperature.toString().includes(searchValue) ||
            report.airQualityIndex.toString().includes(searchValue) ||
            report.waterQuality.toLowerCase().includes(searchValue)
        );
    });

    return (
        <div className="overview-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <style>
                {`
                    .report-page {
                        display: flex;
                        justify-content: space-around;
                        align-items: flex-start;
                        padding: 20px;
                        height: 100vh;
                    }

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

                    .soil-report-input, .soil-report-select, .soil-report-button {
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

                    .moisture-slider-soil::-webkit-slider-thumb, .moisture-slider-soil::-moz-range-thumb {
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
                `}
            </style>
            <ToastContainer />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Environmental Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <TextField
                    variant="outlined"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by location, temperature, AQI, or water quality"
                    style={{ width: '100%', maxWidth: '400px' }}
                />
            </div>
            <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {filteredReports.map((report) => {
                    const { summary, suggestions } = generateSummaryAndSuggestions(report);
                    return (
                        <div className="card" key={report._id} style={{ width: '400px', margin: '10px' }}>
                            <img
                                src={`http://localhost:8000/report/${report.document}`}
                                alt="Environmental Report"
                                className="report-image"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                            <div className="report-info" style={{ padding: '10px' }}>
                                <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                    Location: {report.location}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Temperature:</strong> {report.temperature}°C
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>AQI:</strong> {report.airQualityIndex}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Water Quality:</strong> {report.waterQuality}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Hazardous Materials:</strong>
                                </Typography>
                                <ul>
                                    {report.hazardousMaterials && (
                                        <>
                                            <li>Chemicals: {report.hazardousMaterials.chemicals ? 'Yes' : 'No'}</li>
                                            <li>Asbestos: {report.hazardousMaterials.asbestos ? 'Yes' : 'No'}</li>
                                            <li>Lead: {report.hazardousMaterials.lead ? 'Yes' : 'No'}</li>
                                        </>
                                    )}
                                </ul>
                                <Typography
                                    variant="h6"
                                    style={{ margin: '15px 0 10px', cursor: 'pointer', textDecoration: 'underline' }}
                                    onDoubleClick={() => toggleSummaryVisibility(report._id)}
                                >
                                    Overall Point of View
                                </Typography>
                                {visibleSummaries[report._id] && (
                                    <div className="summary-section" style={{ transition: 'all 0.3s ease-in-out' }}>
                                        <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                            Summary:
                                        </Typography>
                                        <ul>
                                            {summary.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                        <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                            Suggestions:
                                        </Typography>
                                        <ul>
                                            {suggestions.map((suggestion, index) => (
                                                <li key={index}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="buttons-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#075e86', color: '#fff' }}
                                        onClick={() => handleEdit(report)}
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(report._id)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#ffb600', color: '#fff' }}
                                        onClick={() => backtoForm()}
                                    >
                                        Other Forms
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EnvironmentalReportRead;
