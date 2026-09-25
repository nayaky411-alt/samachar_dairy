import React, { useState } from 'react';
import { AlertCircle, X, Send } from 'lucide-react';

const RejectModal = ({ articleTitle, onConfirm, onCancel, isSubmitting = false }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('લેખ નકારવાનું કારણ લખવું ફરજિયાત છે.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('કૃપા કરીને પત્રકારને યોગ્ય માર્ગદર્શન મળી રહે તે માટે વિસ્તૃત કારણ લખો.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} className="text-red-600" />
            <h3 className="font-black text-sm">લેખ નકારો / સુધારા સૂચવો (Reject / Request Changes)</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            લેખ: <span className="font-bold text-slate-900">"{articleTitle}"</span>
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              નકારવાનું સત્તાવાર કારણ (Mandatory Reason) *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="દા.ત. તથ્યોની પુષ્ટિ બાકી છે, સત્તાવાર અધિકારીનું નિવેદન ઉમેરો, ભાષાકીય ભૂલો સુધારો..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-xl outline-none text-slate-900"
            />
            {error && <p className="text-xs font-bold text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'પ્રોસેસિંગ...' : 'નકારો અને સૂચના મોકલો'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
