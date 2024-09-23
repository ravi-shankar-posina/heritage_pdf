import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, Archive } from 'lucide-react';

const App = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/split-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        setError('An error occurred while processing the PDF.');
      }
    } catch (error) {
      setError('An error occurred while connecting to the server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PDF Processor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Upload a PDF to start
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center">
            <div className="flex-grow relative">
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex">
                <input
                  type="text"
                  value={file ? file.name : 'Choose PDF File'}
                  disabled
                  className="flex-grow py-2 px-4 border border-gray-300 rounded-l-md text-gray-600 bg-white cursor-not-allowed"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload').click()}
                  className="py-2 px-4 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="ml-4">
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  !file || isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isUploading ? 'Processing...' : 'Start'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-4">
            <a
              href={downloadUrl}
              download="files.zip"
              className="w-[150px] h-[150px] flex flex-col items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Archive className="h-10 w-10 mr-2" />
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;