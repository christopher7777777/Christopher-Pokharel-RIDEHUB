const Footer = () => {
    return (
        <footer className="bg-slate-950 text-white py-8 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                        &copy; {new Date().getFullYear()} RIDEHUB. All rights reserved. Precision Engineered.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
