import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud } from 'lucide-react';

const SupportForm = () => {
  const [activeForm, setActiveForm] = useState('Lost Person');
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const buttonList = ['Emergency', 'Lost Person', 'Lost Item', 'Complaints'];

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/support'); // Make sure this API exists
      setSubmissions(res.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    for (let key in formData) {
      payload.append(key, formData[key]);
    }
    payload.append('type', activeForm);

    try {
      if (editingId) {
        await axios.put(`/api/support/${editingId}`, payload);
      } else {
        await axios.post('/api/support', payload);
      }
      fetchSubmissions();
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleEdit = (submission) => {
    setActiveForm(submission.type);
    setFormData(submission);
    setEditingId(submission._id);
    setImagePreview(submission.imageUrl || null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/support/${id}`);
      fetchSubmissions();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setImagePreview(null);
  };

  // 🔁 Reset image when form changes
  const handleFormSwitch = (form) => {
    setActiveForm(form);
    resetForm();
  };

  return (
    <div className="p-10 text-white w-full max-w-5xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Got any Problem?</h1>
        <p className="text-gray-300 text-lg mt-1">Don’t worry, We’ve got your back</p>
        <p className="text-sm text-gray-400 mt-2">Reporting forms for incidents</p>
      </div>

      {/* Form Type Toggle */}
      <div className="flex flex-wrap gap-4 mb-8">
        {buttonList.map((btn) => (
          <button
            key={btn}
            className={`px-6 py-2 border rounded-md transition font-semibold ${
              activeForm === btn
                ? 'bg-yellow-400 text-black'
                : 'bg-transparent border-white/30 text-white hover:bg-white/10'
            }`}
            onClick={() => handleFormSwitch(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e2a4a] rounded-md p-6 border border-white/10 shadow-xl flex flex-col gap-4 mb-10"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold text-white mb-4">{editingId ? `Edit ${activeForm}` : activeForm}</h2>

        <input
          type="text"
          name="title"
          placeholder="Title / Name"
          onChange={handleChange}
          value={formData.title || ''}
          className="p-2 rounded bg-white/10 border border-white/20 text-white"
          required
        />

        <textarea
          name="description"
          placeholder="Describe the situation..."
          rows="4"
          onChange={handleChange}
          value={formData.description || ''}
          className="p-2 rounded bg-white/10 border border-white/20 text-white"
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          onChange={handleChange}
          value={formData.location || ''}
          className="p-2 rounded bg-white/10 border border-white/20 text-white"
          required
        />

        {/* Image Upload Area */}
        <div>
          <label className="text-white/80 block mb-2">
            {activeForm === 'Lost Person' || activeForm === 'Lost Item'
              ? 'Upload a relevant image (optional)'
              : 'Attach image (optional)'}
          </label>

          <label
            htmlFor="file-upload"
            className="cursor-pointer border-2 border-dashed border-white/20 rounded-md bg-white/5 p-6 flex flex-col items-center justify-center text-center text-white/60 hover:bg-white/10 transition"
          >
            <UploadCloud className="w-10 h-10 mb-2" />
            <p>Click to upload or drag image here</p>
            <input
              type="file"
              name="image"
              id="file-upload"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-auto rounded border border-white/20"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4"
        >
          {editingId ? 'Update Report' : 'Submit Report'}
        </button>
      </form>

      {/* Submissions Display */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Submitted Reports</h3>
        {submissions.length === 0 ? (
          <p className="text-gray-400">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div
                key={s._id}
                className="bg-white/5 border border-white/10 p-4 rounded-md flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="text-sm text-gray-300">{s.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Location: {s.location}</p>
                  {s.imageUrl && (
                    <img
                      src={s.imageUrl}
                      alt="Report"
                      className="h-20 w-auto mt-2 rounded"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-yellow-300 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-red-400 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportForm;
