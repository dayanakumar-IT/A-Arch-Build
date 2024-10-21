import React, { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import VendorForm from './VendorForm';
import { Modal, Pagination } from 'react-bootstrap';
import Tooltip from '@mui/material/Tooltip';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TextField, Select, MenuItem, Button, Grid, InputLabel, FormControl, InputAdornment } from '@mui/material';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import { styled } from '@mui/system';

// Custom styled button with gradient background and hover effect
const AddButton = styled(Button)({
    background: 'linear-gradient(360deg, rgba(33,28,106,1) 5%, rgba(89,180,195,1) 100%)',
    color: '#fff',
    '&:hover': {
        background: 'linear-gradient(360deg, rgba(116,226,145,1) 5%, rgba(239,243,150,1) 100%)',
    },
});

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(-1);
    const apiUrl = "http://localhost:8000/vd";

    const [initialData, setInitialData] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");

    useEffect(() => {
        getItems(currentPage, searchQuery, filterType);
    }, [currentPage, searchQuery, filterType]);

    const getItems = (pageNumber, searchQuery = "", filterType = "") => {
        const query = new URLSearchParams({ page: pageNumber, name: searchQuery, type: filterType });

        fetch(`${apiUrl}/add?${query.toString()}`)
            .then((res) => res.json())
            .then((res) => {
                console.log("API response:", res); 
                if (res.data && Array.isArray(res.data)) {
                    let filteredVendors = res.data;

                    if (searchQuery) {
                        filteredVendors = filteredVendors.filter((vendor) =>
                            vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                    }

                    if (filterType) {
                        filteredVendors = filteredVendors.filter((vendor) =>
                            vendor.vendorType.toLowerCase() === filterType.toLowerCase()
                        );
                    }

                    setVendors(filteredVendors);
                    setTotalPages(res.totalPages || 1);
                    setCurrentPage(res.currentPage || 1);
                } else {
                    setError("Unexpected API response format.");
                }
            })
            .catch((err) => {
                console.error("Error fetching vendors:", err);
                setError("Failed to fetch vendors.");
            });
    };

    const handleAddNew = () => {
        setInitialData(null);
        setEditId(-1);
        setShowForm(true);
    };

    const handleEdit = (vendor) => {
        setInitialData(vendor);
        setEditId(vendor._id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete?")) {
            fetch(`${apiUrl}/add/${id}`, {
                method: "DELETE",
            }).then(() => {
                getItems(currentPage, searchQuery, filterType);
            })
                .catch((err) => {
                    console.error("Error deleting vendor:", err);
                    setError("Failed to delete vendor.");
                });
        }
    };

    const handleFormSubmit = (data, isEdit) => {
        setError("");

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key !== '_id') {
                formData.append(key, data[key]);
            }
        });

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? `${apiUrl}/add/${data._id}` : `${apiUrl}/add`;

        fetch(url, {
            method: method,
            body: formData
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return res.text().then((text) => { throw new Error(text); });
                }
            })
            .then(() => {
                toast.success(isEdit ? "Vendor updated successfully" : "Vendor added successfully", {
                    autoClose: 3000,
                });
                setShowForm(false);
                getItems(currentPage, searchQuery, filterType);
            })
            .catch((err) => {
                console.error("Error:", err);
                setError(err.message);
                toast.error(`Error: ${err.message}`, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            });
    };

    const handleFormCancel = () => {
        setShowForm(false);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
    };

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <style>{`
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .form-group input, .form-group textarea, .form-group select {
                    width: 100%;
                    align-items: center;
                }
                .form-group textarea {
                    resize: vertical;
                }
                .icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 5px;
                }
                button {
                    margin-top: 10px;
                }
                .btn-primary {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                }
                .btn-secondary {
                    background: linear-gradient(360deg, rgba(33, 28, 106, 1) 5%, rgba(89, 180, 195, 1) 100%);
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                }
                .btn-primary:hover, .btn-secondary:hover {
                    opacity: 0.9;
                }
                .form-group img {
                    width: 100%;
                    max-width: 150px;
                    height: auto;
                }
                .logo-preview {
                    max-width: 100px;
                    max-height: 100px;
                    display: block;
                    margin-top: 10px;
                }
                .vendors-grid img {
                    width: 50px;
                    height: 50px;
                }
                .card {
                    background-color: rgb(165, 208, 246);
                    box-shadow: 0 4px 8px rgb(0, 131, 246);
                    transition: 0.3s;
                    height: 90%;
                    display: grid;
                    place-items: center;
                    margin-inline: 1.5rem;
                    padding-block: 5rem;
                    position: relative; /* Make sure the card is positioned relative so the absolute hover content works properly */
                     z-index: 1;
                }
                .card:hover {
                    box-shadow: 0 8px 16px rgb(2, 48, 89);
                }
                .card-person {
                    align-items: right;
                }
                .card .row {
                    display: grid;
                    row-gap: 3.5rem;
                }
                .artical {
                    position: relative;
                    overflow: visible;
                }
                .card_data {
                    width: 280px;
                    background-color: #007bff;
                    color: aliceblue;
                    padding: 1.5rem 1.5rem;
                    box-shadow: 0 8px 24px hsla(0, 0%, 0%, .15);
                    border-radius: 1rem;
                    position: absolute;
                    bottom: -6rem;
                    left: 0;
                    right: 0;
                    margin-inline: auto;
                    opacity: 0;
                    z-index: 10; /* Ensures the hover content is on top */
                    transition: opacity 1s 1s;
                    
                }
                .artical:hover .card_data {
                    animation: show-data 1s forwards;
                    opacity: 1;
                    transition: opacity .3s;
                    z-index: 20; /* Ensure it remains on top when hovered */
                }
                .artical:hover {
                    animation: remove-overflow 2s forwards;
                }
                .card_phone, .card_email, .card_add {
                    display: block;
                    margin-bottom: .25rem;
                }
                @keyframes show-data {
                    50% {
                        transform: translateY(-10rem);
                    }
                    100% {
                        transform: translateY(-7rem);
                    }
                }
                @keyframes remove-overflow {
                    to {
                        overflow: initial;
                    }
                }
                @keyframes remove-data {
                    0% {
                        transform: translateY(-7rem);
                    }
                    50% {
                        transform: translateY(-10rem);
                    }
                    100% {
                        transform: translateY(.5rem);
                    }
                }
                @keyframes show-overflow {
                    0% {
                        overflow: initial;
                        pointer-events: none;
                    }
                    50% {
                        overflow: hidden;
                    }
                }
            `}</style>
           <div className="container"><Grid container spacing={2} alignItems="center" justifyContent="space-between" style={{ marginTop: 0, marginBottom: 16 }}>
            {/* Search Field */}
            <Grid item xs={12} sm={4} md={6}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by Company Name"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch />
                            </InputAdornment>
                        ),
                        sx: { height: '40px' }, 
                    }}
                />
            </Grid>

            {/* Filter Dropdown */}
            <Grid item xs={12} sm={4} md={4}>
                <FormControl fullWidth variant="outlined" sx={{ height: '40px' }}>
                    <InputLabel id="filter-label">Filter by Vendor Type</InputLabel>
                    <Select
                        labelId="filter-label"
                        value={filterType}
                        onChange={handleFilterChange}
                        label="Filter by Vendor Type"
                        startAdornment={
                            <InputAdornment position="start">
                                <FaFilter />
                            </InputAdornment>
                        }
                        sx={{ height: '40px' }} 
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="electrical">Electrical</MenuItem>
                        <MenuItem value="plumbing">Plumbing</MenuItem>
                        <MenuItem value="carpentry">Carpentry</MenuItem>
                        <MenuItem value="Painting">Painting</MenuItem>
                        <MenuItem value="Landscaping">Landscaping</MenuItem>
                        <MenuItem value="general">General Contractor</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Add Button */}
            <Grid item xs={12} sm={4} md={2} textAlign="right">
                <AddButton
                    variant="contained"
                    startIcon={<FaPlus />}
                    onClick={handleAddNew}
                    sx={{ height: '40px', padding: '0 16px' }} 
                >
                    Add
                </AddButton>
            </Grid>
        </Grid>

        <Modal
    show={showForm}
    onHide={handleFormCancel}
    centered
    style={{
        maxWidth: '600px',  // Maximum width of the modal
        width: '50%',       // Adjustable width, set to 50% of the screen width
        maxHeight: '80vh',  // Set maximum height to 80% of the viewport height to allow scrolling
        overflowY: 'auto',  // Enable vertical scrolling when content exceeds maxHeight
        borderRadius: '12px',  // Rounded corners for a modern look
        backgroundColor: '#f5f5f5',  // Light background color
        padding: '20px',    // Padding inside the modal
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',  // Shadow for depth
        marginLeft: '500px',  // Adjust as needed
        marginTop: '90px',  // Adjust as needed
    }}
