// src/components/SoilReportRead.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Button, Typography, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

ChartJS.register(ArcElement, Tooltip, Legend);

const ReadPage = ({onEditReport, backtoForm}) => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8000/report/api/soil-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching soil reports:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/soil-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                });
                fetchReports();
                
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    className: 'toast-message',
                    
                });
            }
        } catch (error) {
            toast.error('Error deleting report.', {
                position: 'top-right',
                className: 'toast-message',
            });
            console.error('Error deleting report:', error);
        }
    };

    const handleEdit = (report) => {
        onEditReport(report); // Passing the entire report object
    };
    

    const generateOverallViewData = (report) => {
        const { moistureContent, phLevel, compactionLevel } = report;

        return {
            labels: ['Moisture Content', 'pH Level', 'Compaction'],
            datasets: [
                {
                    label: 'Soil Report Overview',
                    data: [moistureContent, phLevel, compactionLevel],
                    backgroundColor: ['#ff9999', '#99ff99', '#99ccff'],
                    hoverOffset: 4,
                },
            ],
        };
    };

    // Filter reports based on search term
    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            report.soilType.toLowerCase().includes(searchValue) ||
            report.moistureContent.toString().includes(searchValue) ||
            report.phLevel.toString().includes(searchValue) ||
            report.compactionLevel.toString().includes(searchValue)
        );
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <ToastContainer /> {/* Include ToastContainer for toast messages */}
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Soil Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <TextField
                    variant="outlined"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by soil type, moisture, pH, or compaction"
                    style={{ width: '100%', maxWidth: '400px' }}
                />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {filteredReports.map((report) => (
                    <div key={report._id} style={{ width: '400px', margin: '10px' }}>
                        <img
                            src={`http://localhost:8000/report/${report.document}`}
                            alt="Soil Report"
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        <div style={{ padding: '10px' }}>
                            <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                Soil Type: {report.soilType}
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>Moisture Content:</strong> {report.moistureContent}%
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>pH Level:</strong> {report.phLevel}
                            </Typography>
                            <Typography style={{ fontSize: '1.5rem', margin: '5px 0' }}>
                                <strong>Compaction (psi):</strong> {report.compactionLevel}
                            </Typography>
                            <div style={{ margin: '20px 0' }}>
                                <h3>Overall Point of View</h3>
                                <Pie data={generateOverallViewData(report)} options={{ responsive: true }} height={150} width={150} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#075e86', color: '#fff' }}
                                    onClick={() => handleEdit(report)}
                                >
                                    Update
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error" // MUI default red for the delete button
                                    onClick={() => handleDelete(report._id)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#ffb600', color: '#fff' }} // Yellow for the "Other Forms" button
                                    onClick={() => backtoForm()}
                                >
                                    Other Forms
                                </Button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

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

export default ReadPage;
