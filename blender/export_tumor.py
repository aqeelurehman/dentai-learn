"""
Blender Python Script — Ameloblastoma (Tumor) Model  (v2 - High Detail)
Exports: tumor.glb
Anatomy: Multilocular soap-bubble lobules, central tumor mass with SSS,
         bony septa, eroded bone shell, stellate reticulum cells,
         blood vessels, fibrous capsule
"""
import bpy
import bmesh
import math
import random
import os

# ────────────────────────────────────────────
#  Clean scene
# ────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials:
    bpy.data.materials.remove(m)

OUTPUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "public", "models", "tumor.glb"
)

random.seed(77)

# ────────────────────────────────────────────
#  Helper: Principled BSDF material with SSS
# ────────────────────────────────────────────
def mat(name, base, sub=(0, 0, 0), sub_w=0.0, rough=0.5, metal=0.0,
        alpha=1.0, emi=(0, 0, 0, 1), emi_s=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
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
    if alpha < 1.0:
        m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


# ────────────────────────────────────────────
#  Helper: add subdivision surface modifier
# ────────────────────────────────────────────
def subdiv(obj, lvl=2):
    mod = obj.modifiers.new("Subdiv", 'SUBSURF')
    mod.levels = lvl
    mod.render_levels = lvl
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────
#  Helper: organic noise deformation via bmesh
# ────────────────────────────────────────────
def organic_noise(obj, strength=0.02, seed=77):
    rng = random.Random(seed)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    for v in bm.verts:
        n = rng.gauss(0, strength)
        d = math.sqrt(v.co.x ** 2 + v.co.y ** 2 + v.co.z ** 2)
        if d > 0.001:
            v.co.x += v.co.x / d * n
            v.co.y += v.co.y / d * n
            v.co.z += v.co.z / d * n
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')


# ────────────────────────────────────────────
#  Materials
# ────────────────────────────────────────────

# Central tumor mass — reddish-pink with strong SSS
m_tumor = mat(
    "TumorMass",
    base=(0.72, 0.28, 0.45, 1),
    sub=(1.0, 0.25, 0.35),
    sub_w=0.5,
    rough=0.5,
    emi=(0.45, 0.10, 0.25, 1),
    emi_s=0.12,
)

# Lobule material — translucent pink, slight emission
m_lobule = mat(
    "Lobule",
    base=(0.80, 0.36, 0.58, 1),
    sub=(1.0, 0.30, 0.40),
    sub_w=0.45,
    rough=0.4,
    alpha=0.55,
    emi=(0.55, 0.18, 0.38, 1),
    emi_s=0.15,
)

# Bony septa between lobules
m_septum = mat(
    "Septum",
    base=(0.75, 0.68, 0.55, 1),
    sub=(0.5, 0.4, 0.3),
    sub_w=0.15,
    rough=0.7,
)

# Intact cortical bone shell
m_bone = mat(
    "Bone",
    base=(0.82, 0.76, 0.62, 1),
    sub=(0.5, 0.4, 0.3),
    sub_w=0.2,
    rough=0.65,
)

# Eroded bone margins
m_eroded = mat(
    "ErodedBone",
    base=(0.70, 0.55, 0.40, 1),
    sub=(0.6, 0.35, 0.25),
    sub_w=0.25,
    rough=0.8,
    emi=(0.30, 0.15, 0.05, 1),
    emi_s=0.08,
)

# Stellate reticulum cells — semi-transparent pink
m_stellate = mat(
    "Stellate",
    base=(0.90, 0.50, 0.70, 1),
    sub=(1.0, 0.4, 0.5),
    sub_w=0.35,
    rough=0.3,
    alpha=0.40,
    emi=(0.70, 0.30, 0.50, 1),
    emi_s=0.20,
)

# Fibrous capsule — outer translucent shell
m_capsule = mat(
    "Capsule",
    base=(0.78, 0.65, 0.50, 1),
    sub=(0.6, 0.4, 0.3),
    sub_w=0.2,
    rough=0.5,
    alpha=0.3,
)

# Blood vessels — red with emission
m_vessel = mat(
    "Vessel",
    base=(0.85, 0.12, 0.12, 1),
    sub=(1.0, 0.05, 0.05),
    sub_w=0.4,
    rough=0.4,
    emi=(0.70, 0.05, 0.05, 1),
    emi_s=0.35,
)


# ====================================================================
#  GEOMETRY
# ====================================================================

# ────────────────────────────────────────────
#  1. Central tumor mass (larger sphere, reddish-pink SSS)
# ────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.6, segments=48, ring_count=32, location=(0, 0, 0)
)
mass = bpy.context.active_object
mass.name = "Tumor_Central"
mass.scale = (1.1, 0.92, 0.88)
organic_noise(mass, strength=0.025, seed=77)
subdiv(mass, 2)
mass.data.materials.append(m_tumor)

