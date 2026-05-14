import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Image, FileText, Palette, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...settings });
  const [imageStatus, setImageStatus] = useState<Record<string, boolean | null>>({
    logo: null,
    watermark: null,
    signature: null
  });

  // Check image URLs on load
  useEffect(() => {
    const checkImages = async () => {
      const urls = {
        logo: settings.logoURL,
        watermark: settings.watermarkURL,
        signature: settings.principalSignatureURL
      };

      const newStatus: Record<string, boolean | null> = {};
      for (const [key, url] of Object.entries(urls)) {
        try {
          const img = new window.Image();
          img.onload = () => {
            newStatus[key] = true;
            setImageStatus(prev => ({ ...prev, [key]: true }));
            console.log(`[OK] Image loaded successfully: ${key} - ${url.substring(0, 60)}...`);
          };
          img.onerror = () => {
            newStatus[key] = false;
            setImageStatus(prev => ({ ...prev, [key]: false }));
            console.warn(`[FAIL] Failed to load image: ${key} - ${url.substring(0, 60)}...`);
          };
          img.crossOrigin = "anonymous";
          img.referrerPolicy = "no-referrer";
          img.src = url;
        } catch (err) {
          newStatus[key] = false;
          setImageStatus(prev => ({ ...prev, [key]: false }));
          console.error(`[ERROR] Error checking image: ${key}`, err);
        }
      }
    };

    checkImages();
  }, [settings]);

  const handleFileUpload = async (type: 'logo' | 'signature' | 'watermark', file: File) => {
    setLoading(true);
    try {
      const storageRef = ref(storage, `school_assets/${type}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const updates = {
        logoURL: type === 'logo' ? url : settings.logoURL,
        principalSignatureURL: type === 'signature' ? url : settings.principalSignatureURL,
        watermarkURL: type === 'watermark' ? url : settings.watermarkURL,
      };

      await updateSettings(updates);
      setFormData(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(formData);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <Palette className="w-6 h-6 text-[#11365c]" />
          Visual Assets & Identity
        </h2>

        {/* Image Status Diagnostic */}
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Image Status Diagnostic
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'logo', label: 'Logo' },
              { key: 'watermark', label: 'Watermark' },
              { key: 'signature', label: 'Signature' }
            ].map(({ key, label }) => (
              <div key={key} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">{label}</span>
                  {imageStatus[key] === null && <span className="text-xs text-slate-400">Loading...</span>}
                  {imageStatus[key] === true && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {imageStatus[key] === false && <AlertCircle className="w-4 h-4 text-red-600" />}
                </div>
                <p className="text-[10px] text-slate-500 font-mono break-all">
                  {key === 'logo' ? settings.logoURL : key === 'watermark' ? settings.watermarkURL : settings.principalSignatureURL}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo Upload */}
          <AssetUpload
            label="School Logo"
            url={settings.logoURL}
            onUpload={(file) => handleFileUpload('logo', file)}
            icon={<Image className="w-5 h-5" />}
          />

          {/* Watermark Upload */}
          <AssetUpload
            label="ID Watermark"
            url={settings.watermarkURL}
            onUpload={(file) => handleFileUpload('watermark', file)}
            icon={<Palette className="w-5 h-5" />}
          />

          {/* Signature Upload */}
          <AssetUpload
            label="Principal Signature"
            url={settings.principalSignatureURL}
            onUpload={(file) => handleFileUpload('signature', file)}
            icon={<FileText className="w-5 h-5" />}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <School className="w-6 h-6 text-[#11365c]" />
          Institution Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:ring-1 focus:ring-[#11365c] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold text-slate-700 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address Line 2 (Contact Info)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Academic Session
                </label>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-[#11365c] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme Primary Color</label>
                <div className="flex gap-4">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-16 h-14 bg-white p-1 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-mono text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#11365c] text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:bg-[#0d2a48] transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Save Institution Config
          </button>
        </form>
      </div>
    </div>
  );
}

function AssetUpload({ label, url, onUpload, icon }: { label: string, url: string, onUpload: (file: File) => void, icon: any }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative group border-2 border-dashed border-slate-100 rounded-2xl p-4 hover:border-[#11365c]/30 transition-all flex flex-col items-center gap-4 bg-slate-50/50">
        <div className="w-24 h-24 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-2 border border-slate-100">
          <img src={url} alt={label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
        <label className="w-full bg-white border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
          {icon} Upload New
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}

function School(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 22v-4a2 2 0 1 0-4 0v4" />
      <path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12.618a1 1 0 0 1 .553-.894L6 10" />
      <path d="M6 5h12v5H6z" />
      <path d="M9 21v-4a2 2 0 1 1 4 0v4" />
      <path d="M22 10h-2" />
      <path d="M2 10h2" />
    </svg>
  );
}
