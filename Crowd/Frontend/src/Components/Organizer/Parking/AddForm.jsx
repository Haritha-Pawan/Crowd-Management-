import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const FACILITY_OPTIONS = [
  "EV charging", "CCTV", "Handicap accessible", "Covered",
  "24/7 access", "Security personnel", "Restrooms",
];

const NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 \-_.]{1,58}[A-Za-z0-9]$/; // 2–60 chars, letters/numbers/space/-/_/.
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;                              // 0, 10, 10.5, 10.55
const DISTANCE_REGEX = /^\d+(\.\d+)?\s*(m|km)?$/i;                    // 50, 50m, 0.3km
const LAT_REGEX = /^-?(90(\.0+)?|[0-8]?\d(\.\d+)?)$/;                 // -90..90

const sanitizeMoney = (v) => {
  let s = v.replace(/[^\d.]/g, "");     
  s = s.replace(/(\..*)\./g, "$1");     
  s = s.replace(/^0+(?=\d)/, "");       
  s = s.replace(/^(\d+)(\.\d{0,2}).*$/, "$1$2"); 
  return s;
};
const sanitizeInteger = (v, maxLen = 5) => v.replace(/\D/g, "").slice(0, maxLen);
const sanitizeLatitude = (v) => {
  let s = v.replace(/[^0-9.\-]/g, "");
  s = s.replace(/(.*-).*-/g, "$1");     
  s = s.replace(/(\..*)\./g, "$1");     
  return s;
};

const validate = (fd) => {
  const errors = {};

  // name
  const name = (fd.name || "").trim();
  if (!name) errors.name = "Zone name is required";
  else if (!NAME_REGEX.test(name)) errors.name = "2–60 chars; letters, numbers, space, - _ . only";

  // location
  const location = (fd.location || "").trim();
  if (!location) errors.location = "Location is required";
  else if (location.length < 2) errors.location = "Location is too short";

  // capacity (strict integer)
  if (fd.capacity === "") errors.capacity = "Capacity is required";
  else if (!/^\d+$/.test(fd.capacity)) errors.capacity = "Capacity must be an integer";
  else {
    const cap = Number(fd.capacity);
    if (cap < 1) errors.capacity = "Capacity must be at least 1";
    if (cap > 10000) errors.capacity = "Capacity is too large (max 10000)";
  }

  // type
  const type = (fd.type || "").trim();
  if (!type) errors.type = "Type is required";
  else if (type.length > 30) errors.type = "Type is too long";

  // status (select ensures one of two)
  if (!["active", "inactive"].includes(fd.status)) errors.status = "Invalid status";

  // price
  if (fd.price === "") errors.price = "Price is required";
  else if (!PRICE_REGEX.test(fd.price)) errors.price = "Price must be a number (max 2 decimals)";
  else if (Number(fd.price) < 0) errors.price = "Price cannot be negative";

  // distance (optional but must match if provided)
  const dist = (fd.distance || "").trim();
  if (dist && !DISTANCE_REGEX.test(dist)) errors.distance = "Use 50, 50m, 0.3km";

  // latitude (optional; -90..90)
  const lat = (fd.latitude || "").trim();
  if (lat && !LAT_REGEX.test(lat)) errors.latitude = "Latitude must be between -90 and 90";

  // description (optional)
  if (fd.description && fd.description.length > 400) errors.description = "Max 400 characters";

  return errors;
};

