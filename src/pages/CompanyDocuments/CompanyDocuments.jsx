import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiUpload, FiDownload, FiEye, FiCheck, FiX, FiFile } from 'react-icons/fi';

const CompanyDocuments = () => {
  const { documents, updateDocument } = useAppContext();
  const [uploading, setUploading] = useState(null);

  const handleFileUpload = (docName) => {
    const fileInput = document.getElementById(`file-${docName}`);
    const file = fileInput.files[0];
    if (file) {
      // Simulate file upload
      setUploading(docName);
      setTimeout(() => {
        updateDocument(docName, {
          url: file.name,
          uploaded: true
        });
        setUploading(null);
        alert(`${docName} uploaded successfully!`);
      }, 1000);
    }
  };

  const getFileIcon = (name) => {
    if (name.includes('SEBI') || name.includes('Registration') || name.includes('License')) {
      return '📜';
    }
    return '📄';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Company Documents</h1>
        <p className="text-gray-500">Manage company legal and registration documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.name} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getFileIcon(doc.name)}</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                  <p className="text-xs text-gray-500">
                    {doc.uploaded ? 'Uploaded' : 'Not uploaded'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                doc.uploaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {doc.uploaded ? <FiCheck className="inline w-3 h-3" /> : <FiX className="inline w-3 h-3" />}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id={`file-${doc.name}`}
                  type="file"
                  className="hidden"
                  onChange={() => handleFileUpload(doc.name)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor={`file-${doc.name}`}
                  className="flex-1 btn-secondary text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  {doc.uploaded ? 'Replace' : 'Upload'}
                </label>
                {doc.uploaded && (
                  <>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {uploading === doc.name && (
                <div className="text-center text-sm text-blue-600">
                  Uploading... Please wait
                </div>
              )}
              {doc.uploaded && (
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <FiFile className="w-3 h-3" />
                  {doc.url}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyDocuments;