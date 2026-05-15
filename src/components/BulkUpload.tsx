import React, { useRef, useState } from 'react';
import { Upload, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Student } from '../types';

export default function BulkUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkAddStudents } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [convertToUppercase, setConvertToUppercase] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processData(results.data as any[]);
        },
        error: (error) => {
          setStatus({ type: 'error', message: `Parse error: ${error.message}` });
          setIsUploading(false);
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        processData(jsonData as any[]);
      };
      reader.onerror = () => {
        setStatus({ type: 'error', message: 'Failed to read Excel file' });
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setStatus({ type: 'error', message: 'Unsupported file format. Please use CSV or XLSX.' });
      setIsUploading(false);
    }
  };

  const processData = async (data: any[]) => {
    try {
      const validStudents = data
        .filter(row => row.name && row.admissionNumber)
        .map(row => {
          // Convert text fields to uppercase if checkbox is enabled
          const textToConvert = (text: string) => convertToUppercase ? String(text).toUpperCase() : String(text);

          return {
            serialNumber: row['S. No.'] ? parseInt(String(row['S. No.'])) : undefined,
            name: textToConvert(row.name || ''),
            admissionNumber: textToConvert(row.admissionNumber || ''),
            studentClass: textToConvert(row.class || row.studentClass || ''),
            dob: String(row.dob || ''),
            fatherName: textToConvert(row.fatherName || ''),
            motherName: textToConvert(row.motherName || ''),
            mobileNumber: String(row.mobileNumber || ''),
            address: textToConvert(row.address || ''),
            session: row.session || '2025-2026',
          };
        });

      if (validStudents.length === 0) {
        throw new Error('No valid student data found in file.');
      }

      await bulkAddStudents(validStudents as Omit<Student, 'id'>[]);
      setStatus({ type: 'success', message: `Successfully imported ${validStudents.length} students!` });
    } catch (error) {
      setStatus({ type: 'error', message: (error as Error).message });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'S. No.': 1,
        name: 'John Doe',
        admissionNumber: '1001',
        class: '10th',
        dob: '01-01-2010',
        fatherName: 'Robert Doe',
        motherName: 'Jane Doe',
        mobileNumber: '9876543210',
        address: '123 Street, City, State'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'ID_Card_Template.xlsx');
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Bulk Data Integration</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Sync student records via CSV or XLSX</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-xs font-bold text-[#11365c] hover:bg-slate-50 px-4 py-2 rounded-xl transition-all border border-slate-100 uppercase tracking-wider"
        >
          <FileDown className="w-3.5 h-3.5" />
          Data Template
        </button>
      </div>

      {/* Uppercase Conversion Checkbox */}
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={convertToUppercase}
            onChange={(e) => setConvertToUppercase(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#11365c] focus:ring-[#11365c]"
          />
          <span className="text-sm font-bold text-slate-700">
            Convert all text fields to UPPERCASE (Name, Class, Address, etc.)
          </span>
        </label>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isUploading ? 'bg-slate-50 border-slate-300' : 'hover:bg-slate-50/50 hover:border-[#11365c]/30 border-slate-200'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-[#11365c] mb-6 shadow-inner">
          <Upload className="w-8 h-8" />
        </div>
        
        <p className="text-slate-700 font-bold text-lg">
          {isUploading ? 'Integrating Data...' : 'Drop identity manifest here'}
        </p>
        <p className="text-xs text-slate-400 mt-2 font-medium">Standard spreadsheet formats supported</p>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mt-6 p-4 rounded-2xl flex items-start gap-3 border ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold">{status.type === 'success' ? 'Import Successful' : 'Upload Failed'}</p>
              <p className="text-xs font-medium opacity-90 mt-0.5">{status.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
