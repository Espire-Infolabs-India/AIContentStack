'use client';

import {
  useEffect,
  useRef,
  useState,
  FormEvent,
} from 'react';
import axios from 'axios';
import Settings from "./Settings";

interface FormField {
  name: string;
  value: string;
}

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>('author');
  const [url, setURL] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [referenceFields, setReferenceFields] = useState<any>(null);
  const [fileFieldList, setFileFieldList] = useState<any>(null);
  const [contentTypeResult, setContentTypeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAIModel] = useState<string>('gemini-2.0-flash');

  const getAIModel = (e: React.SyntheticEvent) => {
    setAIModel((e.target as HTMLInputElement).value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${window?.location?.origin}/api/get-content-types`);
        if (!res.ok) throw new Error('Failed to fetch content types');
        const data = await res.json();
        setContentTypeResult(data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, []);

  const handleFileSelect = (file: File) => {
    if (url.trim()) {
      alert("You can't upload a file when a URL is provided.");
      return;
    }
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const generateContent = async (e: React.SyntheticEvent) => {
    if (!template) return alert('Please select a content type.');
    if ((!selectedFile && !url.trim()) || (selectedFile && url.trim())) {
      return alert('Please provide either a PDF file or a URL, but not both.');
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('template', template);
    formData.append('model', aiModel);
    if (selectedFile) {
      formData.append('pdf', selectedFile);
    } else if (url.trim()) {
      formData.append('url', url.trim());
    }

    try {
      const res = await fetch(`${window?.location?.origin}/api/generate-summary`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to generate content');
      const data = await res.json();
      setResult(data?.summary);
      setReferenceFields(data?.referenceFields);
      setFileFieldList(data?.fileFieldList);
    } catch (err) {
      console.error(err);
      alert('Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const input = e.target as HTMLInputElement;
    const inputId = input.id;
    const file = e.target.files?.[0];

    if (file) {
      handleFileUpload(file, inputId);
    }
  };

  const handleFileUpload = async (file: File, inputId: string) => {
    const formData = new FormData();
    formData.append('asset[upload]', file);
    formData.append('asset[title]', file.name);

    try {
      const response = await axios.post('https://api.contentstack.io/v3/assets', formData, {
        headers: {
          api_key: process.env.API_KEY as string,
          authorization: process.env.AUTHORIZATION as string,
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploaded = response.data.asset;
      const inputEl = document.getElementById(`${inputId}_file`);

      if (inputEl && 'value' in inputEl) {
        (inputEl as HTMLInputElement).value = uploaded.uid;
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data: Record<string, any> = {};

      const textareas = document.querySelectorAll<HTMLTextAreaElement>('.form-textarea');
      textareas.forEach((textarea) => {
        if (textarea.name && textarea.value) {
          Object.assign(data, { [textarea.name]: textarea.value });
        }
      });

      const formDropdown = document.querySelectorAll<HTMLTextAreaElement>('.form-dropdown');
      formDropdown?.forEach((dropdown) => {
        if (dropdown?.name && dropdown?.value) {
          Object.assign(data, { [dropdown?.name]: [{"uid": dropdown?.value, "_content_type_uid": dropdown?.id}] });
        }
      });

      const myHeaders = new Headers();
      myHeaders.append('authorization', process.env.AUTHORIZATION as string);
      myHeaders.append('api_key', process.env.API_KEY as string);
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({ entry: { ...data } });

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        `https://api.contentstack.io/v3/content_types/${template}/entries/`,
        requestOptions
      );

      const result = await response.json();
      setSuccessMsg(true);
      setLoading(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert('One or more uploads failed.');
      setLoading(false);
      setSuccessMsg(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    let json: any = result;
    if (typeof result === 'string') {
      try {
        json = JSON.parse(result);
      } catch {
        return <div className="alert alert-warning">Invalid result format</div>;
      }
    }

    return (
      <div className="mt-4">
        <form encType="multipart/form-data" method="post" >
          <h3>
            <i className="fas fa-file-alt me-2"></i>Generated Content
          </h3>
          <div className="mb-3 border p-3">
            {json?.map((item: any, index: number) => (
              <div key={item?.actual_key || index} className="mb-4">
                <label htmlFor={item?.actual_key}>
                  <strong>{item?.key}</strong>
                </label>
                <textarea
                  className="form-control form-textarea"
                  id={item?.actual_key}
                  name={item?.actual_key}
                  defaultValue={item?.value || ''}
                />
              </div>
            ))}
          </div>

          <div>
            {fileFieldList?.map((item: any, index: number) => (
              <div key={index} className="mb-4">
                <label>
                  <strong>{item?.displayName}</strong>
                </label>
                <input
                  type="file"
                  className="form-control form-file-input"
                  id={`${item?.actual_key}_input`}
                  name={item?.actual_key}
                  onChange={handleFileChange}
                />
                <input
                  type="hidden"
                  className="input_file_field form-textarea"
                  name={item?.actual_key}
                  id={`${item?.actual_key}_input_file`}
                />
              </div>
            ))}
          </div>

          <div>
            {referenceFields?.map((item: any, index: number) => (
              <div key={index} className="mb-4">
                <label>
                  <strong>{item?.displayName}</strong>
                </label>
                <select name={item?.actual_uid} id={item?.key} className="form-select form-dropdown form-textarea1">
                  <option value="">Choose...</option>
                  {item?.values?.map((ele: any, ind: number) =>
                    ele?.title ? (
                      <option key={ind} value={ele?.uid}>
                        {ele?.title}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            ))}
          </div>

          <button className="btn btn-success mt-3" onClick={handleSubmit} disabled={loading}>
            <i className="fas fa-magic me-2"></i>Publish to CMS
          </button>
        </form>
        {successMsg && (
          <div className="alert alert-success mt-3">Successfully Created Entry.</div>
        )}
      </div>
    );
  };

   return (
    <div className="container py-5">
      <header className="mb-4">
        <h1 className="display-5">Content Generator using Document AI</h1>
        <p className="lead">
          Transform your PDFs into structured, customized content with our
          intelligent template-based generator
        </p>
      </header>

      <Settings model={aiModel} setAIModel={getAIModel} />

      <div
        className="border p-4 text-center mb-4"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <i className="fas fa-cloud-upload-alt fa-2x"></i>
        <p>Drag & Drop your PDF here</p>
        <p>or</p>
        <button
          className="btn btn-outline-secondary"
          style={{ background: "black", color: "#fff" }}
          onClick={() => fileInputRef.current?.click()}
          disabled={!!url.trim()}
        >
          Choose File
        </button>
        <input
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelect(e.target.files[0])
          }
        />
        {selectedFile && (
          <p className="mt-2 text-muted">Selected file: {selectedFile.name}</p>
        )}
      </div>

      <div className="mb-4">
        <h4>Select Content Types</h4>
        {contentTypeResult?.content_types?.map(
          (field: { options: any; title: string; uid: string }) =>
            field.options.is_page && (
              <div className="form-check" key={field.uid}>
                <label className="form-check-label">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="template"
                    value={field.uid}
                    checked={template === field.uid}
                    onChange={() => setTemplate(field.uid)}
                  />
                  {field.title}
                </label>
              </div>
            )
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="url" className="form-label">
          Or share a related URL
        </label>
        <input
          type="url"
          id="url"
          className="form-control"
          placeholder="https://example.com"
          value={url}
          disabled={!!selectedFile}
          onChange={(e) => setURL(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        disabled={!template || (!selectedFile && !url.trim()) || loading}
        onClick={generateContent}
      >
        {loading ? (
          "Generating..."
        ) : (
          <>
            <i className="fas fa-magic me-2"></i>Generate Content
          </>
        )}
      </button>

      {renderResult()}
    </div>
  );
}
