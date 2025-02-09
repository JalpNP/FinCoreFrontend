import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.scss";

const Dashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [coaType, setCoaType] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/companies");
        const companiesData = await response.json();
        setCompanies(companiesData);
      } catch (error) {
        setError("Failed to fetch companies");
      }
    };
    fetchCompanies();
  }, []);

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleCreateCompany = async () => {
    if (!companyName || !logoFile || !coaType) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", companyName);
    formData.append("coa_type", coaType);
    formData.append("logo", logoFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/companies", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setCompanies((prev) => [...prev, result]);
        setCompanyName("");
        setCoaType("");
        setLogoFile(null);
        setError("");
        setShowCreateForm(false);
      } else {
        setError(result.detail || "Company creation failed");
      }
    } catch (error) {
      setError("Failed to create company");
    }
  };

  const handleGoToCompany = () => {
    if (selectedCompany) {
      const company = companies.find((c) => c._id === selectedCompany);
      navigate(`/dashboard/${company.name}`);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="company-selection">
        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        <button onClick={handleGoToCompany} disabled={!selectedCompany}>
          GO
        </button>
        <button className="create-company-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "Create Company"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-company">
          <h3>Add New Company</h3>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <select value={coaType} onChange={(e) => setCoaType(e.target.value)}>
            <option value="">Select COA Type</option>
            <option value="normal">Normal</option>
            <option value="subsidiary">Subsidiary</option>
          </select>
          <button onClick={handleCreateCompany}>Create Company</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;