"""
Blender Script — Realistic Root Resorption Model (v2 - High Detail)
Anatomically accurate: healthy crown, resorbed root with Howship's lacunae,
osteoclast markers, inflammatory granulation tissue, PDL space
Exports: resorption.glb
"""
import bpy
import bmesh
import math
import random
import os

# ── Clear scene ──
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials:
    bpy.data.materials.remove(m)

random.seed(42)

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "resorption.glb")

# ── Material helper with Principled BSDF subsurface ──
def mat(name, base, sub=(0, 0, 0), sub_w=0.0, rough=0.5, metal=0.0, alpha=1.0, emi=(0, 0, 0, 1), emi_s=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    if alpha < 1.0:
        m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else m.blend_method
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Alpha"].default_value = alpha
    b.inputs["Subsurface Weight"].default_value = sub_w
    if sub_w > 0:
        b.inputs["Subsurface Radius"].default_value = sub
    if emi_s > 0:
        b.inputs["Emission Color"].default_value = emi
        b.inputs["Emission Strength"].default_value = emi_s
    return m

# ── Subdivision + smooth helper ──
def subdiv(obj, lvl=2):
    mod = obj.modifiers.new("Subdiv", 'SUBSURF')
    mod.levels = lvl
    mod.render_levels = lvl
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

# ── Materials ──
# Enamel: hard, glossy, slight subsurface translucency
m_enamel = mat("Enamel",
    base=(0.90, 0.88, 0.82, 1),
    sub=(0.8, 0.7, 0.5),
    sub_w=0.15,
    rough=0.08,
    metal=0.02)

# Dentin: softer, yellower, more subsurface scatter
m_dentin = mat("Dentin",
    base=(0.82, 0.72, 0.48, 1),
    sub=(0.9, 0.6, 0.3),
    sub_w=0.35,
    rough=0.42)

# Root cementum: matte organic surface
m_root = mat("Cementum",
    base=(0.76, 0.67, 0.46, 1),
    sub=(0.7, 0.5, 0.3),
    sub_w=0.3,
    rough=0.55)

# Resorbed root surface: damaged, rougher, darker
m_resorbed = mat("ResorbedRoot",
    base=(0.62, 0.38, 0.28, 1),
    sub=(0.9, 0.4, 0.25),
    sub_w=0.25,
    rough=0.75)

# Howship's lacunae: scalloped pits, slight glow
m_lacunae = mat("Lacunae",
    base=(0.85, 0.22, 0.18, 1),
    sub=(1.0, 0.2, 0.15),
    sub_w=0.3,
    rough=0.35,
    emi=(0.85, 0.20, 0.15, 1),
    emi_s=0.2)

# Osteoclast markers: purple/magenta multinucleated cells
m_osteoclast = mat("Osteoclast",
    base=(0.72, 0.18, 0.68, 1),
    sub=(0.8, 0.2, 0.7),
    sub_w=0.35,
    rough=0.5,
    emi=(0.65, 0.15, 0.60, 1),
    emi_s=0.25)

# Inflammatory granulation tissue: semi-transparent, vascular red
m_inflam = mat("GranulationTissue",
    base=(0.88, 0.28, 0.20, 1),
    sub=(1.0, 0.2, 0.12),
    sub_w=0.5,
    rough=0.7,
    alpha=0.5,
    emi=(0.6, 0.10, 0.08, 1),
    emi_s=0.15)

# PDL space: translucent ligament tissue
m_pdl = mat("PDL",
    base=(0.85, 0.62, 0.52, 1),
    sub=(0.9, 0.5, 0.35),
    sub_w=0.4,
    rough=0.6,
    alpha=0.5)

# Pulp tissue
m_pulp = mat("Pulp",
    base=(0.70, 0.12, 0.14, 1),
    sub=(1.0, 0.2, 0.1),
    sub_w=0.6,
    rough=0.7,
    emi=(0.45, 0.05, 0.05, 1),
    emi_s=0.1)

# CEJ band
m_cej = mat("CEJ",
    base=(0.72, 0.60, 0.32, 1),
    sub=(0.6, 0.4, 0.2),
    sub_w=0.2,
    rough=0.35,
    metal=0.08)


# ============================================================
#  CROWN — healthy upper portion with occlusal anatomy
# ============================================================

# ── Crown body ──
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.50, segments=40, ring_count=24, location=(0, 0, 0.42))
crown = bpy.context.active_object
crown.name = "Crown"
crown.scale = (1.0, 0.88, 0.72)

