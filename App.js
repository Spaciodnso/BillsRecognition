
import React, { useState, useCallback, useRef } from 'react';
import { extractTextFromImage } from './services/geminiService.js';
import { fileToBase64 } from './utils/fileUtils.js';
import { UploadIcon, ExclamationIcon } from './components/Icons.js';
import { Spinner } from './components/Spinner.js';
import { StructuredResultDisplay } from './components/StructuredResultDisplay.js';

// Main application component
export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('Extraction failed:', errorMessage);
      setError(`Failed to extract text. Please try again. Details: ${errorMessage}`);
      setStatus('error');
    }
  }, [imageFile]);

  return React.createElement("div", {
    className: "min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans"
  },
    React.createElement("div", { className: "w-full max-w-7xl flex flex-col items-center" },
      React.createElement("header", { className: "text-center mb-8" },
        React.createElement("h1", { className: "text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500" },
          "Image Text Extractor"
        ),
        React.createElement("p", { className: "mt-2 text-lg text-gray-400" }, "Upload an image and let Gemini extract the text for you.")
      ),

      !extractedData && React.createElement("div", { className: "w-full max-w-2xl bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-8 text-center transition-all duration-300" },
        React.createElement("input", {
          type: "file",
          id: "file-upload-input",
          ref: fileInputRef,
          onChange: handleImageChange,
          accept: "image/png, image/jpeg, image/webp",
          className: "hidden"
        }),
        !imageUrl ? (
          React.createElement("label", { htmlFor: "file-upload-input", className: "flex flex-col items-center cursor-pointer" },
            React.createElement(UploadIcon, { className: "w-12 h-12 text-gray-500 mb-4" }),
            React.createElement("p", { className: "text-gray-400" },
              React.createElement("span", { className: "font-semibold text-indigo-400" }, "Click to upload"), " or drag and drop"
            ),
            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "PNG, JPG, or WEBP")
          )
        ) : (
          React.createElement("div", { className: "flex flex-col items-center" },
            React.createElement("img", { src: imageUrl, alt: "Uploaded preview", className: "max-h-64 rounded-lg shadow-lg mb-6" }),
            React.createElement("div", { className: "flex space-x-4" },
              React.createElement("button", {
                onClick: () => fileInputRef.current?.click(),
                className: "px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
              }, "Change Image"),
              React.createElement("button", {
                onClick: handleExtractText,
                disabled: status === 'loading',
                className: "px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
              },
                status === 'loading' ? (
                  React.createElement(React.Fragment, null,
                    React.createElement(Spinner, null),
                    "Extracting..."
                  )
                ) : (
                  "Extract Text"
                )
              )
            )
          )
        )
      ),

      error && React.createElement("div", { className: "mt-6 w-full max-w-2xl bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center animate-fade-in", role: "alert" },
        React.createElement(ExclamationIcon, { className: "w-5 h-5 mr-3" }),
        React.createElement("span", { className: "block sm:inline" }, error)
      ),

      extractedData && status === 'success' && React.createElement("div", { className: "w-full" },
        React.createElement(StructuredResultDisplay, { data: extractedData, imageUrl: imageUrl }),
        React.createElement("div", { className: "text-center mt-8" },
          React.createElement("button", {
            onClick: () => {
              setExtractedData(null);
              setImageFile(null);
              setImageUrl(null);
              setStatus('idle');
              if (fileInputRef.current) fileInputRef.current.value = "";
            },
            className: "px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
          }, "Process Another Image")
        )
      )
    )
  );
}
