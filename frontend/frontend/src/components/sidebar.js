import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import adminPic from './assets/adminpic.png';
import projectManagerPic from './assets/adminpic.png';
import financialManagerPic from './assets/financialManager.png';
import architectPic from './assets/architect.png';
import crmPic from './assets/crm.png';
import qaPic from './assets/qa.png';
import siteManagerPic from './assets/siteManager.png';

import projectManagerMenu from './menus/projectManagerMenu';
import financialManagerMenu from './menus/financialManagerMenu';
import architectMenu from './menus/architectMenu';
import crmMenu from './menus/crmMenu';
import qualityAssuranceMenu from './menus/qualityAssuranceMenu';
import siteManagerMenu from './menus/siteManagerMenu';

const menuItems = {
    "Project Manager": projectManagerMenu,
    "Financial Manager": financialManagerMenu,
    "Architect": architectMenu,
    "CRM": crmMenu,
    "QA Inspector": qualityAssuranceMenu,
    "Site Manager": siteManagerMenu,
};

const roleImages = {
    "Project Manager": projectManagerPic,
    "Financial Manager": financialManagerPic,
    "Architect": architectPic,
    "CRM": crmPic,
    "QA Inspector": qaPic,
    "Site Manager": siteManagerPic,
};

function Sidebar({ role, userName, onSectionChange }) {
    const [activeMenu, setActiveMenu] = useState(null);

    const handleMenuClick = (index, sectionName) => {
        setActiveMenu(prevIndex => (prevIndex === index ? null : index));
        onSectionChange(sectionName); // Notify the parent component of the section change
    };

    const sidebarStyle = {
        background: 'linear-gradient(250deg, #211C6A, #4137D0)',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        marginTop: -5,
        width: '220px',
    };

    const activeItemStyle = {
        background: 'linear-gradient(250deg, #38ef7d, #11998e)', // Greenish gradient for active items
        color: '#fff',
        borderRadius: '5px',
    };

    const items = menuItems[role] || [];

    return (
        <div className='d-flex flex-column justify-content-between min-vh-100' style={sidebarStyle}>
            <div className='d-flex flex-column align-items-center pt-4'>
                {/* Role Name */}
                <span className='fs-5 text-white mb-2'>{role}</span>

                {/* Admin Image */}
                <img
                    src={roleImages[role] || adminPic}
                    alt="Role Icon"
                    style={{
                        width: '120px',
                        borderRadius: '50%',
                        marginBottom: '10px',
                    }}
                />

                {/* Description */}
                <p className='text-white text-center mb-3'>
                    Welcome back! 
                </p>

                {/* Horizontal Line */}
                <hr className='w-75' style={{ borderColor: 'white' }} />

                {/* Menu Sections */}
                <ul className="nav nav-pills flex-column mt-2 w-100" id='parentM'>
                    {items.map((item, index) => (
                        <li key={index} className="nav-item mb-4">
                            {item.subMenu ? (
                                <div className='submenu-margin'>
                                    <a 
                                        className={`nav-link text-white text-center text-sm-start ${activeMenu === index ? 'active' : ''}`}
                                        href={`#submenu-${index}`}
                                        onClick={() => handleMenuClick(index, item.name)}
                                        style={activeMenu === index ? activeItemStyle : {}}
                                        aria-expanded={activeMenu === index ? "true" : "false"}
                                    >
                                        <i className={`bi ${item.icon}`}></i>
                                        <span className='ms-2 d-none d-sm-inline'>{item.name}</span>
                                        <i className="bi bi-caret-down dropdown-icon"></i>
                                    </a>
                                    <ul 
                                        id={`submenu-${index}`} 
                                        className={`nav flex-column ms-3 collapse ${activeMenu === index ? 'show' : ''}`}
                                    >
                                        {item.subMenu.map((subItem, subIndex) => (
                                            <li key={subIndex} className="nav-item mb-2">
                                                <a href={subItem.link} className="nav-link text-white">
                                                    {subItem.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <a 
                                    href={item.link}
                                    className={`nav-link text-white text-center text-sm-start ${activeMenu === index ? 'active' : ''}`}
                                    style={activeMenu === index ? activeItemStyle : {}}
                                    onClick={() => handleMenuClick(index, item.name)}
                                >
                                    <i className={`bi ${item.icon}`}></i>
                                    <span className='ms-2 d-none d-sm-inline'>{item.name}</span>
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
