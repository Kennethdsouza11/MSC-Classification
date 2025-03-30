'use client'; // Mark as a Client Component

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import Image from 'next/image';

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<{
    summary: {
      total_images: number;
      live_count: number;
      dead_count: number;
      singlet_count: number;
      aggregate_count: number;
      live_percentage: number;
      dead_percentage: number;
      singlet_percentage: number;
      aggregate_percentage: number;
    };
    live_images: string[];
    dead_images: string[];
    singlet_images: string[];
    aggregate_images: string[];
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
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
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
          <Skeleton className="h-6 w-[200px]" /> {/* Skeleton for singlets */}
          <Skeleton className="h-6 w-[200px]" /> {/* Skeleton for aggregates */}
        </div>
      ) : results ? (
        <div className="mt-6 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          <p>Total Images: {results.summary.total_images}</p>
          <p>Singlets: {results.summary.singlet_count} ({results.summary.singlet_percentage.toFixed(2)}%)</p>
          <p>Aggregates: {results.summary.aggregate_count} ({results.summary.aggregate_percentage.toFixed(2)}%)</p>
          <p>Live Cells from Singlets: {results.summary.live_count} ({results.summary.live_percentage.toFixed(2)}%)</p>
          <p>Dead Cells from Singlets: {results.summary.dead_count} ({results.summary.dead_percentage.toFixed(2)}%)</p>

          {/* Singlets Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">{`Out of ${results.summary.singlet_count} classified Singlets, here are 5 images of Singlets`}</h3>
            <div className="flex flex-wrap gap-4">
              {results.singlet_images.map((image, index) => (
                <Image
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`Singlet ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover rounded-lg"
                  unoptimized
                />
              ))}
            </div>
          </div>

          {/* Aggregates Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">{`Out of ${results.summary.aggregate_count} classified Aggregates, here are 5 images of Aggregates`}</h3>
            <div className="flex flex-wrap gap-4">
              {results.aggregate_images.map((image, index) => (
                <Image
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`Aggregate ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover rounded-lg"
                  unoptimized
                />
              ))}
            </div>
          </div>
          
          {/* Live Cells Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">{`Out of ${results.summary.live_count} classified Live MSCs from Singlets, here are 5 images of MSCs classified as Live`}</h3>
            <div className="flex flex-wrap gap-4">
              {results.live_images.map((image, index) => (
                <Image
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`Live Cell ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover rounded-lg"
                  unoptimized
                />
              ))}
            </div>
          </div>

          {/* Dead Cells Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">{`Out of ${results.summary.dead_count} classified Dead MSCs from Singlets, here are 5 images of MSCs classified as Dead`}</h3>
            <div className="flex flex-wrap gap-4">
              {results.dead_images.map((image, index) => (
                <Image
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`Dead Cell ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover rounded-lg"
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
      
    </div>
  );
}