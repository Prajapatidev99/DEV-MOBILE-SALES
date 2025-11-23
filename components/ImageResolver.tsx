
import * as React from 'react';

const CLOUDINARY_CLOUD_NAME = 'dv9z9uaht';
const minimalPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface ImageResolverProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    publicId?: string;
    width: number;
    height?: number;
    crop?: string;
    fetchpriority?: "high" | "low" | "auto";
}

export const getCloudinaryUrl = (publicId: string, width: number, height?: number, crop: string = 'limit'): string => {
    if (!publicId) return minimalPlaceholder;
    if (publicId.startsWith('http')) return publicId;

    const params = [`f_auto`, `q_auto:best`, `w_${width}`];
    if (height) params.push(`h_${height}`);
    if (crop) {
        params.push(`c_${crop}`);
        if (crop === 'fill') {
            params.push('g_auto'); // Use auto gravity for fills to keep subject in view
        }
    }

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}/${publicId}.webp`;
};

const imageWidths = [320, 400, 600, 800, 1200, 1600, 2400];

const ImageResolver = React.forwardRef<HTMLImageElement, ImageResolverProps>(
  ({ publicId, src, width, height, sizes, crop = 'limit', ...props }, ref) => {
    
    if (!publicId && !src) {
      const { className, style } = props;
      return (
        <div
          className={`bg-gray-200 ${className || ''}`}
          style={{ ...style, width, height }}
        >
          <span className="sr-only">Image not available</span>
        </div>
      );
    }

    let imageUrl: string;
    let imageSrcSet: string | undefined;

    if (src) {
      imageUrl = String(src);
    } else if (publicId) {
      imageUrl = getCloudinaryUrl(publicId, width, height, crop);
      imageSrcSet = imageWidths
        .map((w) => {
            // If scaling with a fixed aspect ratio crop, adjust height proportionally
            // This assumes 'width' and 'height' props defined the target aspect ratio
            const h = height ? Math.round(height * (w / width)) : undefined;
            return `${getCloudinaryUrl(publicId, w, h, crop)} ${w}w`;
        })
        .join(', ');
    } else {
      imageUrl = minimalPlaceholder;
    }

    return (
      <img
        src={imageUrl}
        srcSet={imageSrcSet}
        sizes={sizes}
        width={width}
        height={height}
        loading="lazy"
        ref={ref}
        {...props}
      />
    );
  }
);

ImageResolver.displayName = 'ImageResolver';

export default ImageResolver;
