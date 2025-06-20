"use client";
import { useEffect, useRef, useState } from "react";
import Settings from "./Settings";

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>(""); // no default selected
  const [url, setURL] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [contentTypeResult, setContentTypeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAIModel] = useState<string>("geminine-2.0-pro");

  const getAIModel = (e: React.SyntheticEvent) => {
    setAIModel((e.target as HTMLInputElement).value);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${window?.location?.origin}/api/get-content-types`
        );
        if (!res.ok) throw new Error("Failed to generate content");
        const data = await res.json();
        setContentTypeResult(data);
      } catch (err) {
        console.log("_____________err", err);
      }
    };
    fetchData();
  }, []);

  const handleFileSelect = (file: File) => {
    if (url.trim()) {
      alert("You can't upload a file when a URL is provided.");
      return;
    }
    if (file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const generateContent = async (e: React.SyntheticEvent) => {
    if (!template) return alert("Please select a content type.");
    if ((!selectedFile && !url.trim()) || (selectedFile && url.trim())) {
      return alert("Please provide either a PDF file or a URL, but not both.");
    }
    setLoading(true);
  console.log("AI Model Selected ::::", aiModel);

    const formData = new FormData();
    formData.append("template", template);
    formData.append("model", aiModel);
    if (selectedFile) {
      formData.append("pdf", selectedFile);
    } else if (url.trim()) {
      formData.append("url", url.trim());
    }
    try {
      const res = await fetch(
        `${window?.location?.origin}/api/generate-summary`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed to generate content");
      const data = await res.json();
      setResult(data.summary);
    } catch (err) {
      console.error(err);
      alert("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const makeEditable = (e: React.MouseEvent<HTMLButtonElement>) => {
    const div = e.currentTarget.parentElement as HTMLDivElement;
    const field = div.dataset.field || "";
    const currentValue = div.textContent?.replace("edit", "").trim() || "";
    const textarea = document.createElement("textarea");
    textarea.value = currentValue;
    textarea.dataset.field = field;
    div.innerHTML = "";
    div.appendChild(textarea);
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-sm btn-success ms-2";
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.onclick = () => saveEdit(saveBtn);
    div.appendChild(saveBtn);
    textarea.focus();
  };

  const saveEdit = (btn: HTMLButtonElement) => {
    const div = btn.parentElement as HTMLDivElement;
    const textarea = div.querySelector("textarea") as HTMLTextAreaElement;
    const newValue = textarea.value;
    const field = div.dataset.field || "";
    div.innerHTML = `${newValue}`;
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary ms-2";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => makeEditable({ currentTarget: editBtn } as any);
    div.appendChild(editBtn);
  };

  const saveAsJSON = () => {
    const resultContent = document.querySelector(".result-content");
    if (!resultContent) return;

    const data: Record<string, any> = {};
    resultContent.querySelectorAll(".json-value").forEach((field) => {
      let key = field?.getAttribute("data-actualkey");
      let value = field?.innerHTML?.replace("edit", "").trim() || "";
      if (key) {
        data[key] = value;
      }
    });

    if (url.trim()) {
      data["shared_url"] = url.trim();
    }

    const myHeaders = new Headers();
    myHeaders.append("authorization", "cs80aedb88ce3edf9f37ea28a7");
    myHeaders.append("api_key", "bltea636b428ce7c0cc");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ entry: data });

    fetch(`https://api.contentstack.io/v3/content_types/${template}/entries/`, {
      method: "POST",
      headers: myHeaders,
      body: raw,
    })
      .then((response) => response.json())
      .then((result) => {
        setSuccessMsg(true);
        console.log("final response", result);
      })
      .catch((error) => console.error("Fetch error:", error));
  };

  const renderResult = () => {
    if (!result) return null;
    let json: any = result;
    if (typeof result === "string") {
      try {
        json = JSON.parse(result);
      } catch (e) {
        return <div className="alert alert-warning">Invalid result format</div>;
      }
    }

    return (
      <div className="mt-4">
        <h3>
          <i className="fas fa-file-alt me-2"></i>Generated Content
        </h3>
        <div className="result-content">
          <div className="mb-3 border p-3">
            {json?.map((item: any, index: number) => (
              <div key={index} className="mb-4">
                <span className="fw-bold json-key text-capitalize">
                  {item?.key}
                </span>
                :&nbsp;
                <div className="mb-2 json-field">
                  <span
                    className="json-value d-inline ms-2 editable"
                    data-field={item?.key}
                    data-actualkey={item?.actual_key}
                  >
                    {item?.value}
                  </span>
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
        </div>
        <button className="btn btn-success mt-3" onClick={saveAsJSON}>
          <i className="fas fa-save me-2"></i>Publish the Content on CMS
        </button>
        {successMsg && "Successfully Created Entry."}
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
