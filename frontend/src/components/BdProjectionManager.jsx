import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Building2,
  X,
  Check,
  ChevronDown,
  FileText,
  Edit2,
  Trash2,
  Search,
  DollarSign,
  Loader2,
} from "lucide-react";
import { getClientNames, createBdProjection, getAllBdProjection } from "../services/api"; // Added getAllBdProjection

const DEMO_PROJECTIONS = []; // Changed to empty array as we'll fetch real data

function formatAmount(num) {
  if (num === null || num === undefined) return "0";
  const number = parseFloat(num);
  if (isNaN(number)) return "0";
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e5, symbol: "L" },
    { value: 1e7, symbol: "Cr" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (number >= si[i].value) break;
  }
  return (number / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

// New helper function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(/, /g, ', ');
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return "Invalid Date";
  }
}

const generateMonthOptions = () => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const options = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
    });
  }
  return options.reverse();
};

const MONTH_OPTIONS = generateMonthOptions();

const Dropdown = ({ options, selected, onSelect, label, icon: Icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(
    (option) => option?.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selected);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-600 block mb-1.5">{label}</label>
      <button
        type="button"
        className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm font-medium flex items-center justify-between group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
          <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
            {displayValue}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden border border-gray-100">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = selected === option.value;
              return (
                <li
                  key={option.value}
                  className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    isSelected ? "bg-blue-50 text-blue-800 font-medium" : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </li>
              );
            })}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 italic text-center">
                No matches found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const AddProjectionModal = ({ isOpen, onClose, onAdd, clients }) => {
  const [formData, setFormData] = useState({
    CUSTACCCODE: "",
    PROJVAL: "",
    REMARKS: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.CUSTACCCODE || !formData.PROJVAL) {
      alert("Please select a client and enter a projection value.");
      return;
    }

    setIsLoading(true);

    try {
      const apiPayload = {
        codecd: "004",
        custacccode: formData.CUSTACCCODE,
        projval: parseInt(formData.PROJVAL),
        remarks: formData.REMARKS || "",
      };

      await createBdProjection(apiPayload); 

      const client = clients.find((c) => c.custacccode === formData.CUSTACCCODE);
      const tempProjection = {
        CUSTACCCODE: formData.CUSTACCCODE,
        PROJVAL: formData.PROJVAL,
        REMARKS: formData.REMARKS,
        CODECD: apiPayload.codecd,
        ProjDate: `${new Date()}`,
        ClientName: client?.clientName || "",
      };

      onAdd(tempProjection);

      setFormData({ CUSTACCCODE: "", PROJVAL: "", REMARKS: "" });
      onClose();
    } catch (error) {
      console.error("Failed to add projection:", error);
      alert(`Failed to add projection. Please try again. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const normalizedClients = clients.map((c) => ({
    value: c.custacccode,
    label: c.clientName,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Projection</h2>
              <p className="text-blue-100 text-sm">Enter projection details for the month</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          <Dropdown
            options={normalizedClients}
            selected={formData.CUSTACCCODE}
            onSelect={(value) => setFormData({ ...formData, CUSTACCCODE: value })}
            label="Select Client"
            icon={Building2}
            placeholder="Choose a client"
          />

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Projection Value (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                type="number"
                value={formData.PROJVAL}
                onChange={(e) => setFormData({ ...formData, PROJVAL: e.target.value })}
                placeholder="Enter projection value"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Remarks (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
              <textarea
                value={formData.REMARKS}
                onChange={(e) => setFormData({ ...formData, REMARKS: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Adding..." : "Add Projection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectionCard = ({ projection, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{projection.ClientName}</h3>
            {/* UPDATED: Show formatted Projection Date instead of CUSTACCCODE */}
            <p className="text-[11px] text-gray-500">Date: {formatDate(projection.ProjDate)}</p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(projection)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(projection.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <span className="text-xs font-medium text-gray-600">Projected Value</span>
          <span className="text-lg font-bold text-green-700 flex items-center gap-1">₹{formatAmount(projection.ProjVal)}</span>
        </div>
        {projection.REMARKS && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Remarks:</p>
            <p className="text-sm text-gray-700">{projection.REMARKS}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function BDProjectionManager() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projections, setProjections] = useState(DEMO_PROJECTIONS);
  const [clientOptions, setClientOptions] = useState([]);
  const [isLoadingProjections, setIsLoadingProjections] = useState(false); // New state for loading

  const filteredProjections = useMemo(() => {
    // Projections are now filtered by the API call, so we just use the state
    return projections;
  }, [projections]);

  const monthStats = useMemo(() => {
    const total = filteredProjections.reduce((sum, proj) => sum + parseFloat(proj.ProjVal), 0);
    const count = filteredProjections.length;
    const avgPerClient = count > 0 ? total / count : 0;
    return { total, count, avgPerClient };
  }, [filteredProjections]);

  // Helper function to calculate date range
  const calculateMonthDateRange = (monthValue) => {
    const [year, month] = monthValue.split("-").map(Number);
    // fromDate: 1st day of the selected month
    const fromDate = new Date(year, month - 1, 1); 
    // toDate: Last day of the selected month (day 0 of the next month)
    const toDate = new Date(year, month, 0); 
    
    // Format to ISO string for API, ensuring full day range
    const fromDateISO = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toISOString();
    const toDateISO = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999).toISOString();
    
    return { fromDate: fromDateISO, toDate: toDateISO };
  };

  const fetchProjections = async (monthValue) => {
    setIsLoadingProjections(true);
    try {
      const { fromDate, toDate } = calculateMonthDateRange(monthValue);

      const payload = {
        codecd: "004", // Assuming a static BD code for fetching
        fromDate,
        toDate,
      };

      const data = await getAllBdProjection(payload);

      // The API response uses 'projDate' (lowercase 'd') and 'projVal'
      const normalizedData = data.map(p => ({
        id: p.id,
        CODECD: p.codecd,
        CUSTACCCODE: p.custacccode,
        // API response uses lowercase 'projDate' which we map to uppercase 'ProjDate' for existing logic
        ProjDate: p.projDate, 
        // API response uses lowercase 'projVal' which we map to uppercase 'ProjVal' for existing logic
        ProjVal: p.projVal, 
        BDName: p.bdName,
        ClientName: p.clientName,
        REMARKS: p.remarks,
      }));

      setProjections(normalizedData);
    } catch (e) {
      console.error("Failed to fetch BD projections", e);
      setProjections([]);
    } finally {
      setIsLoadingProjections(false);
    }
  };

  const handleAddProjection = (newProjection) => {
    // Temporary logic to add new projection to the list after successful API call
    // A full re-fetch after add would be better in production, but this keeps local state update logic.

    const client = clientOptions.find((c) => c.custacccode === newProjection.CUSTACCCODE);
    const projection = {
      // Use clientName from tempProjection if clientOptions fails to find one
      id: Math.max(...projections.map((p) => p.id), 0) + 1,
      CODECD: newProjection.CODECD,
      CUSTACCCODE: newProjection.CUSTACCCODE,
      ProjDate: newProjection.ProjDate, 
      ProjVal: newProjection.PROJVAL.toString(),
      BDName: "Rajesh Kumar", // Hardcoded BD name for temporary local add
      ClientName: client?.clientName || newProjection.ClientName || "",
      REMARKS: newProjection.REMARKS || null,
    };
    // Only add to list if it belongs to the currently selected month for immediate display
    const projDate = new Date(projection.ProjDate);
    const projMonth = `${projDate.getFullYear()}-${String(projDate.getMonth() + 1).padStart(2, "0")}`;
    if (projMonth === selectedMonth) {
      setProjections([...projections, projection]);
    }
  };

  const handleDeleteProjection = (id) => {
    alert("Delete functionality will be implemented in backend integration");
    //if (window.confirm("Are you sure you want to delete this projection?")) {
    //// In a real application, you'd call a DELETE API here.
    //   setProjections(projections.filter((p) => p.id !== id));
    //}
  };

  const handleEditProjection = (projection) => {
    alert("Edit functionality will be implemented in backend integration");
  };

  // Effect to fetch client names on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const options = await getClientNames();
        setClientOptions(Array.isArray(options) ? options : []);
      } catch (e) {
        console.error("Failed to fetch Client names", e);
        setClientOptions([]);
      }
    };
    fetchClients();
  }, []);

  // Effect to fetch projections whenever selectedMonth changes
  useEffect(() => {
    fetchProjections(selectedMonth);
  }, [selectedMonth]);


  return (
    <div className="font-sans min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8 bg-white border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-95"></div>
          <div className="relative p-6 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">BD Projection Management</h1>
                <p className="text-blue-100 text-sm mt-1">Track and manage monthly business projections</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium uppercase text-gray-500">
                Total Projection
              </span>
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 flex items-center gap-1">
              {isLoadingProjections ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : `₹${formatAmount(monthStats.total)}`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium uppercase text-gray-500">
                Total Clients
              </span>
              <div className="p-2 rounded-lg bg-green-100">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {isLoadingProjections ? <Loader2 className="w-6 h-6 animate-spin text-green-500" /> : monthStats.count}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-cyan-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium uppercase text-gray-500">
                Avg Per Client
              </span>
              <div className="p-2 rounded-lg bg-cyan-100">
                <DollarSign className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {isLoadingProjections ? <Loader2 className="w-6 h-6 animate-spin text-cyan-500" /> : `₹${formatAmount(monthStats.avgPerClient)}`}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 justify-between">
            <div className="w-full sm:w-64">
              <Dropdown
                options={MONTH_OPTIONS}
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                label="Select Month"
                icon={Calendar}
                placeholder="Choose month"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Projection
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Monthly Projections ({filteredProjections.length})
            </h2>
          </div>

          {isLoadingProjections ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <span className="text-xl font-medium text-gray-600">
                Fetching Projections...
              </span>
            </div>
          ) : filteredProjections.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4 rounded-full bg-gray-100 mb-4">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <span className="text-xl font-medium text-gray-600">
                No Projections Found
              </span>
              <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
                No projections added for this month yet. Click Add Projection to
                create one.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjections.map((projection) => (
                <ProjectionCard
                  key={projection.id}
                  projection={projection}
                  onEdit={handleEditProjection}
                  onDelete={handleDeleteProjection}
                />
              ))}
            </div>
          )}
        </div>

        <AddProjectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddProjection}
          clients={clientOptions}
        />

      </div>
    </div>
  );
}