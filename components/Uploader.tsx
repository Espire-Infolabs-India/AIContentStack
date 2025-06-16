'use client';
import React, { useRef, useState } from 'react';

interface Props {
  onGenerate: (file: File, template: string) => void;
  loading: boolean;
  setSelectedFile: (file: File | null) => void;
}

export default function Uploader({ onGenerate, loading, setSelectedFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('1');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded && uploaded.type === 'application/pdf') {
      setSelectedFile(uploaded);
    } else {
      alert('Please upload a valid PDF file.');
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setSelectedFile(dropped);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleGenerateClick = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert('Upload a PDF first');
    onGenerate(file, selectedTemplate);
  };

  return (
    <div className="border rounded p-4 mb-4 bg-light">
      <div
        className="drop-zone text-center p-4 border rounded bg-white mb-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <i className="fas fa-cloud-upload-alt fa-2x mb-2 d-block text-primary"></i>
        <p>Drag & Drop your PDF here</p>
        <p>or</p>
        <button
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="d-none"
          onChange={handleFileChange}
        />
      </div>

      <div className="mb-3">
        <h5>Select Template</h5>
        <div className="form-check">
          <input
            type="radio"
            id="template1"
            name="template"
            value="1"
            className="form-check-input"
            checked={selectedTemplate === '1'}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          />
          <label className="form-check-label" htmlFor="template1">
            BLOG – Generate comprehensive blog content
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            id="template2"
            name="template"
            value="2"
            className="form-check-input"
            checked={selectedTemplate === '2'}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          />
          <label className="form-check-label" htmlFor="template2">
            SUMMARY – Create DXP content with branding
          </label>
        </div>
      </div>

      <button
        className="btn btn-success"
        onClick={handleGenerateClick}
        disabled={loading}
      >
        {loading ? 'Generating...' : (
          <>
            <i className="fas fa-magic me-2"></i> Generate Content
          </>
        )}
      </button>
    </div>
  );
}
