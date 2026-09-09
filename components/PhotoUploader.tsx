"use client";

import { useRef, useState } from "react";
import { uploadGalleryPhoto } from "@/lib/actions/profile";

const MAX_PHOTOS = 5;

export default function PhotoUploader({
    photos,
    onPhotosChange,
}: {
    photos: string[];
    onPhotosChange: (urls: string[]) => void;
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingSlotIndex = useRef<number | null>(null);

    function openFilePicker(slotIndex: number) {
        pendingSlotIndex.current = slotIndex;
        fileInputRef.current?.click();
    }

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const slotIndex = pendingSlotIndex.current ?? photos.length;
        setError(null);
        setUploadingIndex(slotIndex);

        try {
            const result = await uploadGalleryPhoto(file);
            if (!result.success || !result.url) {
                setError(result.error || "Failed to upload photo");
                return;
            }

            const updatedPhotos = [...photos];
            if (slotIndex < updatedPhotos.length) {
                updatedPhotos[slotIndex] = result.url;
            } else {
                updatedPhotos.push(result.url);
            }

            onPhotosChange(updatedPhotos);
        } catch (err) {
            setError("Failed to upload photo");
        } finally {
            setUploadingIndex(null);
        }
    }

    function handleRemove(index: number) {
        onPhotosChange(photos.filter((_, i) => i !== index));
    }

    function renderSlot(index: number) {
        const url = photos[index];

        return (
            <div
                key={index}
                className="relative aspect-[3/4] w-[calc((100%-1.5rem)/3)] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            >
                {url ? (
                    <>
                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white text-sm hover:bg-black/80"
                            aria-label="Remove photo"
                        >
                            ×
                        </button>
                    </>
                ) : uploadingIndex === index ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500" />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => openFilePicker(index)}
                        className="w-full h-full flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-400 transition-colors duration-200"
                    >
                        <span className="text-3xl font-light">+</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
            />

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-400 transition-colors duration-200"
            >
                <div className="flex -space-x-2">
                    {photos.slice(0, 3).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800"
                        />
                    ))}
                    {photos.length === 0 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                            +
                        </div>
                    )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manage Photos ({photos.length}/{MAX_PHOTOS})
                </span>
            </button>

            {/* Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Your Photos
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Row 1: 3 across */}
                        <div className="flex gap-3 mb-3">
                            {[0, 1, 2].map((i) => renderSlot(i))}
                        </div>

                        {/* Row 2: 2 centered */}
                        <div className="flex gap-3 justify-center">
                            {[3, 4].map((i) => renderSlot(i))}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                            {photos.length}/{MAX_PHOTOS} photos added
                        </p>

                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{error}</p>
                        )}

                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}