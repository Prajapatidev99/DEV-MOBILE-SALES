import * as React from 'react';
import * as api from '../api';

interface ImageResolverProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src?: string;
}

const ImageResolver: React.FC<ImageResolverProps> = ({ src, ...props }) => {
    const [resolvedSrc, setResolvedSrc] = React.useState<string | undefined>(src && !src.startsWith('idb://') ? src : undefined);

    React.useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const resolveImage = async () => {
            if (src && src.startsWith('idb://')) {
                setResolvedSrc(undefined); // Show loader
                const key = src.replace('idb://', '');
                try {
                    const blob = await api.getImageFromDb(key);
                    if (isMounted) {
                        if (blob) {
                            objectUrl = URL.createObjectURL(blob);
                            setResolvedSrc(objectUrl);
                        } else {
                            setResolvedSrc(''); // Fallback
                        }
                    }
                } catch (error) {
                    console.error("Failed to load image from IndexedDB", error);
                    if (isMounted) setResolvedSrc(''); // Fallback
                }
            } else {
                 if (isMounted) setResolvedSrc(src);
            }
        };

        resolveImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (src && resolvedSrc === undefined) {
        // Show a placeholder while loading from DB
        const { className, style } = props;
        return <div className={`bg-gray-200 animate-pulse ${className || ''}`} style={style} />;
    }

    if (!resolvedSrc) {
        const { className, style } = props;
        // if src was empty or resolution failed, show a placeholder
        return <div className={`bg-gray-200 ${className || ''}`} style={style} ><span className="sr-only">Image not available</span></div>;
    }
    
    return <img src={resolvedSrc} {...props} />;
};

export default ImageResolver;
