'use client'; // Mark as a Client Component

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<{
    summary: {
      total_images: number;
      live_count: number;
      dead_count: number;
      live_percentage: number;
      dead_percentage: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("An error occurred while processing the files.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />
      <Button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload and Process"}
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Show Skeleton while loading */}
      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-[200px]" /> {/* Skeleton for heading */}
          <Skeleton className="h-6 w-[150px]" /> {/* Skeleton for total images */}
          <Skeleton className="h-6 w-[200px]" /> {/* Skeleton for live cells */}
          <Skeleton className="h-6 w-[200px]" /> {/* Skeleton for dead cells */}
        </div>
      ) : results ? (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          <p>Total Images: {results.summary.total_images}</p>
          <p>Live Cells: {results.summary.live_count} ({results.summary.live_percentage.toFixed(2)}%)</p>
          <p>Dead Cells: {results.summary.dead_count} ({results.summary.dead_percentage.toFixed(2)}%)</p>
        </div>
      ) : null}
    </div>
  );
}