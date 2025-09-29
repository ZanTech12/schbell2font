import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // for styling
import { FaWhatsapp } from "react-icons/fa";

const API = "https://schbell2-1.onrender.com"; // backend server URL

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      onLogin(res.data.token);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Admin Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function Periods({ token, onLogout }) {
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState({
    name: "",
    startTime: "08:00",
    durationSec: 300,
    position: 1,
  });
  const [time, setTime] = useState(new Date());

  const headers = { Authorization: `Bearer ${token}` };

  async function loadPeriods() {
    try {
      const res = await axios.get(`${API}/periods`, { headers });
      setPeriods(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadPeriods();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  async function addPeriod(e) {
    e.preventDefault();
    try {
      await axios.post(`${API}/periods`, form, { headers });
      setForm({ name: "", startTime: "08:00", durationSec: 300, position: 1 });
      loadPeriods();
    } catch (err) {
      alert("Error adding period");
    }
  }

  async function deletePeriod(id) {
    if (!window.confirm("Delete this period?")) return;
    await axios.delete(`${API}/periods/${id}`, { headers });
    loadPeriods();
  }

  async function ringNow(sec) {
    await axios.post(
      `${API}/ring`,
      { durationMs: sec * 1000 },
      { headers }
    );
    alert("Bell command sent!");
  }

  return (
    <div className="container mt-4">
      {/* Header row with clock */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="glow-text">School Bell Periods</h2>
          <small className="text-muted">
            Live Time:{" "}
            <strong>{time.toLocaleTimeString()}</strong>
          </small>
        </div>
        <button className="btn btn-outline-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Period List */}
      <ul className="list-group mb-4">
        {periods.map((p) => (
          <li
            key={p._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {p.position}. <strong>{p.name}</strong> — {p.startTime} ({p.durationSec}s)
            </span>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deletePeriod(p._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Add Period Form */}
      <div className="card p-3 mb-4">
        <h4>Add Period</h4>
        <form onSubmit={addPeriod} className="row g-2">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="time"
              className="form-control"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Duration (s)"
              value={form.durationSec}
              onChange={(e) => setForm({ ...form, durationSec: +e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: +e.target.value })}
              required
            />
          </div>
          <div className="col-md-1 d-grid">
            <button type="submit" className="btn btn-success">
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Manual Control */}
      <div className="card p-3 mb-5">
        <h4>Manual Control</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => ringNow(3)}>
            Ring for 3s
          </button>
          <button className="btn btn-primary" onClick={() => ringNow(10)}>
            Ring for 10s
          </button>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2348104654863"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        <FaWhatsapp />
      </a>
      {/* Footer with production date */}
      <footer
        className="footer text-center mt-5 mb-3"
        style={{ color: "red" }}
      >
        <small>
          <strong>
            <a
              href="https://denotech-two.vercel.app/"
              style={{ color: "yellow", textDecoration: "none" }}
            >
              Deno Technology Limited (c) 2025
            </a>
          </strong>
          : {new Date().toLocaleDateString()}
        </small>
      </footer>

    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function handleLogin(t) {
    localStorage.setItem("token", t);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <div>
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Periods token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}
