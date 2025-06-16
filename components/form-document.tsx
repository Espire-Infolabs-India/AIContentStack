'use client';
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from 'react';
export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>('author');
  
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const [result, setResult] = useState<any>(null);
  const [contentTypeResult, setContentTypeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`${window?.location?.origin}/api/get-content-types`);
      if (!res.ok) throw new Error('Failed to generate content');
      const data = await res.json();
      setContentTypeResult(data);
    } catch (err) {
       console.log('_____________err', err);
    }
  };

  fetchData();
  }, []);

  const handleFileSelect = (file: File) => {
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

  const generateContent = async () => {
    if (!selectedFile) return alert('Please select a PDF file');
    console.log('_________________________________template',template);
    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('template', template);

    try {
      const res = await fetch(`${window?.location?.origin}/api/generate-summary`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to generate content');
      const data = await res.json();
      setResult(data.summary);
    } catch (err) {
      console.error(err);
      alert('Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const makeEditable = (e: React.MouseEvent<HTMLButtonElement>) => {
    const div = e.currentTarget.parentElement as HTMLDivElement;
    const field = div.dataset.field || '';
    const currentValue = div.textContent?.replace('edit', '').trim() || '';
    const textarea = document.createElement('textarea');
    textarea.value = currentValue;
    textarea.dataset.field = field;
    div.innerHTML = '';
    div.appendChild(textarea);
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-sm btn-success ms-2';
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.onclick = () => saveEdit(saveBtn);
    div.appendChild(saveBtn);
    textarea.focus();
  };

  const saveEdit = (btn: HTMLButtonElement) => {
    const div = btn.parentElement as HTMLDivElement;
    const textarea = div.querySelector('textarea') as HTMLTextAreaElement;
    const newValue = textarea.value;
    const field = div.dataset.field || '';
    div.innerHTML = `${newValue}`;
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-primary ms-2';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => makeEditable({ currentTarget: editBtn } as any);
    div.appendChild(editBtn);
  };

  const saveAsJSON = () => {
    const resultContent = document.querySelector('.result-content');
    if (!resultContent) return;

    const data: Record<string, any> = {};
    resultContent.querySelectorAll('.json-field').forEach(field => {
      const key = field.querySelector('.json-key')?.textContent || '';
      const valueDiv = field.querySelector('.json-value') as HTMLDivElement;
      const value = valueDiv.textContent?.replace('edit', '').trim() || '';
      data[key] = value;
    });

    console.log('__________________data:',template, data);
    const myHeaders = new Headers();
    myHeaders.append("authorization", "cs80aedb88ce3edf9f37ea28a7");
    myHeaders.append("api_key", "bltea636b428ce7c0cc");
    myHeaders.append("Content-Type", "application/json");

    // Assuming `data` is a valid object and `template` is a string
    const raw = JSON.stringify({
      entry: {
        ...data,
      },
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch(`https://api.contentstack.io/v3/content_types/${template}/entries/`, requestOptions)
      .then((response) => response.json()) // or .text() if response is plain text
      .then((result) => {
        setSuccessMsg(true);
        console.log('final response', result)
      })
      .catch((error) => console.error('Fetch error:', error));

    // const blob = new Blob([JSON.stringify(data, null, 2)], {
    //   type: 'application/json'
    // });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'generated-content.json';
    // document.body.appendChild(a);
    // a.click();
    // URL.revokeObjectURL(url);
    // document.body.removeChild(a);
  };

  const renderResult = () => {
    if (!result) return null;
    let json: any = result;
    if (typeof result === 'string') {
      try {
        json = JSON.parse(result);
      } catch (e) {
        return <div className="alert alert-warning">Invalid result format</div>;
      }
    }

    const sections: Record<string, string[]> = {
      'Basic Information': ['Title', 'ShortTitle', 'Summary', 'Introduction', 'Description', 'KeyContentTakeaways'],
      'Media Assets': ['BannerImage', 'Image', 'SliderImage', 'ServiceImages', 'HelpBrandImage', 'HelpBrandIcon'],
      'Navigation & Links': ['BaseLink', 'AuthorLink', 'RelatedDocument', 'NavigationTitle', 'LinkCaptionInNavigation'],
      'SEO & Metadata': ['BrowserTitle', 'MetaKeywords', 'MetaDescription', 'Category', 'CategoryType'],
      'Content Details': ['BannerLabel', 'ButtonText', 'Topic', 'PostedBy', 'Posts', 'PostDescription', 'BlogMinutesReading'],
      'Settings & Dates': ['FormHide', 'IncludeInSearchResults', 'PressReleaseDate', 'DateBlog']
    };

    return (
      <div className="mt-4">
        <h3><i className="fas fa-file-alt me-2"></i>Generated Content</h3>
        <div className="result-content">
          {Object.entries(sections).map(([section, keys]) => {
            const fields = keys.filter(k => k in json);
            if (!fields.length) return null;
            return (
              <div className="mb-3 border p-3" key={section}>
                <h5 className="text-primary"><i className="fas fa-folder me-2"></i>{section}</h5>
                {fields.map(field => (
                  <div className="mb-2 json-field" key={field}>
                    <span className="fw-bold json-key">{field}</span>: 
                    <div className="json-value d-inline ms-2 editable" data-field={field}>
                      {Array.isArray(json[field]) ? json[field].join(', ') : json[field]}
                      <button
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={makeEditable}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <button className="btn btn-success mt-3" onClick={saveAsJSON}>
          <i className="fas fa-save me-2"></i>Save as JSON
        </button>
        {successMsg && (
          'SuccessFully Created Entry.'
        )}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <header className="mb-4">
        <h1 className="display-5">Content Generator using Document AI</h1>
        <p className="lead">Transform your PDFs into structured, customized content with our intelligent template-based generator</p>
      </header>

     
        
          <div className="border p-4 text-center mb-4" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
            <i className="fas fa-cloud-upload-alt fa-2x"></i>
            <p>Drag & Drop your PDF here</p>
            <p>or</p>
            <button style={{background: 'black', color: '#fff'}} className="btn btn-outline-secondary" onClick={() => fileInputRef.current?.click()}>Choose File</button>
            <input type="file" accept="application/pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            {selectedFile && <p className="mt-2 text-muted">Selected file: {selectedFile.name}</p>}
          </div>

          <div className="mb-4">
            <h4>Select Content Types</h4>
            {contentTypeResult?.content_types?.map((field: { title: string, uid: string }) => (
              <div className="form-check" key={field.uid}>
                <label className="form-check-label"><input
                  type="radio"
                  className="form-check-input"
                  name="template"
                  value={field.uid}
                  checked={template === field.uid}
                  onChange={() => setTemplate(field.uid)}
                />{field.title}</label>
              </div>
            ))}

            {/* 
            <div className="form-check">
              <input type="radio" className="form-check-input" name="template" value="2" checked={template === '2'} onChange={() => setTemplate('2')} />
              <label className="form-check-label">SUMMARY - Generate content for Digital Experience Platform with branding</label>
            </div>
            */}
          </div>
          <button className="btn btn-primary" disabled={!selectedFile || loading} onClick={generateContent}>
            {loading ? 'Generating...' : (<><i className="fas fa-magic me-2"></i>Generate Content</>)}
          </button>
        

      {renderResult()}
    </div>
  );
}