import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ManualAdd() {
  const { addStudent } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    name: '',
    admissionNumber: '',
    studentClass: '',
    dob: '',
    fatherName: '',
    motherName: '',
    mobileNumber: '',
    address: '',
    session: '2025-2026'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.admissionNumber) {
      alert('Name and Admission Number are required');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        serialNumber: formData.serialNumber ? parseInt(formData.serialNumber) : undefined
      };
      await addStudent(submitData);
      setFormData({
        serialNumber: '',
        name: '',
        admissionNumber: '',
        studentClass: '',
        dob: '',
        fatherName: '',
        motherName: '',
        mobileNumber: '',
        address: '',
        session: '2025-2026'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-[#11365c]" />
        Add Single Record
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <FormField label="S. No." value={formData.serialNumber} onChange={(v) => setFormData({...formData, serialNumber: v})} placeholder="e.g. 1" type="number" />
          <FormField label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required placeholder="e.g. Aryan Sharma" />
          <FormField label="Admission No" value={formData.admissionNumber} onChange={(v) => setFormData({...formData, admissionNumber: v})} required placeholder="e.g. 2024/GIS/482" />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Class" value={formData.studentClass} onChange={(v) => setFormData({...formData, studentClass: v})} placeholder="VII - B" />
            <FormField label="D.O.B" value={formData.dob} onChange={(v) => setFormData({...formData, dob: v})} placeholder="DD/MM/YYYY" />
          </div>

          <FormField label="Father's Name" value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} placeholder="Mr. Rajendra Sharma" />
          <FormField label="Mother's Name" value={formData.motherName} onChange={(v) => setFormData({...formData, motherName: v})} placeholder="Mrs. Sunita Sharma" />
          <FormField label="Mobile Number" value={formData.mobileNumber} onChange={(v) => setFormData({...formData, mobileNumber: v})} placeholder="+91 98765 43210" />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Home Address</label>
            <textarea 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Full residental address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#11365c] outline-none transition-all placeholder:text-slate-300 h-24 resize-none"
            />
          </div>
        </div>
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#11365c] text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-[#0d2a48] transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            Generate Entry
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, value, onChange, required, placeholder, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, required?: boolean, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#11365c] outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );
}
