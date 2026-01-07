
import React, { useState, useCallback, useRef } from 'react';
import { extractTextFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { UploadIcon, ExclamationIcon } from './components/Icons';
import { Spinner } from './components/Spinner';
import { StructuredResultDisplay } from './components/StructuredResultDisplay';

type AppStatus = 'idle' | 'loading' | 'success' | 'error';

// Main application component
export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setExtractedData(null);
      setError(null);
      setStatus('idle');
    }
  };

  const handleExtractText = useCallback(async () => {
    if (!imageFile) return;

    setStatus('loading');
    setError(null);
    setExtractedData(null);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const data = await extractTextFromImage(base64, mimeType);
      setExtractedData(data);
      setStatus('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('Extraction failed:', errorMessage);
      setError(`Failed to extract text. Please try again. Details: ${errorMessage}`);
      setStatus('error');
    }
  }, [imageFile]);
  
  // No longer needed if using label for file input
  // const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-7xl flex flex-col items-center">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Image Text Extractor
          </h1>
          <p className="mt-2 text-lg text-gray-400">Upload an image and let Gemini extract the text for you.</p>
        </header>

        {!extractedData && (
          <div className="w-full max-w-2xl bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-8 text-center transition-all duration-300">
            <input
              type="file"
              id="file-upload-input" // Added ID for label
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            {!imageUrl ? (
              <label htmlFor="file-upload-input" className="flex flex-col items-center cursor-pointer">
                <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400">
                  <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP</p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <img src={imageUrl} alt="Uploaded preview" className="max-h-64 rounded-lg shadow-lg mb-6" />
                <div className="flex space-x-4">
                  <button
                      onClick={() => fileInputRef.current?.click()} // Trigger click explicitly for change image
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
                  >
                      Change Image
                  </button>
                  <button
                      onClick={handleExtractText}
                      disabled={status === 'loading'}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                  >
                      {status === 'loading' ? (
                          <>
                              <Spinner />
                              Extracting...
                          </>
                      ) : (
                          'Extract Text'
                      )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
            <div className="mt-6 w-full max-w-2xl bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center animate-fade-in" role="alert">
                <ExclamationIcon className="w-5 h-5 mr-3" />
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        {extractedData && status === 'success' && (
          <div className="w-full">
            <StructuredResultDisplay data={extractedData} imageUrl={imageUrl!} />
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setExtractedData(null);
                  setImageFile(null);
                  setImageUrl(null);
                  setStatus('idle');
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
              >
                Process Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}