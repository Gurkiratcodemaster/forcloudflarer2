'use client';

import { useState } from 'react';
import styles from './page.module.css';

/**
 * A simple component to upload a file to Cloudflare R2 using a presigned URL
 * obtained from our own backend.
 */
export default function HomePage() {
  // State to hold the selected file object
  const [file, setFile] = useState<File | null>(null);
  // State to track if an upload is currently in progress
  const [isUploading, setIsUploading] = useState<boolean>(false);
  // State to show feedback messages to the user
  const [statusMessage, setStatusMessage] = useState<string>('Please select a file to upload.');
  // State to hold the unique key of the successfully uploaded file
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);

  // Handles the file input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setStatusMessage(`Selected file: ${files[0].name}`);
      setUploadedFileKey(null); // Reset previous upload result
    }
  };

  // Main function to handle the form submission
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Requesting permission to upload...');

    try {
      // Step 1: Ask our backend for a secure URL to upload the file to.
      const { uploadUrl, key } = await getPresignedUrl();

      setStatusMessage('Uploading file...');

      // Step 2: Use the secure URL to upload the file directly to R2.
      await uploadFileToR2(uploadUrl, file);

      setStatusMessage('Upload successful!');
      setUploadedFileKey(key); // Save the key to show a shareable link
    } catch (error) {
      console.error(error);
      // We must check if the caught object is an instance of Error
      // before we can access its `message` property.
      if (error instanceof Error) {
        setStatusMessage(`Error: ${error.message}`);
      } else {
        setStatusMessage('An unknown error occurred during upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to fetch the presigned URL from our backend
  async function getPresignedUrl() {
    const response = await fetch('http://localhost:3001/api/generate-upload-url', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to get pre-signed URL from server.');
    }

    return response.json();
  }

  // Helper function to upload the file to the given presigned URL
  async function uploadFileToR2(uploadUrl: string, file: File) {
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('File upload to R2 failed.');
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Upload Your Notes</h1>
      <form onSubmit={handleUpload} className={styles.form}>
        <input type="file" onChange={handleFileChange} disabled={isUploading} className={styles.input} />
        <button type="submit" disabled={isUploading} className={styles.button}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      <p className={styles.status}>Status: {statusMessage}</p>
      {uploadedFileKey && (
        <div className={styles.result}>
          <p>File uploaded successfully!</p>
          {/* This link won't work yet, but we will build this page next! */}
          <p>
            Shareable link:{' '}
            <a href={`/notes/${uploadedFileKey}`}>{`/notes/${uploadedFileKey}`}</a>
          </p>
        </div>
      )}
    </main>
  );
}