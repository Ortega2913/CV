#!/usr/bin/env python3
"""
Lagoinha Fraud Documentary — Motion Graphics Renderer
Output: lagoinha_fraud.mp4  (1920×1080, 30 fps, ~10:30)
"""

import math
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ──────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────────────────────────────────────────

W, H, FPS = 1920, 1080, 30

C_BLACK    = (10,  10,  15)
C_CRIMSON  = (192, 57,  43)
C_GOLD     = (201, 168, 76)
C_ASH      = (240, 237, 232)
C_STEEL    = (123, 143, 161)
C_DARKRED  = (100, 0,   0)
C_DARKGRAY = (26,  26,  31)

F_BOLD  = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F_REG   = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
F_MONO  = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
F_SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"

# Font cache — avoids re-loading every frame
_font_cache: dict = {}

def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    key = (path, size)
    if key not in _font_cache:
        try:
            _font_cache[key] = ImageFont.truetype(path, size)
        except Exception:
            _font_cache[key] = ImageFont.load_default()
    return _font_cache[key]


# ──────────────────────────────────────────────────────────────────────────────
# MATH / EASING
# ──────────────────────────────────────────────────────────────────────────────

def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))

def lerp(a, b, t):
    return a + (b - a) * clamp(t)

def ease_out(t):
    t = clamp(t)
    return 1.0 - (1.0 - t) ** 3

def ease_in_out(t):
    t = clamp(t)
    return t * t * (3.0 - 2.0 * t)

def ease_out_bounce(t):
    t = clamp(t)
    if   t < 1 / 2.75:  return 7.5625 * t * t
    elif t < 2 / 2.75:  t -= 1.5 / 2.75;  return 7.5625 * t * t + 0.75
    elif t < 2.5/ 2.75: t -= 2.25/ 2.75;  return 7.5625 * t * t + 0.9375
    else:                t -= 2.625/2.75;  return 7.5625 * t * t + 0.984375

def lerp_color(c1, c2, t):
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))

def prog(f, start, dur=20):
    """Normalised 0→1 progress: starts at frame `start`, lasts `dur` frames."""
    return clamp((f - start) / max(dur, 1))

def a255(t):
    """Float 0-1 → int 0-255."""
    return int(clamp(t) * 255)


# ──────────────────────────────────────────────────────────────────────────────
# IMAGE PRIMITIVES
# ──────────────────────────────────────────────────────────────────────────────

def new_rgba() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))

def gradient_bg(c1, c2, direction="v") -> Image.Image:
    arr = np.zeros((H, W, 4), dtype=np.float32)
    t = (np.linspace(0, 1, H)[:, None] if direction == "v"
         else np.linspace(0, 1, W)[None, :])
    for i in range(3):
        arr[:, :, i] = c1[i] * (1 - t) + c2[i] * t
    arr[:, :, 3] = 255
    return Image.fromarray(arr.astype(np.uint8), "RGBA")

def radial_bg(c_center, c_edge) -> Image.Image:
    ys = np.linspace(-1, 1, H)
    xs = np.linspace(-1, 1, W)
    X, Y = np.meshgrid(xs, ys)
    d = np.clip(np.sqrt(X**2 * (H/W)**2 + Y**2), 0, 1)[:, :, None]
    c1 = np.array(list(c_center) + [255], dtype=np.float32)
    c2 = np.array(list(c_edge)   + [255], dtype=np.float32)
    arr = (c1 * (1 - d) + c2 * d).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")

def vignette(img: Image.Image, strength=0.5) -> Image.Image:
    ys = np.linspace(-1, 1, H)
    xs = np.linspace(-1, 1, W)
    X, Y = np.meshgrid(xs, ys)
    d = np.sqrt(X**2 + Y**2) / 1.4142
    mask_f = np.clip(d ** 1.5 * strength, 0, 1)
    arr = np.array(img, dtype=np.float32)
    arr[:, :, :3] *= (1 - mask_f[:, :, None])
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")

