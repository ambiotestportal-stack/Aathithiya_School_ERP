"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Camera } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function GatePassPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPass, setCurrentPass] = useState<any>(null);

  // Form State
  const [passType, setPassType] = useState('student');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhar Card');
  const [contactNumber, setContactNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [reason, setReason] = useState('');
  const [idReference, setIdReference] = useState('');
  const [date, setDate] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [status, setStatus] = useState('issued');

  // Camera State & Refs
  const [isCapturingProof, setIsCapturingProof] = useState(false);
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);

  const proofVideoRef = useRef<HTMLVideoElement>(null);
  const faceVideoRef = useRef<HTMLVideoElement>(null);
  const proofCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [passesRes, classesRes, studentsRes] = await Promise.all([
        api.get('/api/gatepass'),
        api.get('/api/academic/classes'),
        api.get('/api/students')
      ]);
      setPasses(passesRes.data);
      setClassesList(classesRes.data);
      setStudentsList(studentsRes.data.data || studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch gate pass data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueYears = Array.from(new Set(classesList.map(c => c.batch?.name).filter(Boolean)));
  const filteredClasses = classesList.filter(c => c.batch?.name === selectedYear);
  const uniqueClassNames = Array.from(new Set(filteredClasses.map(c => c.name)));
  const filteredSections = filteredClasses.filter(c => c.name === selectedClass).map(c => c.section);
  
  // The student backend populate has enrolledClass with batch? We may just filter by enrolledClass._id
  // but we can also just match name and section
  const filteredStudents = studentsList.filter(s => 
    s.enrolledClass?.name === selectedClass && 
    s.enrolledClass?.section === selectedSection
  );

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentObjId = e.target.value;
    const student = studentsList.find(s => s._id === studentObjId);
    if (student) {
      setPersonName(student.user?.name || '');
      setStudentId(student.admissionNumber || '');
      setContactNumber(student.contactNumber || '');
    } else {
      setPersonName('');
      setStudentId('');
      setContactNumber('');
    }
  };

  const handleAddNew = () => {
    setCurrentPass(null);
    setPassType('visitor');
    setPersonName('');
    setRelationship('');
    setIdProofType('Aadhar Card');
    setContactNumber('');
    setStudentId('');
    setStudentClass('');
    setStudentSection('');
    setReason('');
    
    // Format current time as HH:MM
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    setIdReference('');
    setDate(now.toISOString().split('T')[0]);
    setTimeOut(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setTimeIn('');
    setStatus('issued');
    setProofPhoto(null);
    setFacePhoto(null);
    setIsEditing(true);
  };

  const handleEdit = (pass: any) => {
    setCurrentPass(pass);
    
    // Try to pre-fill the cascading dropdowns based on studentId (admissionNumber)
    const student = studentsList.find(s => s.admissionNumber === pass.studentId);
    if (student) {
      setSelectedYear(student.enrolledClass?.batch?.name || '');
      setSelectedClass(student.enrolledClass?.name || pass.studentClass || '');
      setSelectedSection(student.enrolledClass?.section || pass.studentSection || '');
    } else {
      setSelectedYear('');
      setSelectedClass(pass.studentClass || '');
      setSelectedSection(pass.studentSection || '');
    }
    
    setPassType('student');
    setPersonName(pass.personName);
    setRelationship(pass.relationship || '');
    setIdProofType(pass.idProofType || 'Aadhar Card');
    setContactNumber(pass.contactNumber || '');
    setStudentId(pass.studentId || '');
    setStudentClass(pass.studentClass || '');
    setStudentSection(pass.studentSection || '');
    setReason(pass.reason);
    setIdReference(pass.idReference || '');
    setDate(pass.date);
    setTimeOut(pass.timeOut);
    setTimeIn(pass.timeIn || '');
    setStatus(pass.status);
    setProofPhoto(pass.proofPhoto || null);
    setFacePhoto(pass.personPhoto || null);
    setIsEditing(true);
  };

  const startCamera = async (type: 'proof' | 'face') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (type === 'proof') {
        setIsCapturingProof(true);
        setProofPhoto(null);
        // We need a slight delay for the video element to be rendered
        setTimeout(() => {
          if (proofVideoRef.current) {
            proofVideoRef.current.srcObject = stream;
          }
        }, 100);
      } else {
        setIsCapturingFace(true);
        setFacePhoto(null);
        setTimeout(() => {
          if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = stream;
          }
        }, 100);
      }
    } catch (err) {
      toast.error('Unable to access camera. Please allow permissions.');
      console.error(err);
    }
  };

  const stopCamera = (type: 'proof' | 'face') => {
    const videoRef = type === 'proof' ? proofVideoRef : faceVideoRef;
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (type === 'proof') setIsCapturingProof(false);
    else setIsCapturingFace(false);
  };

  const takeSnap = (type: 'proof' | 'face') => {
    const videoRef = type === 'proof' ? proofVideoRef : faceVideoRef;
    const canvasRef = type === 'proof' ? proofCanvasRef : faceCanvasRef;
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (type === 'proof') {
          setProofPhoto(dataUrl);
        } else {
          setFacePhoto(dataUrl);
        }
        stopCamera(type);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gate pass?')) return;
    try {
      await api.delete(`/api/gatepass/${id}`);
      toast.success('Gate pass deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete gate pass');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      passType: 'student', 
      personName, 
      relationship, 
      idProofType, 
      contactNumber, 
      studentId, 
      studentClass, 
      studentSection, 
      reason, 
      idReference, 
      date, 
      timeOut, 
      timeIn, 
      status,
      proofPhoto,
      personPhoto: facePhoto
    };
    
    try {
      if (currentPass) {
        await api.put(`/api/gatepass/${currentPass._id}`, payload);
        toast.success('Gate pass updated successfully');
      } else {
        await api.post('/api/gatepass', payload);
        toast.success('Gate pass added successfully');
      }
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save gate pass');
    }
  };

  const handleMarkReturned = async (id: string) => {
    try {
      const now = new Date();
      const timeInStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      await api.put(`/api/gatepass/${id}`, { status: 'returned', timeIn: timeInStr });
      toast.success('Marked as returned');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {currentPass ? 'Edit Gate Pass' : 'New Gate Pass'}
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-[#9352F3] px-6 py-4">
            <h2 className="text-white font-semibold">
              {currentPass ? 'Edit Pass Details' : 'Generate New Pass'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Academic Year</label>
                <select 
                  value={selectedYear}
                  onChange={e => { setSelectedYear(e.target.value); setSelectedClass(''); setSelectedSection(''); setPersonName(''); }}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select Year</option>
                  {uniqueYears.map((year: any) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Class</label>
                <select 
                  value={selectedClass}
                  onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setPersonName(''); setStudentClass(e.target.value); }}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                  required
                  disabled={!selectedYear}
                >
                  <option value="">Select Class</option>
                  {uniqueClassNames.map((cName: any) => <option key={cName} value={cName}>{cName}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Section</label>
                <select 
                  value={selectedSection}
                  onChange={e => { setSelectedSection(e.target.value); setPersonName(''); setStudentSection(e.target.value); }}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                  required
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {filteredSections.map((sec: any) => <option key={sec} value={sec}>{sec}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Student</label>
                <select 
                  value={studentsList.find(s => s.admissionNumber === studentId)?._id || ''}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                  required
                  disabled={!selectedSection}
                >
                  <option value="">Select Student</option>
                  {filteredStudents.map((student: any) => (
                    <option key={student._id} value={student._id}>
                      {student.user?.name} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">ID Proof Type</label>
                <select
                  value={idProofType}
                  onChange={e => setIdProofType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">ID Proof Number</label>
                <input 
                  type="text" 
                  value={idReference}
                  onChange={e => setIdReference(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  placeholder="e.g. 1234 5678 9012"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Contact Number</label>
                <input 
                  type="text" 
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Relationship / Role</label>
                <input 
                  type="text" 
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  placeholder="e.g. Father, Vendor, Plumber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Time Out</label>
                <input 
                  type="time" 
                  value={timeOut}
                  onChange={e => setTimeOut(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Time In (Optional)</label>
                <input 
                  type="time" 
                  value={timeIn}
                  onChange={e => setTimeIn(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="issued">Issued / Out</option>
                  <option value="returned">Returned / In</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Reason / Purpose</label>
              <textarea 
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-purple-500" 
                placeholder="e.g. Half day leave, Coming late, Doctor appointment, Going home early..."
                required 
              />
            </div>

            <div className="mt-8">
              <label className="block text-base font-bold text-slate-800 mb-4">Add Photo :</label>
              <div className="flex flex-wrap gap-8">
                
                {/* Proof Photo */}
                <div className="border rounded-xl p-6 bg-slate-50 flex-1 min-w-[280px] max-w-sm shadow-sm text-center">
                  <p className="text-sm font-medium text-slate-600 mb-6 text-left">Set up ID Proof Capture</p>
                  <div className="w-48 h-32 mx-auto bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 overflow-hidden relative">
                    {proofPhoto ? (
                      <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                    ) : isCapturingProof ? (
                      <video ref={proofVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-10 h-10 text-slate-400" />
                    )}
                    <canvas ref={proofCanvasRef} className="hidden" />
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    {!isCapturingProof && !proofPhoto && (
                      <button type="button" onClick={() => startCamera('proof')} className="px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Start Capturing</button>
                    )}
                    {isCapturingProof && (
                      <button type="button" onClick={() => takeSnap('proof')} className="px-3 py-1.5 bg-[#9352F3] text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-colors">Take Snap</button>
                    )}
                    {proofPhoto && (
                      <button type="button" onClick={() => setProofPhoto(null)} className="px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Retake</button>
                    )}
                  </div>
                </div>

                {/* Person Photo */}
                <div className="border rounded-xl p-6 bg-slate-50 flex-1 min-w-[280px] max-w-sm shadow-sm text-center">
                  <p className="text-sm font-medium text-slate-600 mb-6 text-left">Set up Face Capture</p>
                  <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 overflow-hidden relative">
                    {facePhoto ? (
                      <img src={facePhoto} alt="Face" className="w-full h-full object-cover" />
                    ) : isCapturingFace ? (
                      <video ref={faceVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-12 h-12 text-slate-400" />
                    )}
                    <canvas ref={faceCanvasRef} className="hidden" />
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    {!isCapturingFace && !facePhoto && (
                      <button type="button" onClick={() => startCamera('face')} className="px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Start Capturing</button>
                    )}
                    {isCapturingFace && (
                      <button type="button" onClick={() => takeSnap('face')} className="px-3 py-1.5 bg-[#9352F3] text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-colors">Take Snap</button>
                    )}
                    {facePhoto && (
                      <button type="button" onClick={() => setFacePhoto(null)} className="px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Retake</button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#9352F3] text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                {currentPass ? 'Update Pass' : 'Issue Pass'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gate Pass Management</h1>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#9352F3] text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Gate Pass
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-[#9352F3] px-6 py-4">
          <h2 className="text-white font-semibold">Active & Recent Passes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#9352F3] text-white border-t border-purple-400">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">DATE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">TYPE</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">PERSON NAME</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">REASON</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-center">TIME OUT</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-center">TIME IN</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase text-center">STATUS</th>
                <th className="px-6 py-3 font-semibold text-xs tracking-wider uppercase">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Loading gate passes...
                  </td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No gate passes issued.
                  </td>
                </tr>
              ) : (
                passes.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">{pass.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold capitalize ${
                        pass.passType === 'student' ? 'bg-blue-100 text-blue-700' :
                        pass.passType === 'staff' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {pass.passType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {pass.personName}
                      <div className="text-xs text-slate-500 font-normal mt-0.5">
                        {pass.relationship && <span className="mr-2">Rel: {pass.relationship}</span>}
                        {pass.contactNumber && <span>📞 {pass.contactNumber}</span>}
                      </div>
                      {pass.passType === 'student' && pass.studentClass && (
                        <div className="text-xs text-blue-600 font-semibold mt-0.5">
                          Class {pass.studentClass} {pass.studentSection ? `- Sec ${pass.studentSection}` : ''} 
                          {pass.studentId ? ` (${pass.studentId})` : ''}
                        </div>
                      )}
                      {pass.idProofType && pass.idReference && (
                        <div className="text-xs text-slate-400 font-normal">
                          {pass.idProofType}: {pass.idReference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={pass.reason}>{pass.reason}</td>
                    <td className="px-6 py-4 text-center font-medium text-amber-600">{pass.timeOut}</td>
                    <td className="px-6 py-4 text-center font-medium text-emerald-600">{pass.timeIn || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {pass.status === 'issued' ? (
                        <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Out
                        </div>
                      ) : pass.status === 'returned' ? (
                        <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Returned
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-rose-500 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {pass.status === 'issued' && (
                          <button 
                            onClick={() => handleMarkReturned(pass._id)}
                            className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                            title="Mark as Returned"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(pass)}
                          className="p-1.5 bg-[#9352F3] text-white rounded hover:bg-purple-600 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pass._id)}
                          className="p-1.5 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
