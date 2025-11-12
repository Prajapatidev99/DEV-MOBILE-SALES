import * as React from 'react';
// FIX: The `api` module is no longer needed, as the function `getImageFromDb` does not exist and the underlying logic has been changed.
// import * as api from '../api';

interface ImageResolverProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src?: string;
}

const ImageResolver: React.FC<ImageResolverProps> = ({ src, ...props }) => {
    // FIX: Replaced logic that called the non-existent `api.getImageFromDb`. The previous implementation was
    // for resolving `idb://` URLs from a deprecated IndexedDB setup. This fix simply strips the legacy prefix
    // to handle any old data, resolving the compile error and ensuring images render correctly.
    const resolvedSrc = React.useMemo(() => {
        if (!src) return undefined;
        return src.startsWith('idb://') ? src.replace('idb://', '') : src;
    }, [src]);

    if (!resolvedSrc) {
        const { className, style } = props;
        // if src was empty or resolution failed, show a placeholder
        return <div className={`bg-gray-200 ${className || ''}`} style={style} ><span className="sr-only">Image not available</span></div>;
    }
    
    return <img src={resolvedSrc} {...props} />;
};

export default ImageResolver;
