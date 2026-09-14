/** Coalesce seeks while the decoder is busy; the latest scroll target always wins. */
export function createVideoScrubber(video: HTMLVideoElement, onFailure: () => void) {
  let target = 0;
  let frame = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let failed = false;
  const fail = () => {
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    clearTimeout(timeout);
    onFailure();
  };
  const schedule = () => {
    if (disposed || failed || frame || video.seeking || !Number.isFinite(video.duration) || video.duration <= 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed || failed || video.seeking) return;
      const time = Math.min(Math.max(0, video.duration - 1 / 60), target * video.duration);
      if (Math.abs(video.currentTime - time) < 1 / 30) return;
      try { video.currentTime = time; }
      catch { fail(); return; }
      clearTimeout(timeout);
      timeout = setTimeout(fail, 2500);
    });
  };
  const settled = () => { clearTimeout(timeout); schedule(); };
  video.addEventListener("loadedmetadata", schedule);
  video.addEventListener("loadeddata", schedule);
  video.addEventListener("seeked", settled);
  video.addEventListener("error", fail);
  return {
    seek(progress: number) { target = Math.max(0, Math.min(1, progress)); schedule(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", schedule);
      video.removeEventListener("loadeddata", schedule);
      video.removeEventListener("seeked", settled);
      video.removeEventListener("error", fail);
    },
  };
}
