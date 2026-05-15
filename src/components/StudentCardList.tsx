import React, { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import {
  Download,
  Edit3,
  Trash2,
  ImagePlus,
  Save,
  X,
  Loader2,
  CheckCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Student } from '../types';
import IDCard from './IDCard';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function StudentCardList() {
  const { students, deleteStudent, updateStudent, loading } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNumber.includes(searchTerm)
  );

  /**
   * Common html-to-image options for pixel-perfect export.
   * html-to-image uses SVG foreignObject which delegates rendering
   * to the browser's own layout engine — no text baseline issues.
   */
  const getExportOptions = () => ({
    width: 385,
    height: 616,
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: '#ffffff',
    style: {
      // Strip Framer Motion transforms so the element renders at its natural position
      transform: 'none',
      opacity: '1',
    },
  });

  const handleDownloadSingle = async (student: Student, format: 'png' | 'jpeg' | 'pdf') => {
    const el = document.getElementById(`id-card-${student.id}`);
    if (!el) {
      alert('ID Card element not found');
      return;
    }

    try {
      console.log(`[EXPORT] Starting export for student: ${student.name} (${student.admissionNumber}) as ${format}`);
      const fileName = `ID_Card_${student.admissionNumber}_${student.name}`;
      const options = getExportOptions();

      if (format === 'pdf') {
        const dataUrl = await toPng(el, options);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [55, 88],
          compress: false
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 55, 88, undefined, 'NONE');
        pdf.save(`${fileName}.pdf`);
        console.log(`[SUCCESS] PDF exported: ${fileName}.pdf (55mm × 88mm)`);
      } else if (format === 'jpeg') {
        const dataUrl = await toJpeg(el, { ...options, quality: 1.0 });
        saveAs(dataUrl, `${fileName}.jpg`);
        console.log(`[SUCCESS] JPEG exported: ${fileName}.jpg`);
      } else {
        const dataUrl = await toPng(el, options);
        saveAs(dataUrl, `${fileName}.png`);
        console.log(`[SUCCESS] PNG exported: ${fileName}.png`);
      }
    } catch (err) {
      console.error('[ERROR] Download failed:', err);
      alert('Failed to export. Please check your internet connection and try again.');
    }
  };

  const handleDownloadBulk = async () => {
    if (filteredStudents.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);
    const zip = new JSZip();

    try {
      for (let i = 0; i < filteredStudents.length; i++) {
        const student = filteredStudents[i];
        const el = document.getElementById(`id-card-${student.id}`);
        if (el) {
          const fileName = `ID_Card_${student.admissionNumber}_${student.name}`;
          const options = getExportOptions();

          if (exportFormat === 'pdf') {
            const dataUrl = await toPng(el, options);
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: [55, 88],
              compress: false
            });
            pdf.addImage(dataUrl, 'PNG', 0, 0, 55, 88, undefined, 'NONE');
            zip.file(`${fileName}.pdf`, pdf.output('blob'));
          } else if (exportFormat === 'jpeg') {
            const dataUrl = await toJpeg(el, { ...options, quality: 1.0 });
            const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
            zip.file(`${fileName}.jpg`, base64Data, { base64: true });
          } else {
            const dataUrl = await toPng(el, options);
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            zip.file(`${fileName}.png`, base64Data, { base64: true });
          }
        }
        setExportProgress(Math.round(((i + 1) / filteredStudents.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ID_Cards_Batch_${new Date().toLocaleDateString()}.zip`);
    } catch (err) {
      console.error('Bulk download failed', err);
      alert('Failed to export batch. Please check your internet connection and try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImageUpload = async (studentId: string, file: File) => {
    try {
      setUploadingImageId(studentId);
      const storageRef = ref(storage, `student_photos/${studentId}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateStudent(studentId, { photoURL: url });
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImageId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* List Header & Controls */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10">
        <div className="relative flex-1 min-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search manifests by student name or admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#11365c] transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {(['png', 'jpeg', 'pdf'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all ${exportFormat === format
                  ? 'bg-[#11365c] text-white'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {format}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadBulk}
            disabled={isExporting || filteredStudents.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#11365c] text-white rounded-2xl font-bold hover:bg-[#0d2a48] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-900/10 text-sm tracking-tight"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                Processing {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Batch Export (.zip)
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-24"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[#11365c] opacity-20" /></div>}

      <div className="grid grid-cols-1 gap-8 pb-32">
        <AnimatePresence>
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group"
            >
              <div className="flex flex-col lg:flex-row gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-[#11365c]/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all">
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <IDCard student={student} id={`id-card-${student.id}`} />
                </div>

                <div className="flex-1 flex flex-col gap-6 py-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        {student.name || 'UNNAMED RECORD'}
                        {student.photoURL && <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle className="w-3 h-3 text-emerald-600" /></div>}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Ref: {student.admissionNumber} <span className="mx-2 opacity-30">|</span> Class: {student.studentClass}
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  {editingId === student.id ? (
                    <EditForm student={student} onSave={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ActionButton
                        icon={<Edit3 className="w-4 h-4" />}
                        label="Modify Identity Data"
                        onClick={() => setEditingId(student.id)}
                      />
                      <label className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 hover:border-slate-200 cursor-pointer transition-all text-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" style={{ pointerEvents: uploadingImageId === student.id ? 'none' : 'auto', opacity: uploadingImageId === student.id ? 0.6 : 1 }}>
                        {uploadingImageId === student.id ? (
                          <>
                            <Loader2 className="w-4 h-4 text-[#11365c] animate-spin" />
                            Uploading Image...
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-4 h-4 text-[#11365c]" />
                            Update Profile Image
                          </>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingImageId === student.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(student.id, file);
                          }}
                        />
                      </label>
                      <ActionButton
                        icon={<Download className="w-4 h-4" />}
                        label={`Export ${exportFormat.toUpperCase()}`}
                        onClick={() => handleDownloadSingle(student, exportFormat)}
                      />
                      <ActionButton
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Purge Record"
                        onClick={() => {
                          if (confirm('Irreversible Action: Purge this identity manifest?')) {
                            deleteStudent(student.id);
                          }
                        }}
                        danger
                      />
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex items-center gap-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Compliance Check 2024</p>
                    <div className="h-1 flex-1 bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${student.photoURL ? 'bg-emerald-400 w-full' : 'bg-amber-400 w-1/2'} rounded-full`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{student.photoURL ? 'Verified' : 'Pending Photo'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: { icon: any, label: string, onClick: () => void, danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all text-sm font-bold ${danger
        ? 'border-red-100 text-red-600 bg-red-50/30 hover:bg-red-50 hover:border-red-200'
        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
        }`}
    >
      <div className={`${danger ? 'text-red-500' : 'text-[#11365c] opacity-70'}`}>{icon}</div>
      {label}
    </button>
  );
}

function EditForm({ student, onSave, onCancel }: { student: Student; onSave: () => void; onCancel: () => void }) {
  const { updateStudent } = useStore();
  const [formData, setFormData] = useState({ ...student });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStudent(student.id, formData);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 animate-in fade-in slide-in-from-top-1">
      <Input label="S. No." value={String(formData.serialNumber || '')} onChange={(v) => setFormData({ ...formData, serialNumber: v ? parseInt(v) : undefined })} type="number" />
      <Input label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
      <Input label="Adm. No" value={formData.admissionNumber} onChange={(v) => setFormData({ ...formData, admissionNumber: v })} />
      <Input label="Class" value={formData.studentClass} onChange={(v) => setFormData({ ...formData, studentClass: v })} />
      <Input label="Father's" value={formData.fatherName} onChange={(v) => setFormData({ ...formData, fatherName: v })} />
      <Input label="Mother's" value={formData.motherName} onChange={(v) => setFormData({ ...formData, motherName: v })} />
      <Input label="DOB" value={formData.dob} onChange={(v) => setFormData({ ...formData, dob: v })} />
      <Input label="Mobile" value={formData.mobileNumber} onChange={(v) => setFormData({ ...formData, mobileNumber: v })} />
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-20"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-1">
          <Save className="w-4 h-4" /> Save
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-bold">
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}
