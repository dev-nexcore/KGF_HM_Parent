"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin, CheckCircle, ArrowUpRight, ArrowDownLeft, Filter, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const statusStyles = {
  Present: "bg-green-50 text-green-600 border-green-100",
  "Day Trip": "bg-blue-50 text-blue-600 border-blue-100",
  "Extended Away": "bg-amber-50 text-amber-600 border-amber-100",
  "Currently Away": "bg-red-50 text-red-600 border-red-100",
  Out: "bg-red-50 text-red-600 border-red-100",
};

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    presentDays: 0,
    absentDays: 0,
    outings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/studentauth/attendance-log/${studentId}`,
          { headers: { Authorization: `Bearer ${parentToken}` } }
        );

        const attendanceLog = response.data?.attendanceLog || [];
        const result = processAttendanceData(attendanceLog);
        setAttendanceData(result.entries);
        setFilteredData(result.entries);
        setSummaryStats(result.summary);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  useEffect(() => {
    let result = attendanceData;

    if (searchTerm) {
      result = result.filter(entry => 
        entry.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.direction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMonth !== "all") {
      result = result.filter(entry => {
        const entryMonth = new Date(entry.originalTimestamp).getMonth().toString();
        return entryMonth === filterMonth;
      });
    }

    setFilteredData(result);
  }, [searchTerm, filterMonth, attendanceData]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Attendance History Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ["Date", "Time", "Direction", "Status"];
    const tableRows = filteredData.map(entry => [
      entry.date,
      entry.time,
      `Check ${entry.direction}`,
      entry.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [122, 139, 94] },
    });

    doc.save(`Attendance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Time", "Direction", "Status"];
    const rows = filteredData.map(entry => [
      entry.date,
      entry.time,
      entry.direction,
      entry.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processAttendanceData = (attendanceLog) => {
    const processedData = [];
    const uniquePresentDays = new Set();
    let absentDays = 0;
    let outings = 0;
    
    attendanceLog.forEach((entry) => {
      if (entry.checkInDate) {
        const checkInTime = new Date(entry.checkInDate);
        uniquePresentDays.add(checkInTime.toDateString());
        processedData.push({
          date: checkInTime.toLocaleDateString('en-GB'),
          time: checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          direction: 'IN',
          status: 'Present',
          originalTimestamp: checkInTime
        });
      }
      if (entry.checkOutDate) {
        const checkOutTime = new Date(entry.checkOutDate);
        outings++;
        processedData.push({
          date: checkOutTime.toLocaleDateString('en-GB'),
          time: checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          direction: 'OUT',
          status: 'Out',
          originalTimestamp: checkOutTime
        });
      }
    });
    
    processedData.sort((a, b) => b.originalTimestamp - a.originalTimestamp);
    
    return {
      entries: processedData,
      summary: { presentDays: uniquePresentDays.size, absentDays, outings }
    };
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7A8B5E] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
          <h2 className="text-2xl font-black text-[#1A1F16]">Attendance Activity</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E]" size={14} />
            <input 
              type="text"
              placeholder="Search date, type..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 focus:border-[#7A8B5E] outline-none text-xs font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 text-xs font-black uppercase tracking-widest text-[#7A8B5E] outline-none"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
              <option key={i} value={i.toString()}>{m}</option>
            ))}
          </select>
          <button 
            onClick={exportToPDF}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#7A8B5E] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] transition-all"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Present Days" value={summaryStats.presentDays} icon={<CheckCircle size={24}/>} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Total Outings" value={summaryStats.outings} icon={<ArrowUpRight size={24}/>} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard label="Overall Status" value="Active" icon={<MapPin size={24}/>} color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#7A8B5E]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAF5]/50 border-b border-[#7A8B5E]/5">
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Verification</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7A8B5E]/5">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-[#F8FAF5]/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#7A8B5E]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1A1F16]">{row.date}</p>
                        <p className="text-[10px] font-bold text-[#6B7280] flex items-center gap-1 uppercase">
                          <Clock size={10} /> {row.time}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${row.direction === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>
                      {row.direction === 'IN' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                      Check {row.direction}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-tighter">Biometric / Selfie</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-black text-[#7A8B5E] hover:underline uppercase tracking-widest">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#7A8B5E]/5 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color} mt-1`}>{value}</p>
      </div>
    </div>
  );
}