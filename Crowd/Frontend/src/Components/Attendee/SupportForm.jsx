import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import axios from 'axios';

const SupportForm = () => {
  const [activeForm, setActiveForm] = useState('Lost Person');
  const [formData, setFormData] = useState({});
  const [reports, setReports] = useState([]);

  const buttonList = ['Emergency', 'Lost Person', 'Lost Item', 'Complaints'];

  // Fetch reports on activeForm change
  useEffect(() => {
    fetchReports();
    setFormData({}); // clear form on switch
  }, [activeForm]);
  

  const fetchReports = async () => {
  try {
    const res = await axios.get(`http://${API_BASE_URL}/api/support`);
    // Frontend filtering by report type
    const filtered = res.data.filter(report => report.type === activeForm);
    setReports(filtered);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
  }
};


  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
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
      await axios.post('http://${API_BASE_URL}/api/support', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Incident reported successfully');
      setFormData({});
      fetchReports();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`http://${API_BASE_URL}/api/support/${id}`);
      setReports(reports.filter(report => report._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Render form fields inline depending on activeForm (your original inputs)
  const renderForm = () => {
    switch (activeForm) {
      case 'Lost Person':
        return (
          <>
            <label>
              Name
              <input
                type="text"
                name="name"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.name || ''}
              />
            </label>
            <label>
              Age
              <input
                type="number"
                name="age"
                className="w-24 mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.age || ''}
              />
            </label>
            <label>
              Last seen?
              <input
                type="text"
                name="lastSeen"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.lastSeen || ''}
              />
            </label>
            <div className="flex items-center gap-4">
              Gender:
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  onChange={handleChange}
                  checked={formData.gender === 'female'}
                />{' '}
                Female
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  onChange={handleChange}
                  checked={formData.gender === 'male'}
                />{' '}
                Male
              </label>
            </div>
            <div className="mt-4">
              <p className="text-white">Photo</p>
              <div className="bg-white/10 mt-2 rounded-md p-6 flex flex-col items-center justify-center border border-dashed border-white/20">
                <UploadCloud className="w-10 h-10 text-white mb-2" />
                <input type="file" name="image" className="text-white bg-transparent" onChange={handleChange} />
                <p className="text-center text-sm text-white/70 mt-2">
                  {formData.image ? formData.image.name : 'No file selected'}
                </p>
              </div>
            </div>
          </>
        );
      case 'Emergency':
        return (
          <>
            <label>
              Type of Emergency
              <input
                type="text"
                name="emergencyType"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.emergencyType || ''}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                rows="4"
                onChange={handleChange}
                value={formData.description || ''}
              />
            </label>
            <label>
              Location
              <input
                type="text"
                name="location"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.location || ''}
              />
            </label>
          </>
        );
      case 'Lost Item':
        return (
          <>
            <label>
              Item Name
              <input
                type="text"
                name="itemName"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.itemName || ''}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                rows="3"
                onChange={handleChange}
                value={formData.description || ''}
              />
            </label>
            <label>
              Last Seen Location
              <input
                type="text"
                name="lastSeenLocation"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.lastSeenLocation || ''}
              />
            </label>
            <div className="mt-4">
              <p className="text-white">Upload Item Image</p>
              <div className="bg-white/10 mt-2 rounded-md p-6 flex flex-col items-center justify-center border border-dashed border-white/20">
                <UploadCloud className="w-10 h-10 text-white mb-2" />
                <input type="file" name="image" className="text-white bg-transparent" onChange={handleChange} />
                <p className="text-center text-sm text-white/70 mt-2">
                  {formData.image ? formData.image.name : 'No file selected'}
                </p>
              </div>
            </div>
          </>
        );
      case 'Complaints':
        return (
          <>
            <label>
              Subject
              <input
                type="text"
                name="subject"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                onChange={handleChange}
                value={formData.subject || ''}
              />
            </label>
            <label>
              Complaint Details
              <textarea
                name="complaintDetails"
                className="w-full mt-1 p-2 rounded bg-white/10 border border-white/20 text-white"
                rows="4"
                onChange={handleChange}
                value={formData.complaintDetails || ''}
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  // Render list of submitted reports for current activeForm
  const renderReports = () => {
    if (!reports.length) return <p className="text-gray-400 mt-4">No reports submitted yet.</p>;

    return (
      <div className="mt-6 max-h-96 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Submitted Reports</h3>
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report._id} className="bg-[#2a3a6e] p-4 rounded-md border border-white/20">
              {activeForm === 'Lost Person' && (
                <>
                  <p><strong>Name:</strong> {report.name}</p>
                  <p><strong>Age:</strong> {report.age}</p>
                  <p><strong>Last Seen:</strong> {report.lastSeen}</p>
                  <p><strong>Gender:</strong> {report.gender}</p>
                  {report.imageUrl && <img src={report.imageUrl} alt="Lost Person" className="mt-2 max-w-xs rounded" />}
                </>
              )}
              {activeForm === 'Emergency' && (
                <>
                  <p><strong>Type:</strong> {report.emergencyType}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Location:</strong> {report.location}</p>
                </>
              )}
              {activeForm === 'Lost Item' && (
                <>
                  <p><strong>Item Name:</strong> {report.itemName}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Last Seen Location:</strong> {report.lastSeenLocation}</p>
                  {report.imageUrl && <img src={report.imageUrl} alt="Lost Item" className="mt-2 max-w-xs rounded" />}
                </>
              )}
              {activeForm === 'Complaints' && (
                <>
                  <p><strong>Subject:</strong> {report.subject}</p>
                  <p><strong>Details:</strong> {report.complaintDetails}</p>
                </>
              )}
              <button
                onClick={() => handleDelete(report._id)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1 px-3 rounded"
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

      {/* Button Toggle */}
      <div className="flex flex-wrap gap-4 mb-8">
        {buttonList.map((btn) => (
          <button
            key={btn}
            className={`px-6 py-2 border rounded-md transition font-semibold ${
              activeForm === btn
                ? 'bg-yellow-400 text-black'
                : 'bg-transparent border-white/30 text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveForm(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Form Section */}
      <div className="bg-[#1e2a4a] rounded-md p-6 border border-white/10 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">{activeForm}</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {renderForm()}
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4 w-full"
          >
            Report
          </button>
        </form>

        {/* Submitted reports list */}
        {renderReports()}
      </div>
    </div>
  );
};

export default SupportForm;
