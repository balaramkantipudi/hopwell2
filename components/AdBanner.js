// components/AdBanner.js
import { useEffect } from 'react';

const AdBanner = ({ format = 'auto', slot }) => {
  useEffect(() => {
    try {
      // Only add the script if window.adsbygoogle is not defined
      if (window.adsbygoogle === undefined) {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.adClient = 'ca-pub-YOUR_ADSENSE_ID'; // Replace with your AdSense ID
        document.head.appendChild(script);
      }
      
      // Push the ad after the script has loaded
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="ad-container my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_ADSENSE_ID" // Replace with your AdSense ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;