>
    {/* Modal Header */}
    <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title
            style={{
                background: 'linear-gradient(360deg, rgba(33,28,106,1) 5%, rgba(89,180,195,1) 100%)',
                padding: '8px 16px',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '1.5rem',  // Larger font for the title
                color: '#fff',
                width: '100%',
            }}
        >
            {editId !== -1 ? "Edit Vendor" : "Add New Vendor"}
        </Modal.Title>
    </Modal.Header>

    {/* Modal Body */}
    <Modal.Body style={{ padding: '20px', overflowY: 'auto' }}>
        <VendorForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={initialData}
            isEdit={editId !== -1}
        />
    </Modal.Body>

   
</Modal>




            <div className="vendors-grid" style={{ marginBottom: '100px' }}>
                <div className="row" style={{ marginBottom: '100px' }}>
                    {vendors.map((item) => (
                        <div className="artical col-md-4 mb-8" style={{ marginBottom: '100px' }}key={item._id}>
                            <div className="card p-5 border rounded">
                                <div className="d-flex flex-row align-items-center">
                                    {item.logo && (
                                        <Tooltip title="Company Logo" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                            <img
                                                src={`${apiUrl}/uploads/${item.logo}`}
                                                alt="Vendor Logo"
                                                className="card-img-left"
                                                style={{ width: '100px', height: '100px', borderRadius: '20%' }}
                                            />
                                        </Tooltip>
                                    )}
                                    <div className="ms-3 flex-grow-1">
                                        <Tooltip title="Company Name" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                            <h5 className="card-title">{item.name}</h5>
                                        </Tooltip>
                                        <div className="d-flex justify-content-center">
                                            <Tooltip title="Owner" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                                <span className="" style={{ borderRadius: '20px', padding: '5px 10px' }}>
                                                    {item.contactPerson}
                                                </span>
                                            </Tooltip>
                                        </div>
                                        <div className="card-text mt-2">
                                            <Tooltip title="Company Type" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                                <span
                                                    className="badge bg-primary"
                                                    style={{
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: '25px',
                                                        padding: '5px 10px',
                                                        color: '#333',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {item.vendorType}
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                <div className="card_data">

                                    <div className="card_phone d-flex align-items-center mb-2">
                                        <Tooltip title="Phone" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                            <i className="bi bi-telephone me-2"></i>{item.phone}
                                        </Tooltip>
                                    </div>
                                    <div className="card_email d-flex align-items-center mb-2">
                                        <Tooltip title="Email" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                            <i className="bi bi-envelope me-2"></i>{item.email}
                                        </Tooltip>
                                    </div>
                                    <div className="card_add d-flex align-items-center mb-2">
                                        <Tooltip title="Address" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                            <i className="bi bi-geo-alt me-2"> {item.address}</i>

                                        </Tooltip>

                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                <Tooltip
                                    placement="left"
                                    TransitionProps={{ timeout: 600 }}
                                    title="Edit"
                                    arrow
                                >

                                    <Button variant="warning" onClick={() => handleEdit(item)}
                                        style={{ backgroundColor: '#4CAF50', color: '#fff' }}>
                                        <AiOutlineEdit className="icon" />
                                    </Button>
                                </Tooltip>
                                <Tooltip
                                    placement="right"
                                    TransitionProps={{ timeout: 600 }}
                                    title="Delete"
                                    arrow
                                >
                                    <Button variant="danger" onClick={() => handleDelete(item._id)}
                                        style={{ backgroundColor: '#FF5722', color: '#fff' }}>
                                        <AiOutlineDelete className="icon" />
                                    </Button>
                                </Tooltip>
                            </div>
                                </div>

                                <div className="d-flex align-items-center mt-3" style={{ backgroundColor: '#e9ecef', borderRadius: '10px', padding: '5px 10px' }}>
                                    <Tooltip title="Website URL" placement="right" TransitionProps={{ timeout: 600 }} arrow>
                                        <i className="bi bi-link-45deg me-2"></i>{item.website}
                                    </Tooltip>
                                </div>



                            </div>
                            {/* <div className="d-flex justify-content-end gap-2 mt-3">
                                <Tooltip
                                    placement="left"
                                    TransitionProps={{ timeout: 600 }}
                                    title="Edit"
                                    arrow
                                >
                                    <Button variant="warning" onClick={() => handleEdit(item)}>
                                        <AiOutlineEdit className="icon" />
                                    </Button>
                                </Tooltip>
                                <Tooltip
                                    placement="right"
                                    TransitionProps={{ timeout: 600 }}
                                    title="Delete"
                                    arrow
                                >
                                    <Button variant="danger" onClick={() => handleDelete(item._id)}>
                                        <AiOutlineDelete className="icon" />
                                    </Button>
                                </Tooltip>
                            </div> */}
                        </div>
                    ))}
                </div>
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </Pagination.Prev>

                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index}
                            active={index + 1 === currentPage}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <FaChevronRight />
                    </Pagination.Next>
                </Pagination>
            </div>


            {error && <p className="text-danger mt-3">{error}</p>}

            <ToastContainer />
        </div>
        </div>
    );
};

export default VendorList;
