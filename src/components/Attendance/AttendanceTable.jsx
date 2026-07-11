"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiCalendar, FiArrowRight, FiArrowLeft, FiLogIn, FiLogOut } from 'react-icons/fi';

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leaves: 0 });
  const [leaves, setLeaves] = useState([]);
  const [admissionDate, setAdmissionDate] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('OUT');

  useEffect(() => {
    const parentToken = localStorage.getItem('parentToken');
    if (parentToken) {
      try {
        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        if (tokenPayload.studentId) setStudentId(tokenPayload.studentId);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const fetchLogs = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/studentauth/attendance-log/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (res.data && res.data.attendanceLog) {
        const sortedLogs = [...res.data.attendanceLog].sort((a, b) => 
          new Date(b.checkInDate) - new Date(a.checkInDate)
        );
        setLogs(sortedLogs);
        
        const latest = sortedLogs[0];
        if (latest && !latest.checkOutDate) {
          setCurrentStatus('IN');
        } else {
          setCurrentStatus('OUT');
        }
      }
    } catch (err) {
      console.error("Error fetching attendance logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    if (!studentId) return;
    try {
      const parentToken = localStorage.getItem('parentToken');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-management`,
        {
          params: { studentId },
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (res.data && res.data.leaveHistory) {
        setLeaves(res.data.leaveHistory);
      }
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const fetchProfile = async () => {
    if (!studentId) return;
    try {
      const parentToken = localStorage.getItem('parentToken');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-profile?studentId=${studentId}`,
        {
          headers: { Authorization: `Bearer ${parentToken}` }
        }
      );
      if (res.data && res.data.student) {
        const adDate = res.data.student.admissionDate || res.data.student.createdAt;
        if (adDate) {
          const d = new Date(adDate);
          d.setHours(0, 0, 0, 0);
          setAdmissionDate(d);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchLeaves();
    fetchProfile();
  }, [studentId]);

  useEffect(() => {
    if (!currentDate) return;
    let presentCount = 0;
    let absentCount = 0;
    
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const iterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      const dateStr = iterDate.toDateString();
      const marked = logs.some(log => new Date(log.checkInDate).toDateString() === dateStr);
      
      const onLeave = leaves.some(leave => {
        if (leave.status !== 'approved' && leave.status !== 'warden_approved') return false;
        const start = new Date(leave.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leave.endDate);
        end.setHours(23, 59, 59, 999);
        return iterDate >= start && iterDate <= end;
      });

      const isBeforeAdmission = admissionDate ? iterDate < admissionDate : false;
      const isAbsent = !marked && !onLeave && iterDate < now && !isBeforeAdmission;

      if (marked) {
        presentCount++;
      } else if (isAbsent) {
        absentCount++;
      }
    }

    setAttendanceStats({
      present: presentCount,
      absent: absentCount,
      leaves: 0
    });
  }, [currentDate, logs, leaves, admissionDate]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const hasAttendance = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = d.toDateString();
    return logs.some(log => new Date(log.checkInDate).toDateString() === dateStr);
  };

  const isOnLeave = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    return leaves.some(leave => {
      if (leave.status !== 'approved' && leave.status !== 'warden_approved') return false;
      const start = new Date(leave.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    });
  };

  return (
    <div className="bg-[#ffffff] px-6 sm:px-8 lg:px-2.5 py-2 min-h-screen font-sans w-full pb-10">
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black border-l-4 border-[#4F8CCF] pl-2">
            Attendance History
          </h2>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] w-full">
          <div className="bg-[#AAB491] px-6 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-black">Attendance Summary</h2>
          </div>
          <div className="p-7 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${currentStatus === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {currentStatus === 'IN' ? <FiLogIn size={32} /> : <FiLogOut size={32} />}
              </div>
              <div>
                <p className="text-base font-semibold text-black">
                  Status: <span className={currentStatus === 'IN' ? 'text-green-600' : 'text-orange-600'}>{currentStatus === 'IN' ? 'Checked IN' : 'Checked OUT'}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4 flex-wrap w-full md:w-auto justify-between sm:justify-end">
              <div className="bg-blue-50 px-3 sm:px-6 py-2 rounded-lg border border-blue-200 text-center flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px]">
                <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Present</p>
                <p className="text-lg sm:text-xl font-bold text-blue-700">{attendanceStats.present}</p>
              </div>
              <div className="bg-red-50 px-3 sm:px-6 py-2 rounded-lg border border-red-200 text-center flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px]">
                <p className="text-[10px] sm:text-xs font-semibold text-red-600 uppercase tracking-wider">Absent</p>
                <p className="text-lg sm:text-xl font-bold text-red-700">{attendanceStats.absent}</p>
              </div>
              <div className="bg-gray-50 px-3 sm:px-6 py-2 rounded-lg border border-gray-200 text-center flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px]">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-700">{attendanceStats.present + attendanceStats.absent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] w-full">
            <div className="bg-[#AAB491] px-6 py-3 rounded-t-lg flex justify-between items-center">
              <button onClick={prevMonth} className="text-black hover:bg-black/10 p-1 rounded transition-colors"><FiArrowLeft /></button>
              <h3 className="text-lg font-semibold text-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={nextMonth} className="text-black hover:bg-black/10 p-1 rounded transition-colors"><FiArrowRight /></button>
            </div>
            
            <div className="p-7">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-xs sm:text-sm font-semibold text-gray-600 p-1 sm:p-2">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="p-1 sm:p-2"></div>)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const iterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const marked = hasAttendance(day);
                  const onLeave = isOnLeave(day);
                  const isToday = iterDate.toDateString() === new Date().toDateString();
                  const isSelected = iterDate.toDateString() === selectedDate.toDateString();
                  
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const isBeforeAdmission = admissionDate ? iterDate < admissionDate : false;
                  const isAbsent = !marked && !onLeave && iterDate < now && !isBeforeAdmission;

                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(iterDate)}
                      className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all relative cursor-pointer ${
                        isSelected ? 'ring-2 ring-offset-2 ring-blue-500 ' : ''
                      }${
                        marked ? 'bg-blue-500 text-white' : 
                        onLeave ? 'bg-orange-500 text-white' :
                        isAbsent ? 'bg-red-500 text-white' :
                        isToday ? 'bg-gray-100 text-black border border-[#4F8CCF]' : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Present</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Absent</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Leave</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 border border-[#4F8CCF] rounded-full"></div> Today</div>
              </div>
            </div>
          </div>

          {/* History Section */}
          {(() => {
            const filteredLogs = logs.filter(log => new Date(log.checkInDate).toDateString() === selectedDate.toDateString());
            return (
              <div className="lg:col-span-2 bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] w-full flex flex-col">
                <div className="bg-[#AAB491] px-6 py-3 rounded-t-lg flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-black">Attendance Records</h3>
                  <div className="px-3 py-1 bg-white text-black rounded-lg text-sm font-semibold">{filteredLogs.length} Records</div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[500px] p-4 sm:p-7">
                  {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-4">
                      <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-sm font-semibold text-gray-600">Loading Logs...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="p-10 text-center">
                      <FiCalendar className="mx-auto text-4xl text-gray-300 mb-4" />
                      <p className="text-base font-semibold text-gray-500">No records found for {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredLogs.map((log, idx) => (
                        <div key={idx} className="py-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 group px-2 sm:px-4 rounded-lg">
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-gray-200 group-hover:bg-white transition-colors">
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-500">{new Date(log.checkInDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                              <span className="text-base sm:text-lg font-semibold text-black leading-none">{new Date(log.checkInDate).getDate()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-black">
                                <span className="flex items-center gap-1">
                                  <FiLogIn className="text-green-500" size={14} />
                                  {new Date(log.checkInDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                                {log.checkOutDate && (
                                  <>
                                    <span className="hidden sm:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1">
                                      <FiLogOut className="text-orange-500" size={14} />
                                      {new Date(log.checkOutDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`self-start sm:self-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold ${
                            log.checkOutDate ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {log.checkOutDate ? 'Completed' : 'Active'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}