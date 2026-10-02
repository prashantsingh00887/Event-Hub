import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
        The page you are looking for doesn't exist or might have been relocated.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
