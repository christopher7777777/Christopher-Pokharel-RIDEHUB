import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-gray-500 text-sm italic">
                        &copy; {new Date().getFullYear()} RIDEHUB. All rights reserved.
                    </p>
                </div>
            
        </footer>
    );
};

export default Footer;
