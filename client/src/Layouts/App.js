import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import api from "../api/axios";

const COURSE_OPTIONS = [
  { label: "22HS002 – StartUp", value: "22HS002" },
  { label: "22HS002 – StartUp (Viva)", value: "22HS002VV" },
];

export default function FindExam() {
  const [regno, setRegno] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await api.post("/api/find", {
        regno,
        course_code: courseCode,
      });
      setData(res.data);
    } catch {
      setError("No data found. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          📘 Exam Hall Finder
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-4 space-y-4"
        >
          <input
            type="text"
            placeholder="Register Number"
            value={regno}
            onChange={(e) =>
            setRegno(
            e.target.value.replace(/\s+/g, "").toUpperCase())
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required/>
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Course Code</option>
            {COURSE_OPTIONS.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold active:scale-95 transition"
          >
            {loading ? "Finding..." : "Find Details"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        {/* Result */}
        {data && (
          <div className="mt-6 bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold text-center">
              {data.type === "exam" ? " Exam Details" : " Viva Details"}
            </h2>

            <Info label="Date" value={data.exam_info.exam_date} />
            <Info label="Session" value={data.exam_info.exam_session} />
            <Info label="Time" value={data.exam_info.exam_time} />

            {data.type === "exam" && (
              <>
                <Info label="Exam Hall" value={data.exam_hall} />
              </>
            )}

            {data.type === "viva" && (
              <>
                <Info label="Course Name" value={data.exam_info.course_name} />
                <Info label="Panel" value={data.panel} />
                <Info label="Venue" value={data.venue} />
              </>
            )}
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}