# ────────────────────────────────────────────
#  2. Multilocular lobules — 9 overlapping spheres (soap-bubble)
# ────────────────────────────────────────────
lobule_data = []
for i in range(9):
    angle = (i / 9.0) * 2.0 * math.pi + random.uniform(-0.25, 0.25)
    dist = random.uniform(0.32, 0.72)
    x = math.cos(angle) * dist
    y = math.sin(angle) * dist * 0.82
    z = random.uniform(-0.28, 0.28)
    r = random.uniform(0.18, 0.40)
    lobule_data.append((x, y, z, r))

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=r, segments=28, ring_count=20, location=(x, y, z)
    )
    lob = bpy.context.active_object
    lob.name = f"Lobule_{i}"
    lob.scale = (
        1.0 + random.uniform(-0.08, 0.08),
        0.90 + random.uniform(-0.06, 0.06),
        0.85 + random.uniform(-0.06, 0.06),
    )
    organic_noise(lob, strength=0.018, seed=77 + i)
    subdiv(lob, 2)
    lob.data.materials.append(m_lobule)

# ────────────────────────────────────────────
#  3. Bony septa between lobules (thin plates / walls)
# ────────────────────────────────────────────
for i in range(len(lobule_data) - 1):
    p1 = lobule_data[i]
    p2 = lobule_data[i + 1]
    mx = (p1[0] + p2[0]) * 0.5
    my = (p1[1] + p2[1]) * 0.5
    mz = (p1[2] + p2[2]) * 0.5
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    dz = p2[2] - p1[2]
    length = math.sqrt(dx ** 2 + dy ** 2 + dz ** 2) * 0.55

    bpy.ops.mesh.primitive_cube_add(size=0.04, location=(mx, my, mz))
    sep = bpy.context.active_object
    sep.name = f"Septum_{i}"
    sep.scale = (length * 6.0, 0.25, 2.8)
    sep.rotation_euler = (
        random.uniform(-0.08, 0.08),
        random.uniform(-0.05, 0.05),
        math.atan2(dy, dx),
    )
    subdiv(sep, 2)
    sep.data.materials.append(m_septum)

# Additional radial septa connecting center to lobules
for i in range(0, 9, 2):
    lx, ly, lz, lr = lobule_data[i]
    bpy.ops.mesh.primitive_cube_add(
        size=0.03, location=(lx * 0.5, ly * 0.5, lz * 0.5)
    )
    rsep = bpy.context.active_object
    rsep.name = f"RadialSeptum_{i}"
    dist_to_center = math.sqrt(lx ** 2 + ly ** 2)
    rsep.scale = (dist_to_center * 5.5, 0.2, 2.2)
    rsep.rotation_euler = (0, 0, math.atan2(ly, lx))
    subdiv(rsep, 2)
    rsep.data.materials.append(m_septum)

# ────────────────────────────────────────────
#  4. Eroded bone shell (half-sphere cutaway showing interior)
# ────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=1.15, segments=56, ring_count=36, location=(0, 0, 0)
)
bone_shell = bpy.context.active_object
bone_shell.name = "Bone_Shell"
bone_shell.scale = (1.10, 1.0, 0.72)

# Cut away front half to reveal interior
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(bone_shell.data)
verts_del = [v for v in bm.verts if v.co.y > 0.05]
bmesh.ops.delete(bm, geom=verts_del, context='VERTS')

