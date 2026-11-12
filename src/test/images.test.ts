import { describe, expect, it } from "vitest";
import { cld, initials } from "@/lib/cloudinary";
import { clampCrop, drawCrop, INITIAL_CROP, rotatedSize, scaleFor, zoomAt } from "@/lib/imageCrop";

const URL_ = "https://res.cloudinary.com/demo/image/upload/v12/bloodlink/users/7/avatar.webp";

describe("cld", () => {
  it("inserts a delivery transformation after /image/upload/", () => {
    expect(cld(URL_, { w: 96, h: 96, gravity: "face" })).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/v12/bloodlink/users/7/avatar.webp",
    );
  });
  it("leaves other URLs alone", () => {
    expect(cld("https://example.com/a.png", { w: 10 })).toBe("https://example.com/a.png");
    expect(cld(undefined)).toBeUndefined();
  });
  it("makes initials", () => {
    expect(initials("Rahim Uddin Khan")).toBe("RK");
    expect(initials("nusrat")).toBe("N");
    expect(initials("")).toBe("?");
  });
});

describe("crop geometry", () => {
  const img = { width: 2000, height: 1000 }; // landscape
  const frame = { width: 300, height: 300 }; // square avatar frame

  it("covers the frame at zoom 1", () => {
    // the short side (height) fills the frame
    expect(scaleFor(img, frame, INITIAL_CROP)).toBeCloseTo(0.3);
    expect(rotatedSize(img, 90)).toEqual({ width: 1000, height: 2000 });
    expect(scaleFor(img, frame, { zoom: 1, rotation: 90 })).toBeCloseTo(0.3);
  });

  it("never lets the image leave a gap", () => {
    // at zoom 1 the image is 600x300: it can move 150px sideways, not at all vertically
    expect(clampCrop(img, frame, { ...INITIAL_CROP, x: 999, y: 999 })).toEqual({ zoom: 1, rotation: 0, x: 150, y: 0 });
    expect(clampCrop(img, frame, { ...INITIAL_CROP, zoom: 10 }).zoom).toBe(4);
    expect(clampCrop(img, frame, { ...INITIAL_CROP, zoom: 0.2 }).zoom).toBe(1);
  });

  it("zooms around a point", () => {
    // zooming 2x around the frame centre keeps the image centred
    expect(zoomAt(img, frame, INITIAL_CROP, 2)).toEqual({ zoom: 2, rotation: 0, x: 0, y: 0 });
    // around a point 100px right of centre, the image moves left to keep that point fixed
    const z = zoomAt(img, frame, INITIAL_CROP, 2, 100, 0);
    expect(z.x).toBe(-100);
  });

  it("draws the framed area at the output size", () => {
    const calls: unknown[][] = [];
    const ctx = new Proxy(
      {},
      {
        get: (_, key) =>
          key === "drawImage" || key === "translate" || key === "rotate"
            ? (...args: unknown[]) => calls.push([key, ...args])
            : () => undefined,
        set: () => true,
      },
    ) as unknown as CanvasRenderingContext2D;
    const source = {} as CanvasImageSource;

    drawCrop(ctx, source, img, frame, { zoom: 1, rotation: 0, x: 150, y: 0 }, { width: 600, height: 600 });
    // output is 2x the frame: image scaled to 1200x600, centre moved 300px right
    expect(calls).toEqual([
      ["translate", 600, 300],
      ["rotate", 0],
      ["drawImage", source, -600, -300, 1200, 600],
    ]);
  });
});
