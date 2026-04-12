import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer bg-slate-950 text-white pt-16 pb-10 border-t border-slate-900 relative">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                {/* Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-12">
                    <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-orange-500 transition-colors">Home</Link>
                    <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-orange-500 transition-colors">About</Link>
                    <Link to="/browse" className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-orange-500 transition-colors">Browse</Link>
                    <Link to="/emi-calculator" className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-orange-500 transition-colors">EMI</Link>
                    <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-orange-500 transition-colors">Contact</Link>
                </nav>

                {/* Divider */}
                <div className="w-full h-px bg-white/5 mb-10 max-w-lg mx-auto"></div>

                {/* Copyright Text */}
                <div className="text-center">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] mb-2">
                        &copy; {new Date().getFullYear()} <span className="text-white">RIDEHUB</span> | All Rights Reserved
                    </p>
                    <p className="text-slate-600 text-[9px] font-medium tracking-widest uppercase">
                        Precision Engineering • Trusted Marketplace • Seamless Experience
                    </p>
                </div>
            </div>
            
            {/* Subtle Gradient Accent */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-600/50 to-transparent"></div>
        </footer>
    );
};

export default Footer;

