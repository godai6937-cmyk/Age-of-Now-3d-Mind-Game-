import PIL.Image
import json

img = PIL.Image.open("assets/world_map.png").convert("RGB")
img = img.resize((201, 201), PIL.Image.Resampling.LANCZOS)

heights = []
for y in range(201):
    row = []
    for x in range(201):
        r, g, b = img.getpixel((x, y))
        elev = 0.2
        # simple color heuristics for heightmap
        if b > r + 15 and b > g:
            # Deep blue ocean
            elev = -0.3
        elif b > r and b > g - 10:
            # Shallow water
            elev = -0.1
        else:
            # Land
            brightness = (r + g + b) / 3.0
            if brightness > 200:
                # Snow/high mountains
                elev = 1.8 + (brightness - 200) / 55.0 * 1.5
            elif r > g and r > 120 and b < 120:
                # Brown mountains / desert
                elev = 0.8 + (r - g) / 100.0 * 1.0
            else:
                # Green land
                elev = 0.3 + (g - b) / 255.0 * 0.8
        row.append(round(elev, 3))
    heights.append(row)

with open("js/world_heights.js", "w") as f:
    f.write("export const worldMapElevations = " + json.dumps(heights) + ";\n")
print("Successfully generated js/world_heights.js")
