import { createVideoScrubber } from "@/features/home/rebuild/videoScrub";
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
let dispose: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  frames = new Map(); sequence = 0;
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(cb => { frames.set(++sequence, cb); return sequence; });
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
});
afterEach(() => { dispose?.(); dispose = undefined; vi.restoreAllMocks(); vi.useRealTimers(); });
function setup(duration = 12) {
  const video = document.createElement("video");
  let time = 0;
  let seeking = false;
  const writes: number[] = [];
  Object.defineProperties(video, {
    duration: { value: duration, configurable: true },
    seeking: { get: () => seeking },
    currentTime: { get: () => time, set: (value: number) => { time = value; writes.push(value); seeking = true; }, configurable: true },
  });
  const fail = vi.fn();
  const scrub = createVideoScrubber(video, fail);
  dispose = scrub.dispose;
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(0)); };
  const settled = () => { seeking = false; video.dispatchEvent(new Event("seeked")); };
  return { video, writes, fail, scrub, flush, settled };
}
test("coalesces many scroll updates into the latest target", () => {
  const h = setup();
  h.scrub.seek(0.1); h.scrub.seek(0.2); h.scrub.seek(0.5);
  expect(frames.size).toBe(1); h.flush(); expect(h.writes).toEqual([6]);
});
test("reversing while the decoder is busy keeps the latest reverse target", () => {
  const h = setup(); h.scrub.seek(0.8); h.flush();
  h.scrub.seek(0.7); h.scrub.seek(0.2); h.flush();
  expect(h.writes).toHaveLength(1); expect(h.writes[0]).toBeCloseTo(9.6);
  h.settled(); h.flush(); expect(h.writes[1]).toBeCloseTo(2.4);
});
test.each([NaN, 0, Infinity])("waits for usable metadata when duration is %s", duration => {
  const h = setup(duration); h.scrub.seek(0.5); h.flush(); expect(h.writes).toEqual([]);
  Object.defineProperty(h.video, "duration", { value: 20 });
  h.video.dispatchEvent(new Event("loadedmetadata")); h.flush(); expect(h.writes).toEqual([10]);
});
test("the final frame is seekable without overshooting the video", () => {
  const h = setup(); h.scrub.seek(2); h.flush(); expect(h.writes[0]).toBeCloseTo(12 - 1 / 60);
});
test("negative progress returns to the beginning", () => {
  const h = setup(); h.scrub.seek(0.5); h.flush(); h.settled(); h.scrub.seek(-1); h.flush(); expect(h.writes).toEqual([6, 0]);
});
test("settled repeated targets do not seek again", () => {
  const h = setup(); h.scrub.seek(0.5); h.flush(); h.settled(); h.scrub.seek(0.5); h.flush(); expect(h.writes).toEqual([6]);
});
test("a stalled seek reports failure, enabling poster fallback", () => {
  const h = setup(); h.scrub.seek(0.5); h.flush(); vi.advanceTimersByTime(2500); expect(h.fail).toHaveBeenCalledOnce();
});
test("a completed seek cancels its failure deadline", () => {
  const h = setup(); h.scrub.seek(0.5); h.flush(); h.settled(); vi.advanceTimersByTime(3000); expect(h.fail).not.toHaveBeenCalled();
});
test("decoder errors report fallback", () => {
  const h = setup(); h.video.dispatchEvent(new Event("error")); expect(h.fail).toHaveBeenCalledOnce();
});
test("a rejected currentTime assignment reports fallback", () => {
  const h = setup(); Object.defineProperty(h.video, "currentTime", { get: () => 0, set: () => { throw new Error("seek rejected"); } });
  h.scrub.seek(0.5); h.flush(); expect(h.fail).toHaveBeenCalledOnce();
});
test("unmount cancels pending work and removes video listeners", () => {
  const h = setup(); h.scrub.seek(0.5); h.scrub.dispose(); h.flush();
  h.video.dispatchEvent(new Event("loadedmetadata")); h.video.dispatchEvent(new Event("error"));
  vi.advanceTimersByTime(3000); expect(h.writes).toEqual([]); expect(h.fail).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
});
