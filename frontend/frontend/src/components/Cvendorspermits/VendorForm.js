import React, { useState } from "react";
import { Button } from 'react-bootstrap';
import { FaUser, FaFileImage, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaIndustry } from 'react-icons/fa';

const VendorForm = ({ onSubmit, onCancel, initialData, isEdit }) => {
    const [vendorName, setVendorName] = useState(initialData?.name || "");
    const [logo, setLogo] = useState(null);
    const [address, setAddress] = useState(initialData?.address || "");
    const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || "");
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phone || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [website, setWebsite] = useState(initialData?.website || "");
    const [vendorType, setVendorType] = useState(initialData?.vendorType || "");

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Vendor name must start with a letter
        if (!/^[A-Za-z]/.test(vendorName)) {
            newErrors.vendorName = "Vendor name must start with a letter.";
        }

        // Contact person must start with a letter
        if (!/^[A-Za-z]/.test(contactPerson)) {
            newErrors.contactPerson = "Contact person name must start with a letter.";
        }

        // Phone number must be exactly 10 digits and contain only numbers
        if (!/^\d{10}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
        }

        setErrors(newErrors);

        // If there are no errors, the form is valid
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit({
                _id: initialData?._id,
                name: vendorName,
                logo: logo,
                address: address,
                contactPerson: contactPerson,
                phone: phoneNumber,
                email: email,
                website: website,
                vendorType: vendorType
            }, isEdit);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                height: 'calc(100vh - 70px)', // Adjust this value based on the height of your navbar
                width: '80%', // You can adjust this percentage to control the width of the form
                margin: '0 auto', // Centers the form horizontally
                overflowY: 'auto', // If the form is taller than the screen, make it scrollable
                padding: '20px',
                backgroundColor: '#f9f9f9', // Light background for the form
                borderRadius: '8px', // Rounded corners for a modern look
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' // Subtle shadow for depth
            }}
        >
            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="vendorName" className="form-label">Vendor Name</label>
                <FaUser style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="text"
                    className="form-control"
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
                {errors.vendorName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.vendorName}</span>}
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="logo" className="form-label">Logo</label>
                <FaFileImage style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="file"
                    className="form-control"
                    id="logo"
                    onChange={(e) => setLogo(e.target.files[0])}
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="address" className="form-label">Address</label>
                <FaMapMarkerAlt style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="text"
                    className="form-control"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                <FaUser style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="text"
                    className="form-control"
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
                {errors.contactPerson && <span style={{ color: 'red', fontSize: '12px' }}>{errors.contactPerson}</span>}
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <FaPhone style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="text"
                    className="form-control"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
                {errors.phoneNumber && <span style={{ color: 'red', fontSize: '12px' }}>{errors.phoneNumber}</span>}
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="email" className="form-label">Email</label>
                <FaEnvelope style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="website" className="form-label">Website</label>
                <FaGlobe style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <input
                    type="text"
                    className="form-control"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                />
            </div>

            <div className="mb-3" style={{ position: 'relative' }}>
                <label htmlFor="vendorType" className="form-label">Vendor Type</label>
                <FaIndustry style={{ position: 'absolute', top: '40px', left: '10px', color: '#007bff' }} />
                <select
                    className="form-control"
                    id="vendorType"
                    value={vendorType}
                    onChange={(e) => setVendorType(e.target.value)}
                    required
                    style={{
                        paddingLeft: '40px', // Space for the icon
                        backgroundColor: '#e8f0fe', // Light blue background
                        borderColor: '#007bff'
                    }}
                >
                    <option value="">Select Vendor Type</option>
                    <option value="gen">General Contractor</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Landscaping">Landscaping</option>
                </select>
            </div>

            <Button variant="primary" type="submit">
                {isEdit ? "Update Vendor" : "Add Vendor"}
            </Button>
            <Button variant="secondary" onClick={onCancel} className="ms-2">
                Cancel
            </Button>
        </form>
    );
};

export default VendorForm;
