import { useState, useEffect } from 'react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/document/list/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDocuments(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto p-gutter space-y-stack-lg pb-12">
      <div className="mt-8 mb-6">
        <h2 className="text-3xl font-bold text-primary">Civic Documents</h2>
        <p className="text-gray-500 mt-2">Manage and view your uploaded documents and verifications.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        {loading ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined animate-spin text-4xl text-gray-300">refresh</span>
            <p className="text-gray-500 mt-4">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">inventory_2</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No Documents Yet</h3>
            <p className="text-gray-500">You haven't uploaded any verification documents yet. Go to the Chat interface and click the attachment icon to upload an ID proof.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-primary-container">
                  <th className="py-4 px-4">Document Type</th>
                  <th className="py-4 px-4">Upload Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">description</span>
                      <span className="font-semibold text-gray-800">{doc.document_type || 'ID Proof'}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {doc.is_valid ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center w-max gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span> Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center w-max gap-1">
                          <span className="material-symbols-outlined text-[14px]">pending</span> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-primary font-bold text-sm hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
