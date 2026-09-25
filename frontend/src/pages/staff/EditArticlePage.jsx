import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import ArticleEditor from '../../components/admin/ArticleEditor';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function EditArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/staff/articles/${id}`)
      .then(res => {
        if (res.data.success) {
          setArticle(res.data.data.article);
        } else {
          setError('અહેવાલ મળ્યો નથી.');
        }
      })
      .catch(err => {
        console.error('Fetch article error:', err);
        setError('અહેવાલ લોડ કરવામાં ક્ષતિ આવી છે.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-600 font-gujarati">અહેવાલ લોડ થઈ રહ્યો છે...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900 font-gujarati">{error || 'અહેવાલ ઉપલબ્ધ નથી'}</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          પાછા જાઓ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-gujarati text-slate-900">અહેવાલમાં સુધારો કરો (Edit Article)</h1>
          <p className="text-xs text-slate-500 font-gujarati">
            ID: #{article.id} | વર્તમાન સ્થિતિ: <strong className="uppercase">{article.status}</strong>
          </p>
        </div>
        {article.rejection_reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 max-w-md">
            <strong>સંપાદકની નોંધ (Rejection Feedback):</strong> {article.rejection_reason}
          </div>
        )}
      </div>
      <ArticleEditor initialData={article} isEdit={true} />
    </div>
  );
}
