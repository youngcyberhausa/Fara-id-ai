import { useState, useEffect } from "react";
import { announcementsApi } from "../api";

function getEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return null;
}

export default function NotificationBanner() {
  const [ann, setAnn] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    announcementsApi
      .getActive()
      .then((data) => {
        if (!data) return;
        const seenKey = `faraid_ann_dismissed_${data.id}`;
        if (localStorage.getItem(seenKey)) return;
        setAnn(data);
      })
      .catch(() => {});
  }, []);

  if (!ann || dismissed) return null;

  function dismiss() {
    localStorage.setItem(`faraid_ann_dismissed_${ann.id}`, "1");
    setDismissed(true);
  }

  const embedUrl = getEmbedUrl(ann.video_url);
  const isDirectVideo = ann.video_url && !embedUrl;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {embedUrl && (
          <div className="aspect-video bg-black">
            <iframe
              src={embedUrl}
              title={ann.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {isDirectVideo && (
          <video src={ann.video_url} controls className="w-full max-h-64 bg-black" />
        )}
        <div className="p-5">
          <h3 className="text-base font-semibold text-gray-900">{ann.title}</h3>
          {ann.message && (
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{ann.message}</p>
          )}
          <button
            onClick={dismiss}
            className="mt-4 w-full bg-brand-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-700"
          >
            Ok, na gani
          </button>
        </div>
      </div>
    </div>
  );
}
