'use client';
import React, { useRef } from 'react';

const ResultViewer = ({ content }) => {
  const contentRef = useRef(null);

  const makeEditable = () => {
    if (contentRef.current) {
      const editableElements = contentRef.current.querySelectorAll('p, h1, h2, h3, li');
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.classList.add('editable-border');
      });
    }
  };

  const saveAsJSON = () => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll('[contenteditable="true"]');
    const json = [];

    elements.forEach((el, i) => {
      json.push({
        tag: el.tagName.toLowerCase(),
        content: el.innerText,
      });
    });

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-content.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-primary" onClick={makeEditable}>
          <i className="fas fa-edit me-1"></i> Make Editable
        </button>
        <button className="btn btn-outline-success" onClick={saveAsJSON}>
          <i className="fas fa-download me-1"></i> Save as JSON
        </button>
      </div>

      <div
        ref={contentRef}
        className="border p-4 rounded bg-white"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default ResultViewer;