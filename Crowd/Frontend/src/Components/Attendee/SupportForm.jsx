import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import axios from 'axios';

const SupportForm = () => {
  const [activeForm, setActiveForm] = useState('Lost Person');
  const [formData, setFormData] = useState({});
  const [reports, setReports] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const buttonList = ['Emergency', 'Lost Person', 'Lost Item', 'Complaints'];

  // style helpers (from minimal UI pass)
  const baseInput =
    'w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-yellow-400/70 focus:border-yellow-400/60 transition';
  const baseCard =
    'bg-[#243463]/70 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-yellow-400/50 hover:bg-[#243463]/85 transition';

  useEffect(() => { fetchReports(); setFormData({}); setErrors({}); setTouched({}); }, [activeForm]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/support`);
      setReports(res.data.filter((r) => r.type === activeForm));
    } catch (error) { console.error('Failed to fetch reports:', error); }
  };

  // ---------- validation helpers ----------
  const isImage = (f) => f && f.type && f.type.startsWith('image/');
  const isPosInt = (v) => {
    if (v === '' || v == null) return false;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1;
  };
  const validateShort = (v) => typeof v === 'string' && v.trim().length >= 3 && v.trim().length <= 50;
  const validateLong = (v) => typeof v === 'string' && v.trim().length >= 5;

  const fieldError = (name, value) => {
    switch (name) {
      case 'name':
      case 'lastSeen':
      case 'emergencyType':
      case 'location':
      case 'itemName':
      case 'lastSeenLocation':
      case 'subject':
        return validateShort(value) ? '' : 'Must be 3–50 characters.';
      case 'description':
      case 'complaintDetails':
        return validateLong(value) ? '' : 'Must be at least 5 characters.';
      case 'age': {
        const s = String(value ?? '');
        if (!/^\d{1,2}$/.test(s)) return 'Age must be 1–99 (max 2 digits).';
        if (!isPosInt(s)) return 'Age must be a positive integer.';
        if (Number(s) < 1) return 'Age must be ≥ 1.';
        return '';
      }
      default:
        return '';
    }
  };

  const setErr = (field, msg) => setErrors((e) => ({ ...e, [field]: msg }));
  const clearErr = (field) => setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  const markTouched = (field) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  // ---------- handlers ----------
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    markTouched('image');
    if (!file) { setFormData({ ...formData, image: undefined }); clearErr('image'); return; }
    if (!isImage(file)) {
      setErr('image', 'Please select a valid image file (jpg, png, gif, etc.).');
      e.target.value = ''; // block non-image selection
      setFormData({ ...formData, image: undefined });
      return;
    }
    clearErr('image');
    setFormData({ ...formData, image: file });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') return; // handled in handleFileChange
    markTouched(name);

    let nextValue = value;

    // age: allow only digits, max 2 characters
    if (name === 'age') {
      nextValue = (value || '').replace(/\D/g, '').slice(0, 2);
    }

    const next = { ...formData, [name]: nextValue };
    setFormData(next);

    // live validate this field
    const msg = fieldError(name, nextValue);
    if (msg) setErr(name, msg); else clearErr(name);
  };

  // Final form validation on submit (also ensures requireds per form)
  const validateFormBeforeSubmit = () => {
    const newErrors = {};
    const add = (k, m) => { newErrors[k] = m; markTouched(k); };

    if (activeForm === 'Lost Person') {
      if (fieldError('name', formData.name)) add('name', fieldError('name', formData.name));
      if (fieldError('age', formData.age)) add('age', fieldError('age', formData.age));
      if (fieldError('lastSeen', formData.lastSeen)) add('lastSeen', fieldError('lastSeen', formData.lastSeen));
      if (!formData?.gender) add('gender', 'Please select a gender.');
      if (!formData.image) add('image', 'Photo is required.');
      else if (!isImage(formData.image)) add('image', 'Please upload a valid image file.');
    }

    if (activeForm === 'Emergency') {
      if (fieldError('emergencyType', formData.emergencyType)) add('emergencyType', fieldError('emergencyType', formData.emergencyType));
      if (fieldError('description', formData.description)) add('description', fieldError('description', formData.description));
      if (fieldError('location', formData.location)) add('location', fieldError('location', formData.location));
    }

    if (activeForm === 'Lost Item') {
      if (fieldError('itemName', formData.itemName)) add('itemName', fieldError('itemName', formData.itemName));
      if (fieldError('description', formData.description)) add('description', fieldError('description', formData.description));
      if (fieldError('lastSeenLocation', formData.lastSeenLocation)) add('lastSeenLocation', fieldError('lastSeenLocation', formData.lastSeenLocation));
      if (formData.image && !isImage(formData.image)) add('image', 'Please upload a valid image file.');
    }

    if (activeForm === 'Complaints') {
      if (fieldError('subject', formData.subject)) add('subject', fieldError('subject', formData.subject));
      if (fieldError('complaintDetails', formData.complaintDetails)) add('complaintDetails', fieldError('complaintDetails', formData.complaintDetails));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormBeforeSubmit()) return; // ⛔ block submit

    const payload = new FormData();
    for (let key in formData) payload.append(key, formData[key]);
    payload.append('type', activeForm);

    try {
      await axios.post('http://localhost:5000/api/support', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({});
      setErrors({});
      setTouched({});
      fetchReports();
      alert('Incident reported successfully');
    } catch (error) { console.error('Submission error:', error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/support/${id}`);
      setReports(reports.filter((r) => r._id !== id));
    } catch (error) { console.error('Delete error:', error); }
  };

  const renderForm = () => {
    const showErr = (name) => touched[name] && errors[name];

    switch (activeForm) {
      case 'Lost Person':
        return (
          <>
            <label className="text-sm text-white/80">
              Name
              <input
                type="text" name="name" className={baseInput}
                onChange={handleChange} value={formData.name || ''}
                placeholder="e.g., Jane Doe" required minLength={3} maxLength={50}
              />
              {showErr('name') && <p className="text-xs text-red-300 mt-1">{errors.name}</p>}
            </label>

            <label className="text-sm text-white/80">
              Age
              <input
                type="number" name="age" className={`${baseInput} w-24`}
                onChange={handleChange} value={formData.age || ''} placeholder="28"
                required min={1} max={99} step={1}
                onKeyDown={(e)=>['e','E','+','-','.'].includes(e.key)&&e.preventDefault()}
                onWheel={(e)=>e.currentTarget.blur()}
                inputMode="numeric"
              />
              {showErr('age') && <p className="text-xs text-red-300 mt-1">{errors.age}</p>}
            </label>

            <label className="text-sm text-white/80">
              Last seen?
              <input
                type="text" name="lastSeen" className={baseInput}
                onChange={handleChange} value={formData.lastSeen || ''}
                placeholder="Gate B near parking lot" required minLength={3} maxLength={50}
              />
              {showErr('lastSeen') && <p className="text-xs text-red-300 mt-1">{errors.lastSeen}</p>}
            </label>

            <div className="flex items-center gap-4 text-sm text-white/80">
              Gender:
              <label className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="gender" value="female" onChange={handleChange} checked={formData.gender === 'female'} required /> Female
              </label>
              <label className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input type="radio" name="gender" value="male" onChange={handleChange} checked={formData.gender === 'male'} required /> Male
              </label>
              {showErr('gender') && <p className="text-xs text-red-300">{errors.gender}</p>}
            </div>

            <div className="mt-2">
              <p className="text-sm text-white/80">Photo</p>
              <div className="bg-white/5 mt-2 rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-yellow-400/60 hover:bg-white/10 transition">
                <UploadCloud className="w-10 h-10 text-white mb-2" />
                <input
                  type="file" name="image" accept="image/*"
                  className="text-white bg-transparent"
                  onChange={handleFileChange} required
                />
                <p className="text-center text-xs text-white/60 mt-2">{formData.image ? formData.image.name : 'No file selected'}</p>
                {showErr('image') && <p className="text-xs text-red-300 mt-1">{errors.image}</p>}
              </div>
            </div>
          </>
        );

      case 'Emergency':
        return (
          <>
            <label className="text-sm text-white/80">
              Type of Emergency
              <input
                type="text" name="emergencyType" className={baseInput}
                onChange={handleChange} value={formData.emergencyType || ''}
                placeholder="Fire, Medical, Security..." required minLength={3} maxLength={50}
              />
              {showErr('emergencyType') && <p className="text-xs text-red-300 mt-1">{errors.emergencyType}</p>}
            </label>

            <label className="text-sm text-white/80">
              Description
              <textarea
                name="description" className={`${baseInput} min-h-28`} rows="4"
                onChange={handleChange} value={formData.description || ''}
                placeholder="Provide concise details…" required minLength={5}
              />
              {showErr('description') && <p className="text-xs text-red-300 mt-1">{errors.description}</p>}
            </label>

            <label className="text-sm text-white/80">
              Location
              <input
                type="text" name="location" className={baseInput}
                onChange={handleChange} value={formData.location || ''}
                placeholder="Hall A, East exit" required minLength={3} maxLength={50}
              />
              {showErr('location') && <p className="text-xs text-red-300 mt-1">{errors.location}</p>}
            </label>
          </>
        );

      case 'Lost Item':
        return (
          <>
            <label className="text-sm text-white/80">
              Item Name
              <input
                type="text" name="itemName" className={baseInput}
                onChange={handleChange} value={formData.itemName || ''}
                placeholder="Wallet" required minLength={3} maxLength={50}
              />
              {showErr('itemName') && <p className="text-xs text-red-300 mt-1">{errors.itemName}</p>}
            </label>

            <label className="text-sm text-white/80">
              Description
              <textarea
                name="description" className={`${baseInput} min-h-24`} rows="3"
                onChange={handleChange} value={formData.description || ''}
                placeholder="Color, brand, identifiers…" required minLength={5}
              />
              {showErr('description') && <p className="text-xs text-red-300 mt-1">{errors.description}</p>}
            </label>

            <label className="text-sm text-white/80">
              Last Seen Location
              <input
                type="text" name="lastSeenLocation" className={baseInput}
                onChange={handleChange} value={formData.lastSeenLocation || ''}
                placeholder="Food court near stall 5" required minLength={3} maxLength={50}
              />
              {showErr('lastSeenLocation') && <p className="text-xs text-red-300 mt-1">{errors.lastSeenLocation}</p>}
            </label>

            <div className="mt-2">
              <p className="text-sm text-white/80">Upload Item Image (optional)</p>
              <div className="bg-white/5 mt-2 rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-yellow-400/60 hover:bg-white/10 transition">
                <UploadCloud className="w-10 h-10 text-white mb-2" />
                <input
                  type="file" name="image" accept="image/*"
                  className="text-white bg-transparent"
                  onChange={handleFileChange}
                />
                <p className="text-center text-xs text-white/60 mt-2">{formData.image ? formData.image.name : 'No file selected'}</p>
                {showErr('image') && <p className="text-xs text-red-300 mt-1">{errors.image}</p>}
              </div>
            </div>
          </>
        );

      case 'Complaints':
        return (
          <>
            <label className="text-sm text-white/80">
              Subject
              <input
                type="text" name="subject" className={baseInput}
                onChange={handleChange} value={formData.subject || ''}
                placeholder="Short, clear subject" required minLength={3} maxLength={50}
              />
              {showErr('subject') && <p className="text-xs text-red-300 mt-1">{errors.subject}</p>}
            </label>

            <label className="text-sm text-white/80">
              Complaint Details
              <textarea
                name="complaintDetails" className={`${baseInput} min-h-28`} rows="4"
                onChange={handleChange} value={formData.complaintDetails || ''}
                placeholder="What happened? Where and when?" required minLength={5}
              />
              {showErr('complaintDetails') && <p className="text-xs text-red-300 mt-1">{errors.complaintDetails}</p>}
            </label>
          </>
        );
      default:
        return null;
    }
  };

  const renderReports = () => {
    if (!reports.length) return <p className="text-gray-400 mt-6 bg-white/5 rounded-xl px-4 py-3 border border-white/10">No reports submitted yet.</p>;

    return (
      <div className="mt-6 max-h-96 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Submitted Reports</h3>
        <ul className="grid md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <li key={report._id} className={baseCard}>
              {activeForm === 'Lost Person' && (
                <>
                  <p><strong className="text-white/60">Name:</strong> {report.name}</p>
                  <p><strong className="text-white/60">Age:</strong> {report.age}</p>
                  <p className="sm:col-span-2"><strong className="text-white/60">Last Seen:</strong> {report.lastSeen}</p>
                  <p><strong className="text-white/60">Gender:</strong> {report.gender}</p>
                  {report.imageUrl && <img src={report.imageUrl} alt="Lost Person" className="mt-2 max-w-xs rounded-lg border border-white/10" />}
                </>
              )}
              {activeForm === 'Emergency' && (
                <>
                  <p><strong className="text-white/60">Type:</strong> {report.emergencyType}</p>
                  <p><strong className="text-white/60">Description:</strong> {report.description}</p>
                  <p><strong className="text-white/60">Location:</strong> {report.location}</p>
                </>
              )}
              {activeForm === 'Lost Item' && (
                <>
                  <p><strong className="text-white/60">Item Name:</strong> {report.itemName}</p>
                  <p><strong className="text-white/60">Description:</strong> {report.description}</p>
                  <p><strong className="text-white/60">Last Seen Location:</strong> {report.lastSeenLocation}</p>
                  {report.imageUrl && <img src={report.imageUrl} alt="Lost Item" className="mt-2 max-w-xs rounded-lg border border-white/10" />}
                </>
              )}
              {activeForm === 'Complaints' && (
                <>
                  <p><strong className="text-white/60">Subject:</strong> {report.subject}</p>
                  <p><strong className="text-white/60">Details:</strong> {report.complaintDetails}</p>
                </>
              )}
              <button
                onClick={() => handleDelete(report._id)}
                className="mt-3 inline-flex items-center justify-center bg-red-600/90 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-10 text-white w-full max-w-5xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Got any Problem?</h1>
        <p className="text-gray-300 text-lg mt-1">Don’t worry, We’ve got your back</p>
        <p className="text-sm text-gray-400 mt-2">Reporting forms for incidents</p>
      </div>

      {/* Category pills */}
      <div className="inline-flex flex-wrap gap-2 mb-8 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
        {buttonList.map((btn) => (
          <button
            key={btn}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeForm === btn
                ? 'bg-yellow-400 text-black shadow-[0_0_0_3px_rgba(234,179,8,0.25)]'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveForm(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-[#1e2a4a] rounded-2xl p-6 border border-white/10 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">{activeForm}</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {renderForm()}
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-black font-bold py-2.5 px-4 rounded-xl mt-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            Report
          </button>
        </form>

        {/* Reports */}
        {renderReports()}
      </div>
    </div>
  );
};

export default SupportForm;
