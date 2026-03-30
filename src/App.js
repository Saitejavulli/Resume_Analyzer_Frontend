import React, { useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://resume-analyzer-backend-1-3uka.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please upload only PDF resume files.");
      return;
    }

    setFile(selectedFile);
    setMessage(`Selected file: ${selectedFile.name}`);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const onInputFileChange = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setMessage("Please choose a resume file first.");
        return;
      }

      setUploading(true);
      setMessage("Uploading resume...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API}/api/resumes/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResumeId(response.data.id);
      setMessage("Resume uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Check backend server and try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      if (!resumeId) {
        setMessage("Please upload the resume first.");
        return;
      }

      if (!jobDescription.trim()) {
        setMessage("Please paste a job description.");
        return;
      }

      setAnalyzing(true);
      setMessage("Analyzing resume...");

      const response = await axios.post(
        `${API}/api/analysis`,
        {
          resumeId,
          jobDescription,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResult(response.data);
      setMessage("Analysis completed successfully.");
    } catch (error) {
      console.error("Analysis error:", error);
      setMessage("Analysis failed. Check backend logs and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return "High Match";
    if (score >= 40) return "Medium Match";
    return "Low Match";
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "score-badge high";
    if (score >= 40) return "score-badge medium";
    return "score-badge low";
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-text">Resume Analyzer</div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <h1>Resume Analyzer</h1>
          <p>Optimize Your Resume for Your Dream Job</p>
        </section>

        <section className="card">
          <h2>1. Upload Your Resume:</h2>
          <div
            className={`upload-box ${dragActive ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>Drag &amp; drop your resume here or</p>

            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={onInputFileChange}
              hidden
            />

            <button className="primary-btn" onClick={handleBrowseClick}>
              Browse File
            </button>

            {file && <div className="file-name">Selected: {file.name}</div>}

            <button
              className="primary-btn upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </section>

        <section className="card">
          <h2>2. Paste Job Description:</h2>
          <textarea
            className="job-textarea"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="center-btn">
            <button
              className="primary-btn analyze-btn"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Results:</h2>

          {message && <div className="status-message">{message}</div>}

          <div className="results-grid">
            <div className="result-card">
              <h3>Match Score</h3>
              <div className="score-value">
                {result ? `${result.matchScore.toFixed(0)}%` : "0%"}
              </div>
              <div className={result ? getScoreClass(result.matchScore) : "score-badge low"}>
                {result ? getScoreLabel(result.matchScore) : "No Analysis"}
              </div>
            </div>

            <div className="result-card">
              <h3>Matched Skills</h3>
              {result && result.matchedSkills.length > 0 ? (
                <ul>
                  {result.matchedSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="placeholder-text">No matched skills yet.</p>
              )}
            </div>

            <div className="result-card">
              <h3>Missing Skills</h3>
              {result && result.missingSkills.length > 0 ? (
                <ul>
                  {result.missingSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="placeholder-text">No missing skills yet.</p>
              )}
            </div>

            <div className="result-card">
              <h3>Suggestions</h3>
              {result ? (
                <p className="suggestion-text">{result.suggestions}</p>
              ) : (
                <p className="placeholder-text">
                  Suggestions will appear here after analysis.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;