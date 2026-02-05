import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";

interface EditAvatarModalProps {
  open: boolean;
  onClose: () => void;
  avatarUrl: string;
  onAvatarChange: (file: File) => void;
}

const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ open, onClose, avatarUrl, onAvatarChange }) => {
  const [imageSrc, setImageSrc] = useState<string>(avatarUrl);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to get the cropped image as a file
  async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File | null> {
    const createImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
      });
    };

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to final crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
        } else {
          resolve(null);
        }
      }, 'image/jpeg');
    });
  }

  const handleSubmit = async () => {
    setUploading(true);
    const file = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (file) {
      onAvatarChange(file);
      onClose();
    }
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent footer={null} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Avatar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-64 h-64 bg-gray-100 rounded">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-xs">Zoom</label>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} />
            <label className="text-xs">Rotate</label>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setRotation(r => r - 90)}>&#8634;</button>
            <button type="button" className="px-2 py-1 border rounded" onClick={() => setRotation(r => r + 90)}>&#8635;</button>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2" />
          <button
            className="w-full bg-green-500 text-white py-2 rounded mt-2"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Save Avatar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAvatarModal;
