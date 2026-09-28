import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getStorageUrl } from '../../api/client';

const GallerySection = ({ galleries = [] }) => {
  const [activeGallery, setActiveGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useLanguage();

  if (!galleries || galleries.length === 0) return null;

  const openLightbox = (gallery) => {
    setActiveGallery(gallery);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (activeGallery?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % activeGallery.images.length);
    }
  };

  const prevImage = () => {
    if (activeGallery?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + activeGallery.images.length) % activeGallery.images.length);
    }
  };

  return (
    <section className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-emerald-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-emerald-600 rounded-xs"></span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Camera size={22} className="text-emerald-600" />
            <span>{t('ફોટો ગેલેરી', 'Photo Stories')}</span>
          </h2>
        </div>
      </div>

      {/* Grid of Galleries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            onClick={() => openLightbox(gallery)}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
              <img
                src={getStorageUrl(gallery.cover_image) || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'}
                alt={gallery.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <ImageIcon size={12} />
                <span>{gallery.images?.length || 1} તસવીરો</span>
              </span>
            </div>
            <div className="p-3.5">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                {gallery.title}
              </h3>
              {gallery.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {gallery.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeGallery && activeGallery.images && activeGallery.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-xs">
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between text-white p-2">
            <div>
              <h4 className="font-bold text-base">{activeGallery.title}</h4>
              <span className="text-xs text-slate-400">
                {currentImageIndex + 1} / {activeGallery.images.length}
              </span>
            </div>
            <button
              onClick={() => setActiveGallery(null)}
              className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <button
              onClick={prevImage}
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>
            <img
              src={getStorageUrl(activeGallery.images[currentImageIndex]?.image_url)}
              alt={activeGallery.images[currentImageIndex]?.caption || activeGallery.title}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={nextImage}
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Lightbox Caption & Credit */}
          <div className="text-center text-white pb-4">
            {activeGallery.images[currentImageIndex]?.caption && (
              <p className="text-sm font-medium">{activeGallery.images[currentImageIndex]?.caption}</p>
            )}
            {activeGallery.images[currentImageIndex]?.credit && (
              <p className="text-xs text-slate-400 mt-0.5">તસવીર સૌજન્ય: {activeGallery.images[currentImageIndex]?.credit}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
