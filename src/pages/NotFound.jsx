import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              to="/"
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              <svg
                className="-ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Return to home
            </Link>
          </div>
          
          {window.history.length > 1 && (
            <div className="ml-3 inline-flex">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition duration-150 ease-in-out"
              >
                Go back
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-12">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link to="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
      
      {/* Optional: Add your pharmaceutical logo */}
      <div className="mt-16">
        <Link to="/" className="flex items-center justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.png" // Replace with your logo path
            alt="FelanoCare Logo"
          />
          <span className="ml-2 text-xl font-bold text-gray-900">FelanoCare</span>
        </Link>
      </div>
    </div>
  );
}