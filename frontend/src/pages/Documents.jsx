import { useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';

const REQUIRED_DOCUMENTS = [
  {
    name: 'Government Photo ID',
    type: 'Identity Proof',
    description: 'Aadhaar card, voter ID, passport, or driving licence.',
  },
  {
    name: 'Address Proof',
    type: 'Address Proof',
    description: 'Utility bill, bank statement, rental agreement, or government address letter.',
  },
  {
    name: 'Passport Size Photo',
    type: 'Photograph',
    description: 'A recent passport-size photograph for verification records.',
  },
];

const ACCEPTED_FORMATS = '.pdf,.png,.jpg,.jpeg,.webp';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return 'Not available';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const { documents, loading, profile, uploadDocument } = useUser();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadState, setUploadState] = useState({
    documentName: '',
    documentType: '',
    file: null,
    submitting: false,
    error: '',
  });

  const uploadedByType = useMemo(() => {
    const map = new Map();
    documents.forEach((doc) => {
      if (!map.has(doc.document_type)) {
        map.set(doc.document_type, []);
      }
      map.get(doc.document_type).push(doc);
    });
    return map;
  }, [documents]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadState((current) => ({ ...current, submitting: true, error: '' }));

    try {
      await uploadDocument({
        documentName: uploadState.documentName,
        documentType: uploadState.documentType,
        file: uploadState.file,
      });
      setUploadState({
        documentName: '',
        documentType: '',
        file: null,
        submitting: false,
        error: '',
      });
      setSelectedRequirement(null);
    } catch (error) {
      setUploadState((current) => ({ ...current, submitting: false, error: error.message }));
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-gutter space-y-6 pb-12">
      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Verification Page</h2>
          <p className="mt-2 text-gray-500">This is the second stage of your civic journey. Review the required documents, upload them, and inspect the submitted details.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Current civic state</p>
          <p className="mt-1 text-sm font-bold text-primary">{profile?.state ? profile.state.replaceAll('_', ' ') : 'NEW USER'}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary">Required Documents</h3>
            <p className="mt-1 text-sm text-gray-500">Upload each verification requirement in PDF, PNG, JPG, JPEG, or WEBP format.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REQUIRED_DOCUMENTS.map((item) => {
            const uploadedDocuments = uploadedByType.get(item.type) || [];
            const latestDocument = uploadedDocuments[0];
            return (
              <div key={item.type} className="rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-primary">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${latestDocument ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {latestDocument ? 'Uploaded' : 'Pending'}
                  </span>
                </div>
                {latestDocument && (
                  <p className="mt-4 text-xs text-gray-500">
                    Latest file: <span className="font-semibold text-gray-700">{latestDocument.file_name || latestDocument.document_name}</span>
                  </p>
                )}
                <button
                  onClick={() => {
                    setSelectedRequirement(item);
                    setUploadState((current) => ({
                      ...current,
                      documentName: item.name,
                      documentType: item.type,
                      error: '',
                    }));
                  }}
                  className="mt-5 inline-flex rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white transition hover:bg-primary"
                >
                  Upload
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-primary">Uploaded Documents</h3>
          <p className="mt-1 text-sm text-gray-500">Every uploaded file stays visible here with its verification status and details.</p>
        </div>

        {loading.documents ? (
          <div className="py-10 text-center text-gray-500">Loading verification documents...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-bold text-primary">No verification documents uploaded yet</p>
            <p className="mt-2 text-sm text-gray-500">Use any upload button above to submit your first verification document.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-primary-container">
                  <th className="px-4 py-4">Document</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Upload Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{doc.document_name || doc.file_name || 'Untitled document'}</p>
                      <p className="text-xs text-gray-500">{doc.file_name || 'File name not available'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{doc.document_type || 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${doc.is_valid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.is_valid ? 'Verified' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => setSelectedDocument(doc)} className="text-sm font-bold text-primary hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRequirement && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary">Upload Verification Document</h3>
                <p className="mt-1 text-sm text-gray-500">{selectedRequirement.name}</p>
              </div>
              <button onClick={() => setSelectedRequirement(null)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-on-surface">Document Name</label>
                <input
                  value={uploadState.documentName}
                  onChange={(event) => setUploadState((current) => ({ ...current, documentName: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-on-surface">Document Type</label>
                <input
                  value={uploadState.documentType}
                  onChange={(event) => setUploadState((current) => ({ ...current, documentType: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-on-surface">File</label>
                <input
                  type="file"
                  accept={ACCEPTED_FORMATS}
                  required
                  onChange={(event) => setUploadState((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">Accepted formats: PDF, PNG, JPG, JPEG, WEBP.</p>
              </div>
              {uploadState.error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{uploadState.error}</div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedRequirement(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600">
                  Cancel
                </button>
                <button type="submit" disabled={uploadState.submitting || !uploadState.file} className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                  {uploadState.submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary">Document Details</h3>
                <p className="mt-1 text-sm text-gray-500">{selectedDocument.document_name || selectedDocument.file_name}</p>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Document Name</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{selectedDocument.document_name || 'Not provided'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Document Type</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{selectedDocument.document_type || 'Unknown'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">File Name</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{selectedDocument.file_name || 'Not available'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">File Size</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{formatBytes(selectedDocument.file_size)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mime Type</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{selectedDocument.mime_type || 'Not available'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Uploaded At</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{new Date(selectedDocument.uploaded_at).toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Validation Status</p>
                <p className="mt-2 text-sm font-semibold text-gray-800">{selectedDocument.is_valid ? 'Verified by document scan' : 'Pending manual or backend validation'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Extracted Details</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">{selectedDocument.extracted_text || 'No extracted document details available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
