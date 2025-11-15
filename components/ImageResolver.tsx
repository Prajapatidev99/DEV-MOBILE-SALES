import * as React from 'react';

const CLOUDINARY_CLOUD_NAME = 'dv9z9uaht';
const minimalPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const getCloudinaryUrl = (publicIdOrUrl: string, width: number): string => {
    if (!publicIdOrUrl) return minimalPlaceholder;

    // If it's already a full URL (http or data URI), return it directly.
    // This makes the component robust against accidentally passing full URLs instead of public IDs.
    if (publicIdOrUrl.startsWith('http') || publicIdOrUrl.startsWith('data:')) {
        return publicIdOrUrl;
    }
    
    // Otherwise, assume it's a publicId and construct the Cloudinary URL.
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,c_pad,w_${width}/${publicIdOrUrl}.webp`;
};


interface ImageResolverProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    publicId?: string;
    src?: string;
    width?: number;
}

const ImageResolver = React.forwardRef<HTMLImageElement, ImageResolverProps>(({ publicId, src, width = 800, ...props }, ref) => {
    if (!publicId && !src) {
        const { className, style } = props;
        // if src or publicId was empty, show a placeholder
        return <div className={`bg-gray-200 ${className || ''}`} style={style} ><span className="sr-only">Image not available</span></div>;
    }
    
    // Use direct src if provided, otherwise generate Cloudinary URL
    const imageUrl = src || getCloudinaryUrl(publicId!, width);
    return <img src={imageUrl} {...props} ref={ref} />;
});

ImageResolver.displayName = 'ImageResolver';

export default ImageResolver;