const AddForm = ({ isOpen, onClose, OnCreated, refresh }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    type: "Standard",
    status: "active",
    price: "",
    distance: "",
    description: "",
    facilities: [],
    latitude: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handlechange = (e) => {
    const { name, value } = e.target;
    let v = value;

    // hard input sanitizing per-field
    if (name === "capacity") v = sanitizeInteger(value, 5);
    if (name === "price") v = sanitizeMoney(value);
    if (name === "latitude") v = sanitizeLatitude(value);

    setFormData((p) => ({ ...p, [name]: v }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear error as user types
  };

  const toggleFacility = (label) => {
    setFormData((p) => ({
      ...p,
      facilities: p.facilities.includes(label)
        ? p.facilities.filter((f) => f !== label)
        : [...p.facilities, label],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vErrs = validate(formData);
    if (Object.keys(vErrs).length) {
      setErrors(vErrs);
      const first = Object.values(vErrs)[0];
      toast.error(String(first));
      return;
    }

    try {
      setSubmitting(true);

      // normalized payload
      const placeData = {
        name: formData.name.trim(),
        code: formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        capacity: Number(formData.capacity),
        location: formData.location.trim(),
        type: formData.type.trim(),
        status: formData.status,
        price: Number(formData.price),
        distance: formData.distance.trim(), // keep as user-entered string (e.g., "50m")
        description: formData.description?.trim() || "",
        facilities: formData.facilities,
        coordinates: formData.latitude
          ? { latitude: parseFloat(formData.latitude) }
          : undefined,
      };

      const response = await axios.post("http://${API_BASE_URL}/api/zone", placeData);

      if (response?.data?.data) {
        OnCreated?.(response.data.data);
        toast.success("Parking zone created successfully");
        refresh?.();
        onClose();
      } else {
        throw new Error(response?.data?.error || "Failed to create parking zone");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || error.message || "Error creating parking zone");
    } finally {
      setSubmitting(false);
    }
  };

  const InputError = ({ msg }) =>
    msg ? <p className="mt-1 text-xs text-red-400">{msg}</p> : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl">
          <div className="px-6 pt-6">
            <h2 className="text-white font-bold text-xl">Add New Parking Zone</h2>
            <p className="text-gray-300 font-medium text-xs mb-4">
              Create a new parking zone for the event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            {/* Name + Location */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Zone Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handlechange}
                  type="text"
                  placeholder="Zone A - Main Parking"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  required
                  maxLength={60}
                  aria-invalid={!!errors.name}
                />
                <InputError msg={errors.name} />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Location *</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handlechange}
                  type="text"
                  placeholder="Main Entrance Area"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  required
                  aria-invalid={!!errors.location}
                />
                <InputError msg={errors.location} />
              </div>
            </div>

            {/* Capacity + Type */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Capacity *</label>
                <input
                  name="capacity"
                  value={formData.capacity}
                  onChange={handlechange}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="50"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  required
                  aria-invalid={!!errors.capacity}
                />
                <InputError msg={errors.capacity} />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Type *</label>
                <input
                  name="type"
                  value={formData.type}
                  onChange={handlechange}
                  type="text"
                  placeholder="Standard / VIP"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  required
                  maxLength={30}
                  aria-invalid={!!errors.type}
                />
                <InputError msg={errors.type} />
              </div>
            </div>

            {/* Status + Latitude */}
            <div className="mt-4 grid lg:grid-cols-2 items-end gap-6">
              <div className="w-[350px]">
                <label className="block text-white text-sm font-semibold">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handlechange}
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2"
                  required
                  aria-invalid={!!errors.status}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <InputError msg={errors.status} />
              </div>

              <div className="flex flex-col w-[350px]">
                <label className="block text-white text-sm font-semibold">Latitude (optional)</label>
                <input
                  name="latitude"
                  value={formData.latitude}
                  onChange={handlechange}
                  type="text"
                  inputMode="decimal"
                  placeholder="7.2906"
                  className="mt-1 text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  aria-invalid={!!errors.latitude}
                />
                <InputError msg={errors.latitude} />
              </div>
            </div>

            {/* Price + Distance */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-white text-sm font-semibold">Price (LKR) *</label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handlechange}
                  type="text"
                  inputMode="decimal"
                  placeholder="300"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  required
                  aria-invalid={!!errors.price}
                />
                <InputError msg={errors.price} />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold">Distance (optional)</label>
                <input
                  name="distance"
                  value={formData.distance}
                  onChange={handlechange}
                  type="text"
                  placeholder="50, 50m, or 0.3km"
                  className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                  aria-invalid={!!errors.distance}
                />
                <InputError msg={errors.distance} />
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-white text-sm font-semibold">Description (optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handlechange}
                rows="4"
                maxLength={400}
                placeholder="Provide a detailed description of the parking zone"
                className="mt-1 w-full text-white bg-[#272f40] border border-white/20 rounded-md p-2 placeholder:text-gray-500"
                aria-invalid={!!errors.description}
              />
              <div className="text-xs text-white/40 mt-1">
                {formData.description.length}/400
              </div>
              <InputError msg={errors.description} />
            </div>

            {/* Facilities */}
            <label className="block text-white mt-4 text-sm font-semibold">Features (optional)</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FACILITY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-gray-200 text-sm bg-white/5 border border-white/10 rounded-md p-2">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(opt)}
                    onChange={() => toggleFacility(opt)}
                    className="accent-blue-500"
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/5 rounded-md border border-white/10 px-4 py-2 text-white hover:bg-white/10"
                disabled={submitting}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md px-4 py-2 text-white font-semibold hover:opacity-80 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddForm;
