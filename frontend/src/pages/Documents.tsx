import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Upload, Lock, ShieldAlert, CheckCircle2, ChevronRight, X, Download } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { ProcessingPipeline } from '../components/ProcessingPipeline';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Modal & Processing Pipeline
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fetchDocs = () => {
    setLoading(true);
    api.getDocuments({ search, classification: classificationFilter })
      .then(res => setDocuments(res.documents))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [search, classificationFilter]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (title) formData.append('title', title);

    try {
      setIsProcessing(true);
      const res = await api.uploadDocument(formData);
      setUploadResult(res);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
      setIsProcessing(false);
    }
  };

  const handlePipelineComplete = () => {
    setIsProcessing(false);
    setIsUploadOpen(false);
    setSelectedFile(null);
    setTitle('');
    fetchDocs();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-outfit text-slate-100">Document Repository</h2>
          <p className="text-xs text-slate-400">All confidential files scanned for Aadhaar, PAN, SSN, API Keys & PII</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, filename, or content..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Classification:</label>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Classifications</option>
            <option value="PUBLIC">PUBLIC</option>
            <option value="INTERNAL">INTERNAL</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
            <option value="HIGHLY_CONFIDENTIAL">HIGHLY CONFIDENTIAL</option>
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No documents found matching search criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all space-y-4">
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    doc.classification === 'HIGHLY_CONFIDENTIAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    doc.classification === 'CONFIDENTIAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    doc.classification === 'INTERNAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}>
                    {doc.classification}
                  </span>

                  <span className={`font-mono text-xs font-black ${doc.leakScore >= 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {doc.leakScore}% Leak Score
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-outfit truncate">{doc.title}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{doc.filename}</p>
                </div>

                {/* Entities found pill list */}
                <div className="flex flex-wrap gap-1">
                  {doc.entities?.slice(0, 3).map((ent, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[9px] text-slate-300 font-mono">
                      {ent.entityType} ({ent.locationCount})
                    </span>
                  ))}
                  {doc.entities && doc.entities.length > 3 && (
                    <span className="text-[9px] text-slate-500">+{doc.entities.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">Action: <strong className="text-cyan-400">{doc.recommendedAction}</strong></span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await api.downloadDocument(doc.id, 'encrypted');
                      } catch (err: any) {
                        alert(err.message || 'Download failed');
                      }
                    }}
                    title="Download AES-256 Encrypted Security Envelope (PDF)"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>PDF</span>
                  </button>

                  <Link
                    to={`/documents/${doc.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Drawer */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-40 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 font-outfit">Upload Document for Security Scan</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Production Keys 2026"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select File (PDF, DOCX, TXT, CSV, JSON)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-navy-900 text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 transition-all disabled:opacity-50"
              >
                Run AI Entity & Leak Scan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Processing Pipeline Modal Animation */}
      <ProcessingPipeline
        isOpen={isProcessing}
        filename={selectedFile?.name || 'document'}
        analysisData={uploadResult ? {
          classification: uploadResult.document.classification,
          leakScore: uploadResult.document.leakScore,
          recommendedAction: uploadResult.document.recommendedAction,
          reasoning: uploadResult.analysisReasoning
        } : undefined}
        onComplete={handlePipelineComplete}
      />
    </div>
  );
};