# Sculpt occlusal anatomy: central fossa + marginal ridges
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(crown.data)
for v in bm.verts:
    wz = v.co.z
    dist_xy = math.sqrt(v.co.x ** 2 + v.co.y ** 2)
    # Central fossa depression
    if wz > 0.30 and dist_xy < 0.15:
        v.co.z -= 0.06
    # Marginal ridges
    if wz > 0.25 and abs(v.co.x) > 0.25:
        v.co.z += 0.03
    # Slight buccal-lingual flattening
    if abs(v.co.y) > 0.30:
        v.co.y *= 0.94
bmesh.update_edit_mesh(crown.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(crown, 2)
crown.data.materials.append(m_enamel)

# ── Cusps (4 anatomical bumps) ──
cusp_positions = [
    (0.16, 0.14, 0.82),
    (-0.16, 0.14, 0.80),
    (0.16, -0.14, 0.78),
    (-0.16, -0.14, 0.76),
]
for i, pos in enumerate(cusp_positions):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.14, segments=20, ring_count=14, location=pos)
    cusp = bpy.context.active_object
    cusp.name = f"Cusp_{i + 1}"
    cusp.scale = (0.95, 0.88, 0.62)
    subdiv(cusp, 1)
    cusp.data.materials.append(m_enamel)

# ── Dentin core (visible through enamel translucency) ──
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.40, segments=32, ring_count=20, location=(0, 0, 0.38))
dentin = bpy.context.active_object
dentin.name = "Dentin_Core"
dentin.scale = (0.92, 0.80, 0.65)
subdiv(dentin, 1)
dentin.data.materials.append(m_dentin)

# ── CEJ band (cemento-enamel junction) ──
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.44, minor_radius=0.035,
    major_segments=64, minor_segments=16,
    location=(0, 0, 0.02))
cej = bpy.context.active_object
cej.name = "CEJ_Band"
cej.scale = (1.0, 0.88, 0.55)
bpy.ops.object.shade_smooth()
cej.data.materials.append(m_cej)

# ── Pulp chamber ──
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.16, segments=32, ring_count=20, location=(0, 0, 0.28))
pulp_chamber = bpy.context.active_object
pulp_chamber.name = "Pulp_Chamber"
pulp_chamber.scale = (0.82, 0.68, 1.0)
subdiv(pulp_chamber, 1)
pulp_chamber.data.materials.append(m_pulp)


# ============================================================
#  ROOT — with vertex-level resorption deformation
# ============================================================

# ── Root trunk ──
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.28, depth=0.35, vertices=32, location=(0, 0, -0.18))
trunk = bpy.context.active_object
trunk.name = "Root_Trunk"
trunk.scale = (0.85, 0.75, 1.0)
subdiv(trunk, 1)
trunk.data.materials.append(m_root)

# ── Mesial root with resorption pitting ──
bpy.ops.mesh.primitive_cone_add(
    radius1=0.22, radius2=0.04, depth=1.05, vertices=32, location=(0.12, 0, -0.85))
root_mesial = bpy.context.active_object
root_mesial.name = "Root_Mesial"
root_mesial.scale = (0.78, 0.65, 1.0)
root_mesial.rotation_euler = (0.04, -0.06, 0)

# Vertex deformation: irregular resorption pits on mesial root
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(root_mesial.data)
random.seed(42)
for v in bm.verts:
    dist_r = math.sqrt(v.co.x ** 2 + v.co.y ** 2)
    if dist_r > 0.03:
        # Lower third of root gets heaviest resorption
        depth_factor = max(0.0, (v.co.z + 0.52) / 1.05)
        # More resorption toward apex
        resorb_intensity = (1.0 - depth_factor) * 0.8
        noise = random.gauss(0, 0.018) * (1.0 + resorb_intensity * 2.5)
        # Radial displacement for pitting
        v.co.x += (v.co.x / dist_r) * noise
        v.co.y += (v.co.y / dist_r) * noise
        # Occasional deep pits (Howship's lacunae simulation)
        if random.random() < 0.08 * resorb_intensity:
            pit_depth = random.uniform(0.02, 0.06)
            v.co.x -= (v.co.x / dist_r) * pit_depth
            v.co.y -= (v.co.y / dist_r) * pit_depth