def grain(img: Image.Image, intensity=8, seed=0) -> Image.Image:
    rng = np.random.default_rng(seed % 65537)
    arr = np.array(img, dtype=np.int16)
    g = rng.integers(-intensity, intensity + 1, (H, W, 1), dtype=np.int16)
    arr[:, :, :3] = np.clip(arr[:, :, :3] + g, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")

def composite(base: Image.Image, layer: Image.Image) -> Image.Image:
    return Image.alpha_composite(base.convert("RGBA"), layer.convert("RGBA"))

def to_rgb_bytes(img: Image.Image) -> bytes:
    return img.convert("RGB").tobytes()

def text_size(txt, fp, sz):
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bb = d.textbbox((0, 0), txt, font=font(fp, sz))
    return bb[2] - bb[0], bb[3] - bb[1]


# ──────────────────────────────────────────────────────────────────────────────
# DRAWING HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def put_text(draw, txt, x, y, fp, sz, color, alpha=1.0, anchor="lt"):
    r, g, b = color
    draw.text((x, y), txt, font=font(fp, sz),
              fill=(r, g, b, a255(alpha)), anchor=anchor)

def center_text(draw, txt, y, fp, sz, color, alpha=1.0, offset_y=0):
    tw, _ = text_size(txt, fp, sz)
    put_text(draw, txt, W // 2 - tw // 2, y + offset_y, fp, sz, color, alpha)

def hline(draw, x1, x2, y, color, alpha=1.0, width=3):
    r, g, b = color
    draw.line([(x1, y), (x2, y)], fill=(r, g, b, a255(alpha)), width=width)

def animated_hline(draw, x1, max_w, y, t, color, alpha=1.0, width=3):
    hline(draw, x1, x1 + int(max_w * ease_out(t)), y, color, alpha, width)

def rect_outline(draw, x1, y1, x2, y2, color, alpha=1.0, width=2):
    r, g, b = color
    draw.rectangle([x1, y1, x2, y2], outline=(r, g, b, a255(alpha)), width=width)

def rect_fill(draw, x1, y1, x2, y2, color, alpha=1.0):
    r, g, b = color
    draw.rectangle([x1, y1, x2, y2], fill=(r, g, b, a255(alpha)))

def circle(draw, cx, cy, r, color, alpha=1.0, fill_color=None, width=2):
    rc, gc, bc = color
    fc = (*(fill_color or C_BLACK), a255(alpha * 0.3)) if fill_color else None
    draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                 outline=(rc, gc, bc, a255(alpha)),
                 fill=fc, width=width)

def section_header(draw, title, f, color=C_ASH):
    """Animated section heading at top-left, always present."""
    t = ease_out(prog(f, 0, 15))
    put_text(draw, title, 120, 80, F_BOLD, 58, color, t)
    animated_hline(draw, 120, 600, 145, prog(f, 5, 20), color, t)


# ──────────────────────────────────────────────────────────────────────────────
# SCENE BASE
# ──────────────────────────────────────────────────────────────────────────────

class Scene:
    def __init__(self, s, e):
        self.start_frame = int(s * FPS)
        self.end_frame   = int(e * FPS)
        self.duration    = max(1, self.end_frame - self.start_frame)

    def render(self, f: int) -> Image.Image:
        raise NotImplementedError


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 1 — HOOK  0:00–0:10
# ──────────────────────────────────────────────────────────────────────────────

class HookScene(Scene):
    CLIP_DUR = 20  # frames per "B-roll" cut

    def __init__(self):
        super().__init__(0, 10)
        self._clips = [self._broll(i) for i in range(7)]

    def _broll(self, i):
        palettes = [
            (C_CRIMSON, C_BLACK), ((40, 20, 20), C_BLACK),
            (C_GOLD, (50, 40, 10)), (C_DARKRED, C_BLACK),
            (C_STEEL, (10, 15, 30)), (C_DARKGRAY, C_CRIMSON),
            (C_BLACK, (30, 20, 5)),
        ]
        words = ["FRAUDE", "BILHÕES", "CHURCH", "FRAUD",
                 "MILLIONS", "SCANDAL", "DECEPTION"]
        img = radial_bg(*palettes[i])
        draw = ImageDraw.Draw(img)
        rng = np.random.default_rng(i * 17)
        for _ in range(int(rng.integers(4, 9))):
            rx, ry = int(rng.integers(0, W)), int(rng.integers(0, H))
            rw, rh = int(rng.integers(60, 420)), int(rng.integers(60, 300))
            draw.rectangle([rx, ry, rx + rw, ry + rh],
                           outline=(*C_ASH, int(rng.integers(18, 55))), width=2)
        sz = int(rng.integers(50, 130))
        tx, ty = int(rng.integers(80, W - 300)), int(rng.integers(80, H - 200))
        draw.text((tx, ty), words[i], font=font(F_BOLD, sz),
                  fill=(*C_ASH, 35))
        return vignette(img, 0.85)

    def render(self, f):
        MONTAGE_END = 185
        TITLE_START = 180

        clip_idx = min(f // self.CLIP_DUR, len(self._clips) - 1)
        clip_f   = f % self.CLIP_DUR

        if f < MONTAGE_END:
            base = self._clips[clip_idx].copy()
            if clip_f < 3:
                flash = Image.new("RGBA", (W, H),
                                  (255, 255, 255, int((1 - clip_f / 3) * 60)))
                base = Image.alpha_composite(base, flash)
        else:
            base = Image.new("RGBA", (W, H), (*C_BLACK, 255))

        if f >= TITLE_START:
            tt = (f - TITLE_START) / (self.duration - TITLE_START)
            overlay = new_rgba()
            draw    = ImageDraw.Draw(overlay)

            # Dark wash
            if f < MONTAGE_END:
                dark_a = a255(ease_in_out(prog(f, TITLE_START, 15)))
                draw.rectangle([0, 0, W, H], fill=(*C_BLACK, dark_a))

            slam = ease_out_bounce(clamp(tt * 5))
            slam_y = int(lerp(-180, H // 2 - 110, slam))

            line1_a = ease_out(clamp(tt * 6))
            line2_a = ease_out(clamp((tt - 0.12) * 6))

            w1, h1 = text_size("THE BILLION DOLLAR", F_BOLD, 68)
            w2, h2 = text_size("DECEPTION", F_BOLD, 108)

            put_text(draw, "THE BILLION DOLLAR",
                     W // 2 - w1 // 2, slam_y, F_BOLD, 68, C_ASH, line1_a)
            put_text(draw, "DECEPTION",
                     W // 2 - w2 // 2, slam_y + h1 + 8,
                     F_BOLD, 108, C_CRIMSON, line2_a)

            if tt > 0.3:
                lp = ease_out(prog(int(tt * self.duration), int(0.3 * self.duration), 18))
                ly = slam_y + h1 + h2 + 20
                hline(draw, W // 2 - w2 // 2,
                      W // 2 - w2 // 2 + int(w2 * lp), ly,
                      C_CRIMSON, line2_a, 4)

            base = composite(base, overlay)

        base = grain(base, 8, f)
        base = vignette(base, 0.4)
        return base


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 2 — CHAPTER CARDS  (reusable)
# ──────────────────────────────────────────────────────────────────────────────

class ChapterCard(Scene):
    def __init__(self, s, e, num, title, subtitle=""):
        super().__init__(s, e)
        self.num, self.title, self.subtitle = num, title, subtitle

    def render(self, f):
        t = f / self.duration
        base = radial_bg((22, 18, 24), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        # Ghost number background
        ghost_a = a255(ease_out(clamp(t * 5)) * 0.10)
        num_str = f"{self.num:02d}"
        nw, _ = text_size(num_str, F_BOLD, 220)
        put_text(draw, num_str, W // 2 - nw // 2, H // 2 - 155,
                 F_BOLD, 220, C_STEEL, ease_out(clamp(t * 5)) * 0.10)

        # Crimson rule
        animated_hline(draw, W // 2 - 320, 640, H // 2 - 18,
                       prog(f, 0, 18), C_CRIMSON, 1.0, 3)

        # Title
        ta = ease_out(prog(f, 5, 20))
        oy = int(lerp(28, 0, ta))
        tw, _ = text_size(self.title, F_BOLD, 72)
        put_text(draw, self.title, W // 2 - tw // 2, H // 2 - 48 + oy,
                 F_BOLD, 72, C_ASH, ta)

        # Subtitle
        if self.subtitle:
            sa = ease_out(prog(f, 12, 20))
            sw, _ = text_size(self.subtitle, F_REG, 28)
            put_text(draw, self.subtitle, W // 2 - sw // 2, H // 2 + 38 + oy,
                     F_REG, 28, C_STEEL, sa)

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.5)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 3 — THE RISE  0:25–1:30
# ──────────────────────────────────────────────────────────────────────────────

class RiseScene(Scene):
    MILESTONES = [
        (0.00, "1950s", "Founded\nBelo Horizonte", C_GOLD),
        (0.20, "1970s", "Rapid\nGrowth",           C_ASH),
        (0.42, "1990s", "National\nReach",          C_ASH),
        (0.62, "2000s", "Global\nExpansion",        C_ASH),
        (0.82, "2010s", "Media\nEmpire",            C_STEEL),
        (1.00, "Today", "Scandal\nEmerges",         C_CRIMSON),
    ]

    def __init__(self):
        super().__init__(25, 90)

    def render(self, f):
        t = f / self.duration
        base = gradient_bg((18, 14, 10), (8, 6, 4))
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "THE RISE OF LAGOINHA", f, C_GOLD)

        # Stats block (top right)
        if t > 0.45:
            st = ease_out(clamp((t - 0.45) / 0.25))
            oy = int(lerp(20, 0, st))
            stats = [
                ("ONE OF BRAZIL'S LARGEST CHURCHES", F_BOLD, 34, C_ASH),
                ("100,000 + MEMBERS WORLDWIDE",       F_MONO, 26, C_GOLD),
                ("GLOBAL SATELLITE NETWORK",           F_REG,  24, C_STEEL),
            ]
            sy = 220
            for txt, fp, sz, col in stats:
                put_text(draw, txt, 120, sy + oy, fp, sz, col, st)
                sy += sz + 18

        # Timeline
        TL_Y  = H // 2 + 130
        TL_X1, TL_X2 = 140, W - 140
        tl_t = ease_out(clamp(t * 2.5))
        hline(draw, TL_X1, TL_X1 + int((TL_X2 - TL_X1) * tl_t),
              TL_Y, C_ASH, 0.7, 3)

        for mx, yr, lbl, col in self.MILESTONES:
            node_progress = clamp((tl_t - mx * 0.85) / 0.18)
            if node_progress <= 0:
                continue
            na = ease_out(node_progress)
            nx = int(TL_X1 + (TL_X2 - TL_X1) * mx)
            nr = int(lerp(0, 11, na))
            circle(draw, nx, TL_Y, nr, col, na, col)
            put_text(draw, yr, nx, TL_Y - 32, F_MONO, 24, col, na, anchor="mb")
            for di, dl in enumerate(lbl.split("\n")):
                put_text(draw, dl, nx, TL_Y + 26 + di * 26,
                         F_REG, 20, C_STEEL, na * 0.85, anchor="mt")

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.42)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 5 — INVESTMENT SCHEME  1:40–3:00
# ──────────────────────────────────────────────────────────────────────────────

class InvestmentScene(Scene):
    def __init__(self):
        super().__init__(100, 180)
        rng = np.random.default_rng(77)
        n   = 100
        self._px  = rng.uniform(0, W, n).astype(np.float32)
        self._py  = rng.uniform(0, H, n).astype(np.float32)
        self._pvx = rng.uniform(1.2, 3.5, n).astype(np.float32)
        self._pvy = rng.uniform(-1.8, -0.4, n).astype(np.float32)
        self._psz = rng.integers(4, 14, n)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((8, 10, 20), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "THE INVESTMENT SCHEME", f, C_CRIMSON)

        # Particles (money flowing)
        p_alpha = ease_out(clamp(t * 4))
        for i in range(len(self._px)):
            px = int((self._px[i] + self._pvx[i] * f) % W)
            py = int((self._py[i] + self._pvy[i] * f) % H + H) % H
            put_text(draw, "$", px, py, F_MONO, self._psz[i],
                     C_GOLD, p_alpha * 0.55)

        # Chart
        CX, CY = 120, 680
        CW, CH = 660, 280
        c_t = ease_out(clamp((t - 0.05) / 0.5))
        ca  = c_t

        rect_outline(draw, CX, CY - CH, CX + CW, CY, C_STEEL, ca * 0.6)
        put_text(draw, "2002", CX, CY + 8, F_REG, 18, C_STEEL, ca * 0.6)
        put_text(draw, "2015", CX + CW - 30, CY + 8, F_REG, 18, C_STEEL, ca * 0.6)

        # Market average (flat)
        mkt_y = CY - int(CH * 0.14)
        hline(draw, CX, CX + int(CW * c_t), mkt_y, C_STEEL, ca * 0.4, 2)
        put_text(draw, "MARKET AVG", CX + 8, mkt_y - 22, F_REG, 16, C_STEEL, ca * 0.4)

        # Scheme line (parabolic)
        steps = max(2, int(CW * c_t))
        pts   = [(CX + i, CY - int(CH * (0.04 + (i / CW) ** 1.7 * 0.94)))
                 for i in range(steps)]
        pts   = [(x, max(CY - CH + 2, min(CY, y))) for x, y in pts]
        if len(pts) >= 2:
            r, g, b = C_GOLD
            draw.line(pts, fill=(r, g, b, a255(ca)), width=3)

        # Labels
        if t > 0.30:
            la = ease_out(clamp((t - 0.30) / 0.18))
            oy = int(lerp(20, 0, la))
            put_text(draw, "GUARANTEED RETURNS!", 860, 250 + oy,
                     F_BOLD, 64, C_CRIMSON, la)
            put_text(draw, "DOUBLE-DIGIT %",      860, 326 + oy,
                     F_BOLD, 44, C_GOLD, la)
            if t > 0.55:
                st = ease_out(clamp((t - 0.55) / 0.2))
                gw, _ = text_size("GUARANTEED RETURNS!", F_BOLD, 64)
                hline(draw, 860, 860 + int(gw * st), 284, C_CRIMSON, la * 0.9, 5)

        # Counter
        if t > 0.58:
            ct = clamp((t - 0.58) / 0.38)
            vals = [1, 10, 100, 500]
            idx  = min(int(ct * len(vals)), len(vals) - 1)
            frac = ct * len(vals) - int(ct * len(vals))
            val  = int(lerp(vals[idx],
                            vals[min(idx + 1, len(vals) - 1)], frac))
            sfx  = "M+" if val >= 500 else "M"
            c_a  = ease_out(clamp((t - 0.58) * 6))
            put_text(draw, "TOTAL INVESTED", 1320, 500, F_REG, 20, C_STEEL, c_a)
            put_text(draw, f"${val}{sfx}",   1280, 530, F_MONO, 108, C_GOLD, c_a)

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.44)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 7 — THE PLAYERS  3:10–4:30
# ──────────────────────────────────────────────────────────────────────────────

class PlayersScene(Scene):
    CARDS = [
        (100,  220, "LEADERSHIP",         "Public face of the church",    C_GOLD),
        (660,  220, "FINANCIAL 'GURUS'",  "Investment operators",         C_CRIMSON),
        (1220, 220, "SHELL ENTITIES",     "Affiliated financial vehicles", C_STEEL),
    ]

    def __init__(self):
        super().__init__(190, 270)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((14, 12, 10), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "THE PLAYERS", f, C_GOLD)

        for delay_idx, (cx, cy, title, sub, col) in enumerate(self.CARDS):
            d = 0.08 + delay_idx * 0.12
            ca = ease_out(clamp((t - d) / 0.22))
            if ca <= 0:
                continue
            CW, CH = 480, 320

            rect_outline(draw, cx, cy, cx + CW, cy + CH, col, ca, 2)
            rect_fill(draw, cx, cy, cx + CW, cy + 5, col, ca)

            # Silhouette
            bx = cx + CW // 2
            circle(draw, bx, cy + 60, 38, col, ca * 0.8)
            r, g, b = col
            a = a255(ca * 0.5)
            draw.line([(bx, cy + 110), (bx, cy + 190)],
                      fill=(r, g, b, a), width=3)
            draw.line([(bx - 40, cy + 140), (bx + 40, cy + 140)],
                      fill=(r, g, b, a), width=3)

            tw, _ = text_size(title, F_BOLD, 32)
            put_text(draw, title, cx + CW // 2 - tw // 2, cy + 200,
                     F_BOLD, 32, col, ca)
            sw, _ = text_size(sub, F_REG, 20)
            put_text(draw, sub, cx + CW // 2 - sw // 2, cy + 244,
                     F_REG, 20, C_STEEL, ca * 0.8)

        # Network connections
        if t > 0.42:
            net_t = ease_out(clamp((t - 0.42) / 0.3))
            cx1, cx2, cx3 = 340, 900, 1460
            cy_m = 580
            hline(draw, cx1, cx1 + int((cx2 - cx1) * net_t), cy_m,
                  C_GOLD, net_t * 0.7, 2)
            hline(draw, cx2, cx2 + int((cx3 - cx2) * net_t), cy_m,
                  C_CRIMSON, net_t * 0.7, 2)
            if net_t > 0.75:
                la = ease_out(clamp((net_t - 0.75) / 0.25))
                mw, _ = text_size("MONEY FLOW →", F_MONO, 22)
                put_text(draw, "MONEY FLOW →",
                         W // 2 - mw // 2, cy_m - 30, F_MONO, 22, C_GOLD, la)

        # Pull quote
        if t > 0.68:
            qa = ease_out(clamp((t - 0.68) / 0.25))
            oy = int(lerp(16, 0, qa))
            quote = '"…attributed success to divine intervention."'
            qw, _ = text_size(quote, F_SERIF, 30)
            put_text(draw, quote, W // 2 - qw // 2, 710 + oy,
                     F_SERIF, 30, C_STEEL, qa * 0.85)

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.44)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 9 — CRACKS  4:40–6:00
# ──────────────────────────────────────────────────────────────────────────────

class CracksScene(Scene):
    STATUSES = [
        (0.00, 0.28, "ACTIVE",               (40, 180, 90)),
        (0.28, 0.48, "PENDING REVIEW",        (210, 160, 30)),
        (0.48, 0.68, "WITHDRAWAL RESTRICTED", (210, 100, 20)),
        (0.68, 1.00, "ACCOUNT FROZEN",        C_CRIMSON),
    ]

    def __init__(self):
        super().__init__(280, 360)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((12, 10, 14), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "CRACKS BEGIN TO SHOW", f, C_CRIMSON)

        # Dashboard
        DB_X, DB_Y = 100, 215
        DW, DH     = 640, 490
        db_a = ease_out(clamp(t * 8))

        rect_outline(draw, DB_X, DB_Y, DB_X + DW, DB_Y + DH, C_STEEL, db_a * 0.6)
        put_text(draw, "INVESTMENT ACCOUNT PORTAL",
                 DB_X + 18, DB_Y + 12, F_MONO, 22, C_STEEL, db_a * 0.7)
        hline(draw, DB_X, DB_X + DW, DB_Y + 48, C_STEEL, db_a * 0.3, 1)

        rows = [
            ("Account ID",     "LGH-2847631"),
            ("Balance",        "$247,832.00"),
            ("Total Invested", "$180,000.00"),
            ("Last Payout",    "2014-03-12" if t < 0.38 else "---"),
        ]
        ry = DB_Y + 66
        for lbl, val in rows:
            put_text(draw, lbl + ":", DB_X + 18, ry, F_REG, 20, C_STEEL, db_a * 0.7)
            put_text(draw, val,        DB_X + 290, ry, F_MONO, 22, C_ASH,  db_a * 0.9)
            hline(draw, DB_X + 18, DB_X + DW - 18, ry + 30,
                  C_STEEL, db_a * 0.2, 1)
            ry += 58

        # Status badge
        status_text, status_color = "ACTIVE", (40, 180, 90)
        for ss, se, st2, sc in self.STATUSES:
            if ss <= t:
                status_text, status_color = st2, sc
        blink = not (t > 0.68 and (f // 6) % 2 == 0)
        if blink:
            sw, sh = text_size(status_text, F_BOLD, 28)
            rect_fill(draw, DB_X + 18, ry, DB_X + 26 + sw, ry + 40,
                      status_color, db_a * 0.2)
            rect_outline(draw, DB_X + 18, ry, DB_X + 26 + sw, ry + 40,
                         status_color, db_a, 2)
            put_text(draw, status_text, DB_X + 22, ry + 5,
                     F_BOLD, 28, status_color, db_a)

        # Warning labels (right)
        warnings = [
            (0.20, "PAYOUT DELAYS",      C_CRIMSON, 840, 280),
            (0.38, "WITHDRAWAL HURDLES", C_CRIMSON, 840, 380),
            (0.58, "INVESTOR PANIC",     C_DARKRED,  840, 480),
        ]
        for ws, wt, wc, wx, wy in warnings:
            if t > ws:
                wa = ease_out(clamp((t - ws) / 0.18))
                oy = int(lerp(22, 0, wa))
                put_text(draw, wt, wx, wy + oy, F_BOLD, 52, wc, wa)

        # EVERYTHING shatters
        if t > 0.78:
            ev_t  = ease_out(clamp((t - 0.78) / 0.14))
            crack = clamp((t - 0.88) / 0.10)
            ev_a  = 1.0 - crack * 0.45
            shift = int(crack * 8)
            ew, eh = text_size("EVERYTHING", F_BOLD, 116)
            ex = W // 2 - ew // 2
            put_text(draw, "EVERYTHING", ex, 820 - shift,
                     F_BOLD, 116, C_ASH, ev_a * ev_t)
            if crack > 0:
                cw2 = int(ew * clamp(crack * 3))
                hline(draw, ex, ex + cw2, 820 + 58, C_CRIMSON, 0.9, 3)

        img = composite(base, ov)
        img = grain(img, 6, f)
        img = vignette(img, 0.48)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 11 — UNRAVELING  6:10–7:30
# ──────────────────────────────────────────────────────────────────────────────

class UnravelingScene(Scene):
    HEADLINES = (
        "LAGOINHA INVESTMENT PROGRAM UNDER INVESTIGATION  ///  "
        "HUNDREDS OF MILLIONS IN QUESTION  ///  INVESTIGATORS ENTER CHURCH OFFICES  ///  "
        "CLASS ACTION LAWSUIT BEING ORGANIZED  ///  REGULATORS LAUNCH PROBE  ///  "
    )

    def __init__(self):
        super().__init__(370, 450)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((8, 8, 16), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "THE UNRAVELING", f, C_CRIMSON)

        # Ponzi diagram
        CX, CY = 500, 530
        if t > 0.08:
            pd_t   = ease_out(clamp((t - 0.08) / 0.38))
            heat   = clamp((t - 0.48) / 0.40)
            rings  = [
                (280, "NEW INVESTORS", lerp_color(C_STEEL,   C_CRIMSON, heat)),
                (175, "OPERATORS",     lerp_color(C_GOLD,    C_DARKRED, heat)),
                (88,  "PREV. INVESTORS", lerp_color(C_ASH,   C_CRIMSON, heat)),
            ]
            for radius, lbl, col in rings:
                r   = int(radius * pd_t)
                circle(draw, CX, CY, r, col, pd_t * 0.9, width=3)
                if pd_t > 0.55:
                    la = ease_out(clamp((pd_t - 0.55) / 0.3))
                    put_text(draw, lbl, CX + int(radius * 0.72), CY - 10,
                             F_REG, 18, col, la * 0.85)

            # Rotating arrow dots
            if pd_t > 0.58:
                at = clamp((pd_t - 0.58) / 0.28)
                for ri, rad in enumerate([220, 132]):
                    for ai in range(4):
                        ang = math.radians(ai * 90 + f * 1.4 * (1 if ri == 0 else -1))
                        ax  = CX + int(rad * math.cos(ang))
                        ay  = CY + int(rad * math.sin(ang))
                        circle(draw, ax, ay, 8, C_GOLD, at * 0.85, fill_color=C_GOLD, width=0)

            # DEFICIT label
            if t > 0.60:
                da = ease_out(clamp((t - 0.60) / 0.2))
                blink3 = not (t > 0.78 and (f // 5) % 2 == 0)
                if blink3:
                    dw, _ = text_size("DEFICIT", F_BOLD, 38)
                    put_text(draw, "DEFICIT", CX - dw // 2, CY - 22,
                             F_BOLD, 38, C_CRIMSON, da)

        # Right-side labels
        label_seq = [
            (0.04, "PONZI SCHEME\nALLEGATIONS",  C_CRIMSON, 980, 195, F_BOLD, 54),
            (0.28, "REGULATORY\nINVESTIGATIONS", C_STEEL,   980, 370, F_BOLD, 44),
            (0.52, "HUNDREDS OF\nMILLIONS LOST", C_GOLD,    980, 528, F_BOLD, 44),
            (0.70, "THOUSANDS\nOF VICTIMS",       C_CRIMSON, 980, 686, F_BOLD, 44),
        ]
        for ls, lt, lc, lx, ly, lfp, lsz in label_seq:
            if t > ls:
                la = ease_out(clamp((t - ls) / 0.18))
                oy = int(lerp(18, 0, la))
                for li, line in enumerate(lt.split("\n")):
                    put_text(draw, line, lx, ly + li * (lsz + 6) + oy,
                             lfp, lsz, lc, la)

        # News ticker
        TICKER_Y = H - 52
        rect_fill(draw, 0, TICKER_Y, W, H, C_CRIMSON,
                  ease_out(clamp(t * 8)))
        if t > 0.02:
            tw, _ = text_size(self.HEADLINES, F_BOLD, 22)
            sx = int(W - (f * 4.5) % (W + tw))
            put_text(draw, self.HEADLINES, sx, TICKER_Y + 12,
                     F_BOLD, 22, C_ASH, ease_out(clamp(t * 8)))

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.44)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 13 — AFTERMATH  7:40–8:45
# ──────────────────────────────────────────────────────────────────────────────

class AftermathScene(Scene):
    COLS, ROWS = 32, 16   # 512 dots × 100 = ~51 200 victims

    def __init__(self):
        super().__init__(460, 525)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((12, 10, 8), (6, 5, 4))
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "THE AFTERMATH", f, C_STEEL)

        # Victim grid
        GX, GY   = 880, 200
        DOT, GAP = 12, 6
        TOTAL    = self.COLS * self.ROWS
        visible  = int(TOTAL * ease_out(clamp((t - 0.03) / 0.45)))
        infected = int(TOTAL * clamp((t - 0.38) / 0.50))

        for i in range(visible):
            row = i // self.COLS
            col = i  % self.COLS
            dx  = GX + col * (DOT + GAP)
            dy  = GY + row * (DOT + GAP)
            col_rgb = C_CRIMSON if i < infected else C_STEEL
            r, g, b = col_rgb
            draw.ellipse([dx, dy, dx + DOT, dy + DOT],
                         fill=(r, g, b, 200))

        if t > 0.03:
            vc = min(infected, visible) * 100
            vc_a = ease_out(clamp(t * 5))
            put_text(draw,
                     f"{vc:,}+ VICTIMS (estimated)",
                     GX, GY + self.ROWS * (DOT + GAP) + 14,
                     F_MONO, 24, C_CRIMSON, vc_a)

        # Left text cards
        left_items = [
            (0.04,  "CLASS ACTION\nLAWSUITS", C_STEEL,   120, 220, F_BOLD, 52),
            (0.22,  "FINANCIAL RUIN",          C_CRIMSON, 120, 435, F_BOLD, 52),
            (0.42,  "TRUST DESTROYED",         C_DARKRED,  120, 540, F_BOLD, 52),
        ]
        for ls, lt, lc, lx, ly, lfp, lsz in left_items:
            if t > ls:
                la = ease_out(clamp((t - ls) / 0.18))
                oy = int(lerp(16, 0, la))
                for li, line in enumerate(lt.split("\n")):
                    put_text(draw, line, lx, ly + li * (lsz + 6) + oy,
                             lfp, lsz, lc, la)

        # Pull quote
        if t > 0.64:
            qa = ease_out(clamp((t - 0.64) / 0.24))
            oy = int(lerp(14, 0, qa))
            lines = [
                '"The dream of financial prosperity,',
                " sold under the guise of faith,",
                ' had turned into a nightmare."',
            ]
            for qi, ql in enumerate(lines):
                put_text(draw, ql, 120, 658 + qi * 36 + oy,
                         F_SERIF, 26, C_STEEL, qa * 0.85)

        img = composite(base, ov)
        img = grain(img, 4, f)
        img = vignette(img, 0.48)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 15 — LESSONS  8:55–9:45
# ──────────────────────────────────────────────────────────────────────────────

class LessonsScene(Scene):
    LESSONS = [
        (0.08, "01", "IF IT SOUNDS TOO\nGOOD TO BE TRUE",
         "Guaranteed high returns with no risk\nis almost always a red flag.",
         C_CRIMSON, 100),
        (0.28, "02", "NEVER SKIP\nDUE DILIGENCE",
         "Trust institutions, but always verify\nindependently. Know the mechanism.",
         C_GOLD,    660),
        (0.52, "03", "DEMAND\nTRANSPARENCY",
         "Financial opacity is a warning sign.\nAccountability is non-negotiable.",
         C_STEEL,   1220),
    ]

    def __init__(self):
        super().__init__(535, 585)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((10, 12, 14), C_BLACK)
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        section_header(draw, "LESSONS LEARNED", f, C_ASH)
        animated_hline(draw, 120, 480, 145, prog(f, 5, 20), C_GOLD, 1.0, 3)

        CW = 500
        for ls, num, title, desc, col, cx in self.LESSONS:
            lt = ease_out(clamp((t - ls) / 0.20))
            if lt <= 0:
                continue
            la  = lt
            oy  = int(lerp(28, 0, lt))
            cy  = 215

            rect_outline(draw, cx, cy + oy, cx + CW, cy + 370 + oy, col, la, 2)
            rect_fill(draw, cx, cy + oy, cx + CW, cy + 6 + oy, col, la)

            # Ghost number
            put_text(draw, num, cx + 20, cy + 16 + oy, F_BOLD, 96, col, la * 0.15)

            # Title
            for ti, tl in enumerate(title.split("\n")):
                put_text(draw, tl, cx + 22, cy + 88 + ti * 54 + oy,
                         F_BOLD, 42, col, la)

            # Description
            for di, dl in enumerate(desc.split("\n")):
                put_text(draw, dl, cx + 22, cy + 208 + di * 28 + oy,
                         F_REG, 20, C_STEEL, la * 0.85)

            # Morph shield: crimson → gold
            if lt > 0.5:
                sh_t  = clamp((lt - 0.5) / 0.5)
                sh_col = lerp_color(C_CRIMSON, C_GOLD, sh_t)
                sh_a   = ease_out(sh_t)
                sx, sy = cx + CW - 68, cy + 295 + oy
                draw.polygon([(sx, sy), (sx + 44, sy), (sx + 52, sy + 22),
                               (sx + 22, sy + 62), (sx - 8, sy + 22)],
                             outline=(*sh_col, a255(sh_a * 0.9)),
                             fill=(*sh_col, a255(sh_a * 0.18)))

        # Bottom note
        if t > 0.82:
            na = ease_out(clamp((t - 0.82) / 0.16))
            note = "A CAUTIONARY TALE THAT ECHOES FAR BEYOND BRAZIL"
            nw, _ = text_size(note, F_MONO, 22)
            put_text(draw, note, W // 2 - nw // 2, 880,
                     F_MONO, 22, C_STEEL, na * 0.75)

        img = composite(base, ov)
        img = grain(img, 5, f)
        img = vignette(img, 0.40)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 16 — CTA  9:45–10:15
# ──────────────────────────────────────────────────────────────────────────────

class CTAScene(Scene):
    BUTTONS = [
        (0.30, "COMMENT BELOW",  C_CRIMSON, W // 2 - 620, "↓ Share your thoughts"),
        (0.48, "LIKE THE VIDEO", C_GOLD,    W // 2 - 110, "↑ It really helps"),
        (0.65, "SUBSCRIBE",      C_STEEL,   W // 2 + 350, "New stories weekly"),
    ]

    def __init__(self):
        super().__init__(585, 615)

    def render(self, f):
        t  = f / self.duration
        base = gradient_bg((8, 10, 12), (14, 10, 8))
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        if t > 0.04:
            qa = ease_out(clamp((t - 0.04) / 0.24))
            oy = int(lerp(18, 0, qa))
            q = "WHAT DO YOU THINK?"
            qw, _ = text_size(q, F_BOLD, 72)
            put_text(draw, q, W // 2 - qw // 2, 200 + oy,
                     F_BOLD, 72, C_ASH, qa)

        if t > 0.22:
            q2a = ease_out(clamp((t - 0.22) / 0.22))
            q2  = "What's the biggest danger when faith and finance collide?"
            q2w, _ = text_size(q2, F_SERIF, 30)
            put_text(draw, q2, W // 2 - q2w // 2, 295,
                     F_SERIF, 30, C_GOLD, q2a * 0.9)

        for bs, bl, bc, bx, bsub in self.BUTTONS:
            if t < bs:
                continue
            ba  = ease_out(clamp((t - bs) / 0.18))
            oy3 = int(lerp(18, 0, ba))
            bw, bh = text_size(bl, F_BOLD, 40)
            PAD = 22
            rect_fill(draw, bx - PAD, 490 + oy3,
                      bx + bw + PAD, 490 + bh + PAD * 2 + oy3,
                      bc, ba * 0.14)
            rect_outline(draw, bx - PAD, 490 + oy3,
                         bx + bw + PAD, 490 + bh + PAD * 2 + oy3,
                         bc, ba, 2)
            put_text(draw, bl, bx, 490 + PAD // 2 + oy3,
                     F_BOLD, 40, bc, ba)
            sw, _ = text_size(bsub, F_REG, 20)
            put_text(draw, bsub, bx + bw // 2 - sw // 2,
                     490 + bh + PAD + 8 + oy3, F_REG, 20, C_STEEL, ba * 0.55)

        img = composite(base, ov)
        img = grain(img, 4, f)
        img = vignette(img, 0.38)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# SCENE 17 — OUTRO  10:15–10:30
# ──────────────────────────────────────────────────────────────────────────────

class OutroScene(Scene):
    def __init__(self):
        super().__init__(615, 630)

    def render(self, f):
        t  = f / self.duration
        base = Image.new("RGBA", (W, H), (*C_BLACK, 255))
        ov   = new_rgba()
        draw = ImageDraw.Draw(ov)

        fi  = ease_out(clamp(t / 0.30))
        fo  = 1.0 - ease_out(clamp((t - 0.80) / 0.20))
        alpha = fi * fo

        logo = "FAITH & FRAUD"
        lw, _ = text_size(logo, F_BOLD, 84)
        put_text(draw, logo, W // 2 - lw // 2, H // 2 - 72,
                 F_BOLD, 84, C_ASH, alpha)

        lp = ease_out(clamp((t - 0.08) / 0.28))
        hline(draw, W // 2 - 220, W // 2 - 220 + int(440 * lp),
              H // 2 + 22, C_CRIMSON, alpha, 3)

        if t > 0.22:
            sa  = ease_out(clamp((t - 0.22) / 0.28)) * fo
            sub = "NEXT WEEK: ANOTHER INCREDIBLE TRUE STORY"
            sw, _ = text_size(sub, F_REG, 26)
            put_text(draw, sub, W // 2 - sw // 2, H // 2 + 46,
                     F_REG, 26, C_STEEL, sa * 0.8)
            sub2 = "SUBSCRIBE SO YOU DON'T MISS IT"
            s2w, _ = text_size(sub2, F_REG, 20)
            put_text(draw, sub2, W // 2 - s2w // 2, H // 2 + 84,
                     F_REG, 20, C_STEEL, sa * 0.45)

        img = composite(base, ov)
        img = vignette(img, 0.60)
        return img


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

def build_scene_map():
    scenes = [
        HookScene(),
        ChapterCard(10,  25,  1, "THE RISE OF LAGOINHA",
                    "Founded 1950s · Belo Horizonte, Brazil"),
        RiseScene(),
        ChapterCard(90,  100, 2, "THE INVESTMENT SCHEME",
                    "Early 2000s — The Operation Begins"),
        InvestmentScene(),
        ChapterCard(180, 190, 3, "THE PLAYERS",
                    "Who Was Behind It All"),
        PlayersScene(),
        ChapterCard(270, 280, 4, "CRACKS BEGIN TO SHOW",
                    "Delays · Panic · Questions"),
        CracksScene(),
        ChapterCard(360, 370, 5, "THE UNRAVELING",
                    "Investigators Close In"),
        UnravelingScene(),
        ChapterCard(450, 460, 6, "THE AFTERMATH",
                    "Lawsuits, Ruin & Betrayal"),
        AftermathScene(),
        ChapterCard(525, 535, 7, "LESSONS LEARNED",
                    "What This Story Teaches Us"),
        LessonsScene(),
        CTAScene(),
        OutroScene(),
    ]
    fmap: dict[int, tuple] = {}
    for sc in scenes:
        for lf in range(sc.duration):
            gf = sc.start_frame + lf
            if 0 <= gf < 630 * FPS:
                fmap[gf] = (sc, lf)
    return fmap


def main():
    out = "/home/user/CV/lagoinha_fraud.mp4"
    total = 630 * FPS          # 18 900 frames

    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{W}x{H}", "-pix_fmt", "rgb24", "-r", str(FPS),
        "-i", "pipe:0",
        "-c:v", "libx264", "-preset", "faster", "-crf", "20",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        out,
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    fmap  = build_scene_map()
    black = bytes(W * H * 3)

    print(f"Rendering {total} frames → {out}", flush=True)
    for gf in range(total):
        if gf in fmap:
            sc, lf = fmap[gf]
            try:
                frame = sc.render(lf)
                proc.stdin.write(to_rgb_bytes(frame))
            except Exception as e:
                print(f"  [frame {gf}] ERROR: {e}", flush=True)
                proc.stdin.write(black)
        else:
            proc.stdin.write(black)

        if gf % 300 == 0:
            pct = gf / total * 100
            print(f"  {pct:5.1f}%  ({gf // FPS}s)", flush=True)

    proc.stdin.close()
    ret = proc.wait()
    if ret == 0:
        print(f"\nDone → {out}", flush=True)
    else:
        print(f"\nFFmpeg exited {ret}", flush=True)
    return ret


if __name__ == "__main__":
    sys.exit(main())
