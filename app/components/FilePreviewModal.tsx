"use client";
import { useState } from "react";
import ModelViewerClient from "./ModelViewerClient";

interface FileItem {
  label: string;
  url:   string | null;
  type:  "image" | "pdf" | "cad" | "3d";
}

interface Props {
  files:    FileItem[];
  trigger?: React.ReactNode;
}

export function FilePreviewModal({ files, trigger }: Props) {
  const [open,    setOpen]    = useState(false);
  const [current, setCurrent] = useState<FileItem | null>(null);

  const openFile = (file: FileItem) => {
    if (!file.url) return;
    setCurrent(file);
    setOpen(true);
  };

  const availableFiles = files.filter((f) => f.url);

  return (
    <>
      {/* Trigger or default file list */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <button key={f.label}
              onClick={() => openFile(f)}
              disabled={!f.url}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                f.url
                  ? f.type === "pdf"   ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  : f.type === "image" ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                  : f.type === "3d"    ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  :                     "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              }`}>
              {f.type === "pdf"   ? "📄" :
               f.type === "image" ? "🖼️" :
               f.type === "3d"    ? "🏠" : "📐"}
              {f.label}
              {f.url ? " →" : " (N/A)"}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-4 overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-800 text-white">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 flex-1 mr-4">
                {availableFiles.map((f) => (
                  <button key={f.label}
                    onClick={() => setCurrent(f)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      current?.label === f.label
                        ? "bg-teal-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}>
                    {f.type === "pdf"   ? "📄" :
                     f.type === "image" ? "🖼️" :
                     f.type === "3d"    ? "🏠" : "📐"}
                    {" "}{f.label}
                  </button>
                ))}
              </div>
              <button onClick={() => { setOpen(false); setCurrent(null); }}
                className="text-gray-400 hover:text-white text-2xl leading-none flex-shrink-0">
                ×
              </button>
            </div>

            {/* Preview Area */}
            <div className="bg-gray-900 min-h-[500px] flex flex-col">
              {!current ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                  <div className="text-center">
                    <p className="text-4xl mb-3">📁</p>
                    <p className="font-semibold">Select a file above to preview</p>
                    <p className="text-sm mt-1 text-gray-600">{availableFiles.length} files available</p>
                  </div>
                </div>
              ) : current.type === "image" ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <img src={current.url!} alt={current.label}
                    className="max-w-full max-h-[600px] object-contain rounded-xl shadow-xl" />
                </div>
              ) : current.type === "pdf" ? (
                <iframe
                  src={current.url!}
                  className="w-full flex-1 min-h-[600px]"
                  title={current.label}
                />
              ) : current.type === "3d" ? (
                <div className="p-4">
                  <ModelViewerClient url={current.url!} />
                </div>
              ) : (
                /* CAD files — can't preview, offer download */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-5xl mb-4">📐</p>
                    <p className="text-white font-semibold text-lg mb-2">{current.label}</p>
                    <p className="text-gray-400 text-sm mb-6">
                      CAD files cannot be previewed in browser.
                      Download to open in AutoCAD or similar software.
                    </p>
                    <a href={current.url!} download
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition inline-flex items-center gap-2">
                      ⬇️ Download {current.label}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-800 flex items-center justify-between">
              <p className="text-gray-400 text-xs">
                {current ? current.label : "No file selected"} ·
                {availableFiles.length} files available
              </p>
              <div className="flex gap-2">
                {current?.url && current.type !== "3d" && (
                  <a href={current.url} target="_blank" rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                    🔗 Open in New Tab
                  </a>
                )}
                {current?.url && (
                  <a href={current.url} download
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                    ⬇️ Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper hook to build file list from a plan object
export function buildFileList(plan: any, packageType: "basic" | "premium" | "all" = "all"): FileItem[] {
  const basic: FileItem[] = [
    { label: "Exterior Render",      url: plan.exterior_render_url || plan.image_url, type: "image" },
    { label: "Floor Plans",          url: plan.floor_plan_pdf_url,                    type: "pdf"   },
    { label: "Elevations",           url: plan.elevation_north_url,                   type: "pdf"   },
    { label: "Staircase Section",    url: plan.staircase_section_url,                 type: "pdf"   },
    { label: "Door & Window",        url: plan.door_window_pdf_url,                   type: "pdf"   },
  ];

  const premium: FileItem[] = [
    { label: "CAD File (DWG)",       url: plan.dwg_url,                               type: "cad"   },
    { label: "CAD File (DXF)",       url: plan.dxf_url,                               type: "cad"   },
    { label: "3D Model Viewer",      url: plan.model_3d_url,                          type: "3d"    },
  ];

  if (packageType === "basic")   return basic;
  if (packageType === "premium") return [...basic, ...premium];
  return [...basic, ...premium];
}