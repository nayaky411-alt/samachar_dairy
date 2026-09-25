import React from 'react';
import ArticleEditor from '../../components/admin/ArticleEditor';

export default function CreateArticlePage() {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-gujarati text-slate-900">નવો અહેવાલ તૈયાર કરો (Create Article)</h1>
        <p className="text-xs text-slate-500 font-gujarati">
          ગુજરાતી યુનિકોડમાં સમાચાર લખો, સંબંધિત જિલ્લો પસંદ કરો અને ચેનલ હેડની મંજૂરી માટે મોકલો.
        </p>
      </div>
      <ArticleEditor isEdit={false} />
    </div>
  );
}
