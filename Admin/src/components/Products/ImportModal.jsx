import React, { useState, useRef } from "react";
import { FileUp, X, Check, Loader, AlertTriangle } from "lucide-react";

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    e.stopPropagation();

    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setImportError(null); 
      setImportStats(null);
      setShowErrorDetails(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setImportError(null);
        setImportStats(null);
        setShowErrorDetails(false);
      } else {
        setImportError("Please upload a CSV file");
      }
    }
  };

  const handleContainerClick = (e) => {
    if (!csvFile) {
      fileInputRef.current.click();
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportError("Please select a CSV file to import");
      return;
    }

    try {
      setImporting(true);
      setImportError(null);
      setImportProgress({ processed: 0, total: 0, percentage: 0 });
      setShowErrorDetails(false);
      
      const handleProgress = (progress) => {
        setImportProgress(progress);
      };
      
      const stats = await onImport(csvFile, handleProgress);
      setImportStats(stats);
      
      if (stats.errors === 0) {
        setCsvFile(null);
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      setImportError(error.message || "Failed to import CSV file");
    } finally {
      setImporting(false);
    }
  };

  const toggleErrorDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  const closeModal = () => {
    setCsvFile(null);
    setImportError(null);
    setImportStats(null);
    setImportProgress(null);
    setShowErrorDetails(false);
    onClose();
  };

  // Format numbers with commas for thousands
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-y-scroll h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Import Products from CSV</h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-500 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a CSV file with the following columns: upc, description, price, case_pack, image_url, category, status
          </p>
          
          {importStats && !importing && (
            <div className={`mb-4 p-3 rounded-md ${
              importStats.errors > 0 ? 'bg-yellow-50 border border-yellow-300' : 'bg-green-50 border border-green-300'
            }`}>
              <h4 className="font-medium mb-1">Import Results</h4>
              <ul className="text-sm">
                <li>Total records: {formatNumber(importStats.total)}</li>
                <li>Products added: {formatNumber(importStats.added)}</li>
                <li>Products updated: {formatNumber(importStats.updated)}</li>
                <li>Errors: {formatNumber(importStats.errors)}</li>
              </ul>
              
              {importStats.errors > 0 && (
                <div className="mt-2">
                  <button 
                    onClick={toggleErrorDetails}
                    className="flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {showErrorDetails ? "Hide error details" : "Show error details"}
                  </button>
                  
                  {showErrorDetails && importStats.errorRecords && importStats.errorRecords.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-amber-200 rounded p-2 bg-amber-50">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-amber-200">
                            <th className="text-left py-1 px-2">Row</th>
                            <th className="text-left py-1 px-2">UPC</th>
                            <th className="text-left py-1 px-2">Description</th>
                            <th className="text-left py-1 px-2">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importStats.errorRecords.map((error, index) => (
                            <tr key={index} className="border-b border-amber-100">
                              <td className="py-1 px-2">{error.rowIndex > 0 ? error.rowIndex : 'N/A'}</td>
                              <td className="py-1 px-2">{error.row?.upc || 'Missing'}</td>
                              <td className="py-1 px-2 truncate max-w-[150px]">
                                {error.row?.description || 'Missing'}
                              </td>
                              <td className="py-1 px-2">{error.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {importing && importProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Importing products...</span>
                <span>
                  {formatNumber(importProgress.processed)}/{formatNumber(importProgress.total)} ({importProgress.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${importProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {!importing && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV File
              </label>
              <div 
                className={`flex justify-center px-6 pt-5 pb-6 border-2 cursor-pointer ${dragActive ? 'border-blue-300 bg-blue-50' : csvFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'} border-dashed rounded-md cursor-pointer hover:bg-gray-50`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleContainerClick}
              >
                <div className="space-y-1 text-center">
                  {csvFile ? (
                    <Check className="mx-auto h-12 w-12 text-green-500" />
                  ) : (
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <span>{csvFile ? "Change file" : "Upload a file"}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only cursor-pointer"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </label>
                    {!csvFile && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
              {csvFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected file: {csvFile.name}
                </p>
              )}
            </>
          )}
          
          {importError && (
            <p className="mt-2 text-sm text-red-600">
              {importError}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            disabled={importing}
          >
            {importing ? "Close when done" : "Cancel"}
          </button>
          {!importing && (
            <button
              onClick={handleImport}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center cursor-pointer ${
                csvFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
              }`}
              disabled={!csvFile}
            >
              <Check className="mr-2 h-4 w-4" />
              Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;