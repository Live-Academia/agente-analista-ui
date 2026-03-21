"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface DataUploadProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

export function DataUpload({ onFile, loading }: DataUploadProps) {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
      setDragging(false);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer",
        isDragActive || dragging
          ? "border-[#7B68EE] bg-[#7B68EE]/5"
          : "border-[#3a3d45] hover:border-[#7B68EE] hover:bg-[#7B68EE]/5",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-3">📁</div>
      <p className="text-[#e8e8e8] font-semibold">
        {loading ? "Analisando..." : "Arraste um arquivo ou clique para selecionar"}
      </p>
      <p className="mt-1 text-sm text-[#b0b4c0]">CSV, XLSX ou XLS — max 50MB</p>
    </div>
  );
}
