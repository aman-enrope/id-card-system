import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Student } from "../types";
import { useStore } from "../store/useStore";

/**
 * Returns the image URL for display and export
 * Firebase Storage URLs are returned as-is with CORS headers
 */
const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  // Firebase URLs - add nocache parameter to bypass caching issues
  if (url.includes("firebasestorage")) {
    return `${url}&nocache=${Date.now()}`;
  }
  return url;
};

/**
 * Image component with error handling and logging
 */
const ImageWithErrorHandling = ({
  src,
  alt,
  className,
  style,
  onError,
  onLoad,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Image failed to load: ${src}`, e);
    setImageError(true);
    onError?.(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Image loaded successfully: ${src}`);
    onLoad?.(e);
  };

  if (imageError || !src) {
    return <div style={{ ...style, backgroundColor: "#e5e7eb" }} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

interface IDCardProps {
  student: Student;
  id?: string;
}

export default function IDCard({ student, id }: IDCardProps) {
  const { settings } = useStore();
  const {
    name,
    admissionNumber,
    studentClass,
    dob,
    fatherName,
    motherName,
    mobileNumber,
    address,
    photoURL,
  } = student;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-96.25 h-154 overflow-hidden relative"
      style={{
        fontFamily: '"myriad-pro", sans-serif',
        backgroundColor: "#ffffff",
        border: "2px solid #1e293b",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Top Banner Section */}
      <div className="p-3">
        <div
          className="h-38.75 w-full p-3 flex flex-col items-center justify-start rounded-b-[60px] relative"
          style={{
            backgroundColor: settings.themeColor,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex w-full items-center gap-3 mt-1">
            {/* Logo Container */}
            <div
              className="p-1 rounded-xl w-16 h-16 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ImageWithErrorHandling
                src={getImageUrl(settings.logoURL)}
                alt="Logo"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* School Header */}
            <div
              className="flex-1 flex flex-col justify-center text-center pb-2"
              style={{ color: "#ffffff" }}
            >
              <h1
                className="text-[25px] tracking-[0.02em]"
                style={{
                  fontFamily: '"myriad-pro-cond", sans-serif',
                  fontWeight: 700,
                  lineHeight: "18px",
                }}
              >
                {settings.name
                  .split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(" ")}
              </h1>
              <div className="mt-1 w-full text-center">
                <p
                  className="text-[10px] opacity-100 tracking-wider"
                  style={{
                    fontFamily: '"myriad-pro", sans-serif',
                    fontWeight: 400,
                    lineHeight: "10px",
                  }}
                >
                  {settings.addressLine1}
                </p>
                <p
                  className="text-[10px] opacity-100 tracking-wider mt-0.5"
                  style={{
                    fontFamily: '"myriad-pro", sans-serif',
                    fontWeight: 400,
                    lineHeight: "10px",
                  }}
                >
                  {settings.addressLine2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image - Positioned to overlap transition - 19.563mm x 22.781mm */}
      <div
        className="absolute top-21.75 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 transition-all"
        style={{
          width: "137px",
          height: "159px",
          backgroundColor: "#cccccc",
          border: "1px solid #000000",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {photoURL ? (
          <ImageWithErrorHandling
            src={getImageUrl(photoURL)}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            <span className="text-3xl font-black leading-none tracking-tighter">
              NO <br /> IMAGE
            </span>
            <span className="text-[8px] mt-2 font-bold uppercase">
              Enrope Solutions
            </span>
          </div>
        )}
      </div>

      {/* Name Pill - Navy Strip */}
      <div className="mt-20 px-4 flex justify-center">
        <div
          className="w-full rounded-[30px] font-bold text-[22px] uppercase tracking-wider text-center"
          style={{
            backgroundColor: settings.themeColor,
            color: "#ffffff",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            height: "45px",
            lineHeight: "45px",
          }}
        >
          {name || "ANSHU"}
        </div>
      </div>

      {/* Watermark Logo */}
      <div className="absolute top-70 left-1/2 -translate-x-1/2 w-48 h-48 opacity-[0.04] pointer-events-none">
        <ImageWithErrorHandling
          src={getImageUrl(settings.watermarkURL)}
          alt="Watermark"
          className="w-full h-full object-contain grayscale"
        />
      </div>

      {/* Details Section */}
      <div className="mt-5 px-6 space-y-1.5 relative z-20">
        <div className="flex text-[14px]" style={{ lineHeight: "19px" }}>
          <div className="flex flex-1">
            <span
              className="w-27.5 font-normal shrink-0"
              style={{ color: "#1f2937" }}
            >
              Admission No.
            </span>
            <span className="mr-2 font-bold" style={{ color: "#030712" }}>
              :
            </span>
            <span className="uppercase font-bold" style={{ color: "#030712" }}>
              {admissionNumber || "795"}
            </span>
          </div>
          <div className="flex shrink-0 ml-2">
            <span className="font-normal mr-2" style={{ color: "#1f2937" }}>
              D.O.B. :
            </span>
            <span className="font-bold" style={{ color: "#030712" }}>
              {dob || ""}
            </span>
          </div>
        </div>
        <DetailRow label="Class" value={studentClass || "LKG"} />
        <DetailRow label="Father's Name" value={fatherName || "MR. MUKESH"} />
        <DetailRow label="Mother's Name" value={motherName || "MRS. GEETA"} />
        <DetailRow label="Mobile No." value={mobileNumber || "9289982721"} />
        <DetailRow
          label="Address"
          value={address || "VILL. JAITPUR, GR. NOIDA"}
          isAddress
        />
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-7 left-0 w-full px-8 flex justify-between items-end z-20">
        <div className="flex flex-col">
          <span
            className="text-[12px] font-bold"
            style={{ color: "#1e293b", lineHeight: "14px" }}
          >
            Session
          </span>
          <span
            className="text-[19px] font-black"
            style={{ color: "#dc2626", lineHeight: "22px" }}
          >
            {settings.session}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <ImageWithErrorHandling
            src={getImageUrl(settings.principalSignatureURL)}
            alt="Sign"
            className="h-10 object-contain"
          />
          <span
            className="text-[11px] font-bold mt-0.5"
            style={{ color: "#1f2937", lineHeight: "14px" }}
          >
            Principal
          </span>
        </div>
      </div>

      {/* Bottom Strips */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col z-20">
        <div className="h-3" style={{ backgroundColor: settings.themeColor }} />
        <div className="h-1.5" style={{ backgroundColor: "#000000" }} />
      </div>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  isAddress = false,
}: {
  label: string;
  value: string;
  isAddress?: boolean;
}) {
  return (
    <div
      className="flex text-[14px]"
      style={{ lineHeight: isAddress ? "16px" : "19px" }}
    >
      <span
        className="w-27.5 font-normal shrink-0"
        style={{ color: "#1f2937" }}
      >
        {label}
      </span>
      <span className="mr-2 font-bold" style={{ color: "#030712" }}>
        :
      </span>
      <span className={`uppercase font-bold`} style={{ color: "#030712" }}>
        {value}
      </span>
    </div>
  );
}