bmesh.update_edit_mesh(root_mesial.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(root_mesial, 2)
root_mesial.data.materials.append(m_root)

# ── Distal root with resorption pitting ──
bpy.ops.mesh.primitive_cone_add(
    radius1=0.20, radius2=0.035, depth=0.95, vertices=32, location=(-0.13, 0, -0.78))
root_distal = bpy.context.active_object
root_distal.name = "Root_Distal"
root_distal.scale = (0.72, 0.62, 1.0)
root_distal.rotation_euler = (0.03, 0.07, 0)

# Vertex deformation on distal root
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(root_distal.data)
random.seed(84)
for v in bm.verts:
    dist_r = math.sqrt(v.co.x ** 2 + v.co.y ** 2)
    if dist_r > 0.03:
        depth_factor = max(0.0, (v.co.z + 0.475) / 0.95)
        resorb_intensity = (1.0 - depth_factor) * 0.65
        noise = random.gauss(0, 0.015) * (1.0 + resorb_intensity * 2.0)
        v.co.x += (v.co.x / dist_r) * noise
        v.co.y += (v.co.y / dist_r) * noise
        if random.random() < 0.06 * resorb_intensity:
            pit_depth = random.uniform(0.015, 0.045)
            v.co.x -= (v.co.x / dist_r) * pit_depth
            v.co.y -= (v.co.y / dist_r) * pit_depth
bmesh.update_edit_mesh(root_distal.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(root_distal, 2)
root_distal.data.materials.append(m_root)

# ── Root canals ──
for xoff, rname in [(0.10, "Canal_Mesial"), (-0.11, "Canal_Distal")]:
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.028, depth=0.65, vertices=16, location=(xoff, 0, -0.50))
    canal = bpy.context.active_object
    canal.name = rname
    canal.rotation_euler = (0.02, xoff * 0.35, 0)
    subdiv(canal, 1)
    canal.data.materials.append(m_pulp)


# ============================================================
#  RESORBED SURFACE PATCHES — irregular destroyed cementum
# ============================================================

# Large resorption zone on mesial root (external resorption focus)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.18, segments=28, ring_count=18, location=(0.22, 0.06, -0.65))
resorb_patch_1 = bpy.context.active_object
resorb_patch_1.name = "Resorption_Patch_Mesial"
resorb_patch_1.scale = (0.55, 0.70, 0.90)

# Deform for irregular resorbed contour
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(resorb_patch_1.data)
random.seed(42)
for v in bm.verts:
    noise = random.gauss(0, 0.012)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
        v.co.z += (v.co.z / d) * noise * 0.7
bmesh.update_edit_mesh(resorb_patch_1.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(resorb_patch_1, 2)
resorb_patch_1.data.materials.append(m_resorbed)

# Secondary resorption patch on distal root
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.14, segments=28, ring_count=18, location=(-0.20, -0.04, -0.72))
resorb_patch_2 = bpy.context.active_object
resorb_patch_2.name = "Resorption_Patch_Distal"
resorb_patch_2.scale = (0.50, 0.60, 0.75)

bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(resorb_patch_2.data)
random.seed(99)
for v in bm.verts:
    noise = random.gauss(0, 0.010)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
        v.co.z += (v.co.z / d) * noise * 0.6
bmesh.update_edit_mesh(resorb_patch_2.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(resorb_patch_2, 2)
resorb_patch_2.data.materials.append(m_resorbed)

# Apical resorption patch (root tip erosion)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.10, segments=20, ring_count=14, location=(0.11, 0, -1.32))
resorb_patch_apex = bpy.context.active_object
resorb_patch_apex.name = "Resorption_Patch_Apex"
resorb_patch_apex.scale = (0.65, 0.60, 0.50)

bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(resorb_patch_apex.data)
random.seed(77)
for v in bm.verts:
    noise = random.gauss(0, 0.008)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
bmesh.update_edit_mesh(resorb_patch_apex.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(resorb_patch_apex, 2)
resorb_patch_apex.data.materials.append(m_resorbed)


# ============================================================
#  HOWSHIP'S LACUNAE — scalloped resorption pits
# ============================================================

random.seed(42)
lacuna_positions = []

# Generate lacunae distributed across resorption zones on both roots
# Mesial root lacunae (denser resorption)
for i in range(14):
    angle = random.uniform(0, 2 * math.pi)
    z = random.uniform(-1.10, -0.35)
    # Estimate root radius at this height for mesial root
    t = max(0.0, min(1.0, (z + 0.325) / -1.05))
    r_at_z = 0.22 * (1.0 - t) * 0.78 + 0.04 * t
    r_at_z = max(r_at_z, 0.04)
    x = 0.12 + math.cos(angle) * (r_at_z + 0.015)
    y = math.sin(angle) * (r_at_z + 0.015) * 0.65
    lacuna_positions.append((x, y, z))

    pit_radius = random.uniform(0.022, 0.050)
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=pit_radius, segments=14, ring_count=10,
        location=(x, y, z))
    lac = bpy.context.active_object
    lac.name = f"Lacuna_M_{i}"
    # Flatten to look like scalloped pit pressed into surface
    lac.scale = (
        random.uniform(0.8, 1.2),
        random.uniform(0.8, 1.2),
        random.uniform(0.3, 0.55))
    lac.rotation_euler = (
        random.uniform(-0.3, 0.3),
        random.uniform(-0.3, 0.3),
        random.uniform(0, math.pi))
    subdiv(lac, 1)
    lac.data.materials.append(m_lacunae)

# Distal root lacunae (sparser)
for i in range(8):
    angle = random.uniform(0, 2 * math.pi)
    z = random.uniform(-1.00, -0.40)
    t = max(0.0, min(1.0, (z + 0.305) / -0.95))
    r_at_z = 0.20 * (1.0 - t) * 0.72 + 0.035 * t
    r_at_z = max(r_at_z, 0.035)
    x = -0.13 + math.cos(angle) * (r_at_z + 0.012)
    y = math.sin(angle) * (r_at_z + 0.012) * 0.62
    lacuna_positions.append((x, y, z))

    pit_radius = random.uniform(0.018, 0.042)
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=pit_radius, segments=14, ring_count=10,
        location=(x, y, z))
    lac = bpy.context.active_object
    lac.name = f"Lacuna_D_{i}"
    lac.scale = (
        random.uniform(0.8, 1.15),
        random.uniform(0.8, 1.15),
        random.uniform(0.3, 0.50))
    lac.rotation_euler = (
        random.uniform(-0.25, 0.25),
        random.uniform(-0.25, 0.25),
        random.uniform(0, math.pi))
    subdiv(lac, 1)
    lac.data.materials.append(m_lacunae)


# ============================================================
#  OSTEOCLAST MARKERS — multinucleated cells at active resorption sites
# ============================================================

random.seed(42)
# Place osteoclasts near a subset of lacunae (active resorption fronts)
osteoclast_indices = [0, 2, 5, 8, 11, 14, 16, 19]
for idx, li in enumerate(osteoclast_indices):
    if li >= len(lacuna_positions):
        continue
    lp = lacuna_positions[li]
    # Offset slightly outward from lacuna position (sitting on surface)
    offset_angle = random.uniform(0, 2 * math.pi)
    ox = lp[0] + math.cos(offset_angle) * 0.025
    oy = lp[1] + math.sin(offset_angle) * 0.025
    oz = lp[2] + random.uniform(-0.01, 0.02)

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=random.uniform(0.025, 0.042), segments=12, ring_count=8,
        location=(ox, oy, oz))
    oc = bpy.context.active_object
    oc.name = f"Osteoclast_{idx}"
    # Irregular flattened cell shape
    oc.scale = (
        random.uniform(1.0, 1.5),
        random.uniform(0.8, 1.2),
        random.uniform(0.4, 0.7))
    oc.rotation_euler = (
        random.uniform(-0.4, 0.4),
        random.uniform(-0.4, 0.4),
        random.uniform(0, math.pi))
    subdiv(oc, 1)
    oc.data.materials.append(m_osteoclast)

    # Add 2-3 tiny nuclei per osteoclast (multinucleated characteristic)
    num_nuclei = random.randint(2, 4)
    for ni in range(num_nuclei):
        nx = ox + random.uniform(-0.015, 0.015)
        ny = oy + random.uniform(-0.015, 0.015)
        nz = oz + random.uniform(-0.005, 0.008)
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=random.uniform(0.008, 0.014), segments=10, ring_count=8,
            location=(nx, ny, nz))
        nucleus = bpy.context.active_object
        nucleus.name = f"OC_Nucleus_{idx}_{ni}"
        nucleus.scale = (1.0, 0.85, 0.6)
        bpy.ops.object.shade_smooth()
        # Darker purple for nuclei
        m_nucleus = mat(f"OC_Nucleus_Mat_{idx}_{ni}",
            base=(0.52, 0.08, 0.50, 1),
            sub=(0.6, 0.1, 0.5),
            sub_w=0.4,
            rough=0.45,
            emi=(0.50, 0.08, 0.48, 1),
            emi_s=0.15)
        nucleus.data.materials.append(m_nucleus)