# Erode the cut edge irregularly
for v in bm.verts:
    if abs(v.co.y) < 0.15:
        v.co.x += random.gauss(0, 0.03)
        v.co.z += random.gauss(0, 0.03)
        v.co.y += random.gauss(0, 0.015)

bmesh.update_edit_mesh(bone_shell.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(bone_shell, 2)
bone_shell.data.materials.append(m_bone)

# ────────────────────────────────────────────
#  5. Eroded / thinned bone rims (top and bottom margins)
# ────────────────────────────────────────────
bpy.ops.mesh.primitive_torus_add(
    major_radius=1.08,
    minor_radius=0.055,
    major_segments=56,
    minor_segments=14,
    location=(0, 0, 0.32),
)
rim_top = bpy.context.active_object
rim_top.name = "Eroded_Rim_Top"
rim_top.scale = (1.0, 0.88, 0.55)
# Cut front half of rim to match bone shell
bpy.ops.object.mode_set(mode='EDIT')
bm_rt = bmesh.from_edit_mesh(rim_top.data)
bmesh.ops.delete(bm_rt, geom=[v for v in bm_rt.verts if v.co.y > 0.05], context='VERTS')
for v in bm_rt.verts:
    if abs(v.co.y) < 0.12:
        v.co.x += random.gauss(0, 0.02)
        v.co.z += random.gauss(0, 0.015)
bmesh.update_edit_mesh(rim_top.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(rim_top, 2)
rim_top.data.materials.append(m_eroded)

bpy.ops.mesh.primitive_torus_add(
    major_radius=1.08,
    minor_radius=0.055,
    major_segments=56,
    minor_segments=14,
    location=(0, 0, -0.32),
)
rim_bot = bpy.context.active_object
rim_bot.name = "Eroded_Rim_Bottom"
rim_bot.scale = (1.0, 0.88, 0.55)
bpy.ops.object.mode_set(mode='EDIT')
bm_rb = bmesh.from_edit_mesh(rim_bot.data)
bmesh.ops.delete(bm_rb, geom=[v for v in bm_rb.verts if v.co.y > 0.05], context='VERTS')
for v in bm_rb.verts:
    if abs(v.co.y) < 0.12:
        v.co.x += random.gauss(0, 0.02)
        v.co.z += random.gauss(0, 0.015)
bmesh.update_edit_mesh(rim_bot.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(rim_bot, 2)
rim_bot.data.materials.append(m_eroded)

# ────────────────────────────────────────────
#  6. Stellate reticulum cells (small ico-spheres in center)
# ────────────────────────────────────────────
for i in range(7):
    angle = (i / 7.0) * 2.0 * math.pi + random.uniform(-0.15, 0.15)
    rad = random.uniform(0.08, 0.20)
    sx = math.cos(angle) * rad
    sy = math.sin(angle) * rad * 0.9
    sz = random.uniform(-0.08, 0.08)
    cell_r = random.uniform(0.045, 0.09)

    bpy.ops.mesh.primitive_ico_sphere_add(
        radius=cell_r, subdivisions=2, location=(sx, sy, sz)
    )
    star = bpy.context.active_object
    star.name = f"Stellate_{i}"
    star.scale = (
        1.0 + random.uniform(-0.15, 0.15),
        1.0 + random.uniform(-0.15, 0.15),
        1.0 + random.uniform(-0.15, 0.15),
    )
    subdiv(star, 2)
    star.data.materials.append(m_stellate)

# ────────────────────────────────────────────
#  7. Blood vessels feeding the tumor (bezier curves with bevel)
# ────────────────────────────────────────────
for i in range(5):
    angle = (i / 5.0) * 2.0 * math.pi + random.uniform(-0.3, 0.3)

    # Outer anchor point (on bone shell)
    x1 = math.cos(angle) * 1.05
    y1 = math.sin(angle) * -0.5 + random.uniform(-0.15, 0.0)
    z1 = random.uniform(-0.25, 0.25)

    # Inner anchor (near tumor center)
    x2 = math.cos(angle) * 0.25
    y2 = math.sin(angle) * -0.15
    z2 = random.uniform(-0.10, 0.10)

    # Mid-point for curvature
    xm = (x1 + x2) * 0.5 + random.uniform(-0.12, 0.12)
    ym = (y1 + y2) * 0.5 + random.uniform(-0.08, 0.08)
    zm = (z1 + z2) * 0.5 + random.uniform(-0.10, 0.10)

    curve_data = bpy.data.curves.new(f"vessel_curve_{i}", type='CURVE')
    curve_data.dimensions = '3D'
    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(2)  # total 3 points

    # Point 0: outer
    bp0 = spline.bezier_points[0]
    bp0.co = (x1, y1, z1)
    bp0.handle_left_type = 'AUTO'
    bp0.handle_right_type = 'AUTO'

    # Point 1: mid
    bp1 = spline.bezier_points[1]
    bp1.co = (xm, ym, zm)
    bp1.handle_left_type = 'AUTO'
    bp1.handle_right_type = 'AUTO'

    # Point 2: inner
    bp2 = spline.bezier_points[2]
    bp2.co = (x2, y2, z2)
    bp2.handle_left_type = 'AUTO'
    bp2.handle_right_type = 'AUTO'

    curve_data.bevel_depth = 0.012 + random.uniform(0.0, 0.006)
    curve_data.bevel_resolution = 6

    vessel_obj = bpy.data.objects.new(f"Vessel_{i}", curve_data)
    bpy.context.collection.objects.link(vessel_obj)
    bpy.context.view_layer.objects.active = vessel_obj
    vessel_obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.shade_smooth()
    vessel_obj.data.materials.append(m_vessel)

# Small branching capillaries off the main vessels
for i in range(8):
    angle = random.uniform(0, 2.0 * math.pi)
    r_start = random.uniform(0.35, 0.75)
    r_end = random.uniform(0.15, 0.35)

    x1 = math.cos(angle) * r_start
    y1 = math.sin(angle) * r_start * -0.5
    z1 = random.uniform(-0.18, 0.18)
    x2 = math.cos(angle + random.uniform(-0.4, 0.4)) * r_end
    y2 = math.sin(angle + random.uniform(-0.4, 0.4)) * r_end * -0.4
    z2 = random.uniform(-0.10, 0.10)

    cap_data = bpy.data.curves.new(f"capillary_{i}", type='CURVE')
    cap_data.dimensions = '3D'
    sp = cap_data.splines.new('BEZIER')
    sp.bezier_points.add(1)  # total 2 points
    sp.bezier_points[0].co = (x1, y1, z1)
    sp.bezier_points[0].handle_left_type = 'AUTO'
    sp.bezier_points[0].handle_right_type = 'AUTO'
    sp.bezier_points[1].co = (x2, y2, z2)
    sp.bezier_points[1].handle_left_type = 'AUTO'
    sp.bezier_points[1].handle_right_type = 'AUTO'
    cap_data.bevel_depth = 0.006 + random.uniform(0.0, 0.003)
    cap_data.bevel_resolution = 4

    cap_obj = bpy.data.objects.new(f"Capillary_{i}", cap_data)
    bpy.context.collection.objects.link(cap_obj)
    bpy.context.view_layer.objects.active = cap_obj
    cap_obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.shade_smooth()
    cap_obj.data.materials.append(m_vessel)

# ────────────────────────────────────────────
#  8. Fibrous capsule (outer translucent shell, alpha=0.3)
# ────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.98, segments=44, ring_count=28, location=(0, 0, 0)
)
capsule = bpy.context.active_object
capsule.name = "Tumor_Capsule"
capsule.scale = (1.12, 0.96, 0.72)
organic_noise(capsule, strength=0.012, seed=99)
subdiv(capsule, 2)
capsule.data.materials.append(m_capsule)


# ====================================================================
#  EXPORT
# ====================================================================

# Select all, apply all modifiers, export GLB
bpy.ops.object.select_all(action='SELECT')
for obj in bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = obj
    for mod in obj.modifiers:
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
)
print(f"Exported: {OUTPUT}")
