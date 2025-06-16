import React from 'react';
import Uploader from './Uploader';

interface ContentGeneratorProps {
  loading: boolean;
  selectedFile: File | null;
  selectedTemplate: string;
  result: any;
  setSelectedFile: (file: File | null) => void;
  setSelectedTemplate: (template: string) => void;
  handleGenerate: () => void;
}

export default function ContentGenerator({
  loading,
  selectedFile,
  selectedTemplate,
  result,
  setSelectedFile,
  setSelectedTemplate,
  handleGenerate
}: ContentGeneratorProps) {

  const formatValue = (value: any, field: string) => {
    if (value === null || value === undefined) return <em>Not specified</em>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (field === 'KeyContentTakeaways' && Array.isArray(value)) {
      return <ul className="list-group">{value.map((pt, i) => <li key={i} className="list-group-item">{pt}</li>)}</ul>;
    }
    if (Array.isArray(value)) return value.join(', ') || <em>No items</em>;
    if (typeof value === 'string' && value.trim() === '') return <em>Empty</em>;
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')))
      return <a href={value} target="_blank" rel="noreferrer">{value}</a>;
    return value.toString();
  };

  const getSectionIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Basic Information': '📝',
      'Media Assets': '🖼️',
      'Navigation & Links': '🔗',
      'SEO & Metadata': '🏷️',
      'Content Details': '📄',
      'Settings & Dates': '⚙️',
    };
    return icons[name] || '📁';
  };

  const sections: Record<string, string[]> = {
    'Basic Information': ['Title', 'ShortTitle', 'Summary', 'Introduction', 'Description', 'KeyContentTakeaways'],
    'Media Assets': ['BannerImage', 'Image', 'SliderImage', 'ServiceImages', 'HelpBrandImage', 'HelpBrandIcon'],
    'Navigation & Links': ['BaseLink', 'AuthorLink', 'RelatedDocument', 'NavigationTitle', 'LinkCaptionInNavigation'],
    'SEO & Metadata': ['BrowserTitle', 'MetaKeywords', 'MetaDescription', 'Category', 'CategoryType'],
    'Content Details': ['BannerLabel', 'ButtonText', 'Topic', 'PostedBy', 'Posts', 'PostDescription', 'BlogMinutesReading'],
    'Settings & Dates': ['FormHide', 'IncludeInSearchResults', 'PressReleaseDate', 'DateBlog']
  };

  return (
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <a className="navbar-brand" href="/">Espire Infolabs</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/context">Company Context</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="text-center mb-5">
        <h1>Content Generator using Document AI</h1>
        <p className="lead">
          Transform your PDFs into well-structured, customized content<br />
          with our intelligent template-based generator
        </p>
      </div>

      <Uploader
        loading={loading}
        setSelectedFile={setSelectedFile}
        onGenerate={(file, template) => {
          setSelectedFile(file);
          setSelectedTemplate(template);
          handleGenerate();
        }}
      />

      {result && (
        <div className="p-4 border bg-white rounded">
          <h3 className="mb-4"><i className="fas fa-file-alt"></i> Generated Content</h3>
          {Object.entries(sections).map(([sectionName, fields]) => {
            const sectionFields = fields.filter(field => field in result);
            if (!sectionFields.length) return null;
            return (
              <div key={sectionName} className="mb-4">
                <div className="h5 mb-3">{getSectionIcon(sectionName)} {sectionName}</div>
                <div className="row g-3">
                  {sectionFields.map(field => (
                    <div key={field} className="col-12 col-md-6">
                      <div className="border p-3 rounded bg-light">
                        <strong>{field}</strong>
                        <div>{formatValue(result[field], field)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