# ============================================================
#  INFLAMMATORY GRANULATION TISSUE — at apex and resorption sites
# ============================================================

# Main apical granulation tissue mass
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.22, segments=28, ring_count=18, location=(0.10, 0, -1.35))
inflam_apex = bpy.context.active_object
inflam_apex.name = "Granulation_Apex"
inflam_apex.scale = (1.15, 1.0, 0.75)

# Deform for irregular inflammatory tissue shape
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(inflam_apex.data)
random.seed(42)
for v in bm.verts:
    noise = random.gauss(0, 0.02)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
        v.co.z += (v.co.z / d) * noise * 0.5
bmesh.update_edit_mesh(inflam_apex.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(inflam_apex, 2)
inflam_apex.data.materials.append(m_inflam)

# Secondary granulation tissue around distal apex
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.16, segments=24, ring_count=16, location=(-0.12, 0, -1.22))
inflam_distal = bpy.context.active_object
inflam_distal.name = "Granulation_Distal"
inflam_distal.scale = (1.05, 0.90, 0.70)

bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(inflam_distal.data)
random.seed(63)
for v in bm.verts:
    noise = random.gauss(0, 0.016)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
        v.co.z += (v.co.z / d) * noise * 0.5
bmesh.update_edit_mesh(inflam_distal.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(inflam_distal, 2)
inflam_distal.data.materials.append(m_inflam)

# Small granulation tissue nodule at lateral resorption site
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.09, segments=20, ring_count=14, location=(0.28, 0.05, -0.60))
inflam_lateral = bpy.context.active_object
inflam_lateral.name = "Granulation_Lateral"
inflam_lateral.scale = (0.80, 0.90, 0.65)

bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(inflam_lateral.data)
random.seed(71)
for v in bm.verts:
    noise = random.gauss(0, 0.010)
    d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
    if d > 0:
        v.co.x += (v.co.x / d) * noise
        v.co.y += (v.co.y / d) * noise
bmesh.update_edit_mesh(inflam_lateral.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(inflam_lateral, 2)
inflam_lateral.data.materials.append(m_inflam)

# Tiny inflammatory foci scattered along mesial root resorption front
random.seed(42)
for i in range(5):
    fz = random.uniform(-1.05, -0.50)
    fa = random.uniform(0, 2 * math.pi)
    fr = random.uniform(0.18, 0.26)
    fx = 0.12 + math.cos(fa) * fr
    fy = math.sin(fa) * fr * 0.65
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=random.uniform(0.025, 0.045), segments=32, ring_count=16,
        location=(fx, fy, fz))
    foc = bpy.context.active_object
    foc.name = f"Inflam_Focus_{i}"
    foc.scale = (
        random.uniform(0.8, 1.2),
        random.uniform(0.8, 1.2),
        random.uniform(0.5, 0.8))
    bpy.ops.object.shade_smooth()
    foc.data.materials.append(m_inflam)


# ============================================================
#  PDL SPACE — periodontal ligament around root
# ============================================================

# Mesial root PDL sleeve
bpy.ops.mesh.primitive_cone_add(
    radius1=0.28, radius2=0.07, depth=1.10, vertices=32,
    location=(0.12, 0, -0.85))
pdl_mesial = bpy.context.active_object
pdl_mesial.name = "PDL_Mesial"
pdl_mesial.scale = (0.78, 0.68, 1.0)
pdl_mesial.rotation_euler = (0.04, -0.06, 0)
subdiv(pdl_mesial, 1)
pdl_mesial.data.materials.append(m_pdl)

# Distal root PDL sleeve
bpy.ops.mesh.primitive_cone_add(
    radius1=0.26, radius2=0.06, depth=1.00, vertices=32,
    location=(-0.13, 0, -0.78))
pdl_distal = bpy.context.active_object
pdl_distal.name = "PDL_Distal"
pdl_distal.scale = (0.72, 0.65, 1.0)
pdl_distal.rotation_euler = (0.03, 0.07, 0)
subdiv(pdl_distal, 1)
pdl_distal.data.materials.append(m_pdl)

# Interradicular PDL (between roots at furcation)
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.10, segments=32, ring_count=16, location=(0, 0, -0.42))
pdl_furcation = bpy.context.active_object
pdl_furcation.name = "PDL_Furcation"
pdl_furcation.scale = (0.90, 0.65, 0.55)
subdiv(pdl_furcation, 1)
pdl_furcation.data.materials.append(m_pdl)


# ============================================================
#  APPLY ALL MODIFIERS AND EXPORT GLB
# ============================================================

bpy.ops.object.select_all(action='SELECT')
for obj in bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = obj
    for mod in obj.modifiers:
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except:
            pass

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
)
print(f"Exported: {OUTPUT}")
