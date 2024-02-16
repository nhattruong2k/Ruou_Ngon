import { useState, useEffect } from 'react';
import { Image } from '@react-pdf/renderer';
import axios from '../../../../utils/axios';

const fetchImage = async (url) => {
    const response = await axios.get(url, {
        method: 'GET',
        responseType: 'blob',
    }).then((response) => {
        return response;
    }).catch((error) => {
        return '';
    });
    if (response) {
        return window.URL.createObjectURL(new Blob([response.data]));
    }
    return '';
}

export default function ImageExport({ filename, folder, ...other }) {

    const [imgUrl, setImgUrl] = useState('');

    useEffect(() => {
        let isMounted = true;
        if (filename) {
            fetchImage(`download-file/${filename}/${folder}`).then(url => {
                if (isMounted) {
                    setImgUrl(url);
                }
            })
        } else {
            setImgUrl('');
        }
        return () => { isMounted = false };
    }, [filename])

    if (!imgUrl) {
        return <div>Loading...</div>
    }
    return <Image
        src={imgUrl}
        {...other}
    />

}