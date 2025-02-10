import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CompanyDashboard.scss";

const CompanyDashboard = () => {
  const { company_name } = useParams();
  const [financialYears, setFinancialYears] = useState([]);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isStartDateEditable, setIsStartDateEditable] = useState(true);

  const fetchFinancialYears = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/auth/financial-years/${company_name}`);
      setFinancialYears(response.data);

      if (response.data.length > 0) {
        const lastEndDate = new Date(response.data[response.data.length - 1].end_of_year);
        lastEndDate.setDate(lastEndDate.getDate() + 1);
        setNewStartDate(lastEndDate.toISOString().split("T")[0]);
        setIsStartDateEditable(false);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  }, [company_name]);

  useEffect(() => {
    fetchFinancialYears();
  }, [fetchFinancialYears]);

  const handleAddFinancialYear = async () => {
    if (!newStartDate || !newEndDate) return;

    const startDate = new Date(newStartDate);
    const endDate = new Date(newEndDate);
    if (endDate <= startDate) {
      alert("End date must be after start date.");
      return;
    }

    const yearNo = financialYears.length + 1;
    let fy =
      startDate.getFullYear() === endDate.getFullYear()
        ? startDate.getFullYear().toString()
        : `${startDate.getFullYear().toString().slice(-2)}-${endDate.getFullYear().toString().slice(-2)}`;

    const newFinancialYear = {
      company_name,
      year_no: yearNo,
      start_of_year: newStartDate,
      end_of_year: newEndDate,
      fy,
    };

    try {
      await axios.post("http://localhost:8000/api/auth/financial-years", newFinancialYear);
      setFinancialYears([...financialYears, newFinancialYear]);

      const nextStartDate = new Date(newEndDate);
      nextStartDate.setDate(nextStartDate.getDate() + 1);
      setNewStartDate(nextStartDate.toISOString().split("T")[0]);
      setNewEndDate("");
      setIsStartDateEditable(false);
    } catch (error) {
      console.error("Error adding financial year:", error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Welcome to {company_name}'s Dashboard</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Form" : "Add Financial Year"}
      </button>
      {showForm && (
        <div className="form">
          <input
            type="date"
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
            readOnly={!isStartDateEditable}
          />
          <input
            type="date"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
          />
          <button onClick={handleAddFinancialYear}>Go!</button>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Year No</th>
              <th>Start of Year</th>
              <th>End of Year</th>
              <th>FY</th>
            </tr>
          </thead>
          <tbody>
            {financialYears.map((year) => (
              <tr key={year.year_no}>
                <td>{year.year_no}</td>
                <td>{new Date(year.start_of_year).toLocaleDateString("en-GB")}</td>
                <td>{new Date(year.end_of_year).toLocaleDateString("en-GB")}</td>
                <td>{year.fy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyDashboard;