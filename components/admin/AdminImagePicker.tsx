"use client";

import { useState } from "react";
import type { MediaAsset } from "@/data/adminCms";

type AdminImagePickerProps = {
  assets: MediaAsset[];
  selectedPaths: string[];
  onSelectPath?: (path: string) => void;
};

export function AdminImagePicker({ assets, selectedPaths, onSelectPath }: AdminImagePickerProps) {
  const [selectedPath, setSelectedPath] = useState(selectedPaths[0] ?? assets[0]?.path ?? "");

  return (
    <div className="adminImagePicker">
      <div>
        <strong>Media picker placeholder</strong>
        <p>Selecting assets updates local form state only. Connect this picker to storage-backed media records later.</p>
      </div>
      <div className="adminImagePickerGrid">
        {assets.slice(0, 6).map((asset) => (
          <button
            className={selectedPath === asset.path ? "adminImagePickerSelected" : ""}
            key={asset.id}
            onClick={() => {
              setSelectedPath(asset.path);
              onSelectPath?.(asset.path);
            }}
            type="button"
          >
            <span style={{ backgroundImage: `url('${asset.path}')` }} />
            <small>{asset.category}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
