"""
Blender Python Script — Mandibular Jaw Architecture Model (High Detail)
Exports: jaw.glb
Anatomy: Mandible body with cortical bone, alveolar ridge, 14 anatomical teeth
         (crowns with cusps + roots), mandibular canal, IAN nerve, mental foramina
"""
import bpy
import bmesh
import math
import os

# ────────────────────────────────────────────────────────────
# Clear scene
# ────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials:
    bpy.data.materials.remove(m)
# (Don't remove collections — bpy.context.collection must remain valid)

OUTPUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "public", "models", "jaw.glb"
)

# ────────────────────────────────────────────────────────────
# Material helper  (Principled BSDF with Subsurface)
# ────────────────────────────────────────────────────────────
def mat(name, base, sub=(0, 0, 0), sub_w=0.0, rough=0.5,
        metal=0.0, alpha=1.0, emi=(0, 0, 0, 1), emi_s=0.0):
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
    return m

# ────────────────────────────────────────────────────────────
# Materials
# ────────────────────────────────────────────────────────────
mat_cortical = mat(
    "CorticalBone",
    (0.82, 0.76, 0.62, 1),
    sub=(0.6, 0.4, 0.3), sub_w=0.2,
    rough=0.6,
)
mat_spongy = mat(
    "CancellousBone",
    (0.78, 0.70, 0.55, 1),
    sub=(0.7, 0.5, 0.3), sub_w=0.25,
    rough=0.75,
)
mat_enamel = mat(
    "Enamel",
    (0.92, 0.89, 0.82, 1),
    sub=(0.8, 0.7, 0.5), sub_w=0.15,
    rough=0.08,
    metal=0.02,
)
mat_dentin = mat(
    "Dentin",
    (0.80, 0.70, 0.45, 1),
    sub=(0.9, 0.6, 0.3), sub_w=0.30,
    rough=0.45,
)
mat_root = mat(
    "Cementum",
    (0.75, 0.66, 0.45, 1),
    sub=(0.7, 0.5, 0.3), sub_w=0.25,
    rough=0.55,
)
mat_canal = mat(
    "MandibularCanal",
    (0.55, 0.12, 0.15, 1),
    sub=(1.0, 0.15, 0.1), sub_w=0.3,
    rough=0.8,
    emi=(0.45, 0.08, 0.10, 1), emi_s=0.1,
)
mat_nerve = mat(
    "IAN_Nerve",
    (0.90, 0.80, 0.20, 1),
    sub=(0.9, 0.7, 0.1), sub_w=0.35,
    rough=0.4,
    emi=(0.80, 0.65, 0.10, 1), emi_s=0.25,
)
mat_foramen = mat(
    "MentalForamen",
    (0.20, 0.15, 0.12, 1),
    sub=(0.3, 0.2, 0.15), sub_w=0.1,
    rough=0.9,
)

# ────────────────────────────────────────────────────────────
# Subdivision helper
# ────────────────────────────────────────────────────────────
def add_subdiv(obj, levels=2):
    mod = obj.modifiers.new("Subdiv", 'SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()


# ════════════════════════════════════════════════════════════
#  MANDIBLE BODY  (U-shaped arch from bezier curve)
# ════════════════════════════════════════════════════════════
curve_data = bpy.data.curves.new('jaw_curve', type='CURVE')
curve_data.dimensions = '3D'
spline = curve_data.splines.new('BEZIER')

jaw_points = [
    (-1.6, -0.8, 0.0),   # right ramus top
    (-1.45, -0.3, 0.0),  # right ramus mid
    (-1.2,  0.2, 0.0),   # right angle
    (-0.85, 0.6, 0.0),   # right body posterior
    (-0.50, 0.85, 0.0),  # right body anterior
    ( 0.0,  1.0, 0.0),   # symphysis (chin midline)
    ( 0.50, 0.85, 0.0),  # left body anterior
    ( 0.85, 0.6, 0.0),   # left body posterior
    ( 1.2,  0.2, 0.0),   # left angle
    ( 1.45, -0.3, 0.0),  # left ramus mid
    ( 1.6, -0.8, 0.0),   # left ramus top
]
spline.bezier_points.add(len(jaw_points) - 1)
for i, pt in enumerate(jaw_points):
    bp = spline.bezier_points[i]
    bp.co = pt
    bp.handle_left_type = 'AUTO'
    bp.handle_right_type = 'AUTO'

curve_data.bevel_depth = 0.22
curve_data.bevel_resolution = 8

jaw_obj = bpy.data.objects.new('Mandible_Body', curve_data)
bpy.context.collection.objects.link(jaw_obj)
bpy.context.view_layer.objects.active = jaw_obj
jaw_obj.select_set(True)
bpy.ops.object.convert(target='MESH')

# Add subdivision for organic smoothness
add_subdiv(jaw_obj, 1)
bpy.ops.object.modifier_apply(modifier="Subdiv")
bpy.ops.object.shade_smooth()
jaw_obj.data.materials.append(mat_cortical)
jaw_obj.scale = (1.0, 1.0, 1.3)

# ════════════════════════════════════════════════════════════
#  ALVEOLAR RIDGE  (raised crest along the arch for tooth sockets)
# ════════════════════════════════════════════════════════════
ridge_data = bpy.data.curves.new('ridge_curve', type='CURVE')
ridge_data.dimensions = '3D'
ridge_sp = ridge_data.splines.new('BEZIER')

ridge_points = [
    (-1.05, -0.05, 0.26),
    (-0.80, 0.40, 0.26),
    (-0.55, 0.68, 0.26),
    ( 0.0,  0.88, 0.26),
    ( 0.55, 0.68, 0.26),
    ( 0.80, 0.40, 0.26),
    ( 1.05, -0.05, 0.26),
]
ridge_sp.bezier_points.add(len(ridge_points) - 1)
for i, pt in enumerate(ridge_points):
    bp = ridge_sp.bezier_points[i]
    bp.co = pt
    bp.handle_left_type = 'AUTO'
    bp.handle_right_type = 'AUTO'

ridge_data.bevel_depth = 0.12
ridge_data.bevel_resolution = 6

ridge_obj = bpy.data.objects.new('Alveolar_Ridge', ridge_data)
bpy.context.collection.objects.link(ridge_obj)
bpy.context.view_layer.objects.active = ridge_obj
ridge_obj.select_set(True)
bpy.ops.object.convert(target='MESH')
add_subdiv(ridge_obj, 1)
bpy.ops.object.modifier_apply(modifier="Subdiv")
bpy.ops.object.shade_smooth()
ridge_obj.data.materials.append(mat_spongy)
ridge_obj.scale = (1.0, 1.0, 1.3)

# ════════════════════════════════════════════════════════════
#  TEETH  (14 teeth on the mandibular arch)
#  Layout: 2 central incisors, 2 lateral incisors, 2 canines,
#          4 premolars, 4 molars  — symmetric left/right
# ════════════════════════════════════════════════════════════
# Tooth type definitions:
#   name, crown_radius, crown_scale(x,y,z), root_depth, root_r1, root_r2, num_cusps
TOOTH_TYPES = {
    'central_incisor':  (0.065, (0.75, 0.55, 0.60), 0.28, 0.040, 0.012, 0),
    'lateral_incisor':  (0.060, (0.70, 0.50, 0.58), 0.26, 0.035, 0.010, 0),
    'canine':           (0.075, (0.80, 0.60, 0.65), 0.35, 0.048, 0.012, 1),
    'premolar':         (0.085, (0.88, 0.72, 0.55), 0.32, 0.050, 0.015, 2),
    'molar':            (0.110, (1.00, 0.85, 0.52), 0.38, 0.065, 0.018, 4),
}

# Map tooth index (0..13, right to left) to type
# Right: M3 M2 M1 PM2 PM1 C LI CI  |  CI LI C PM1 PM2 M1 M2 M3
# We use 14 teeth (no 3rd molars): M2 M1 PM2 PM1 C LI CI | CI LI C PM1 PM2 M1 M2
TOOTH_MAP = [
    'molar', 'molar',                      # 0,1   right molars
    'premolar', 'premolar',                 # 2,3   right premolars
    'canine',                               # 4     right canine
    'lateral_incisor',                      # 5     right lateral incisor
    'central_incisor',                      # 6     right central incisor
    'central_incisor',                      # 7     left central incisor
    'lateral_incisor',                      # 8     left lateral incisor
    'canine',                               # 9     left canine
    'premolar', 'premolar',                 # 10,11 left premolars
    'molar', 'molar',                       # 12,13 left molars
]

# Compute arch positions for each tooth
def arch_position(index, total=14):
    """Return (x, y) on the mandibular arch for tooth at given index."""
    t = index / (total - 1)          # 0..1 across the arch
    angle = t * math.pi              # 0..pi  (right to left)
    x = math.cos(angle) * 0.95       # arch width
    y = math.sin(angle) * 0.82       # arch depth
    return x, y

# Crown Z position (top of alveolar ridge)
CROWN_Z = 0.52
# Root starts just below crown
ROOT_Z_OFFSET = -0.22

for idx in range(14):
    ttype = TOOTH_MAP[idx]
    cr, cscale, rdepth, rr1, rr2, ncusps = TOOTH_TYPES[ttype]
    ax, ay = arch_position(idx)

    # Direction from arch center to tooth position (for orienting cusps)
    angle_to_center = math.atan2(ay, ax)

    # ── Crown ──
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=cr, segments=24, ring_count=16,
        location=(ax, ay, CROWN_Z),
    )
    crown = bpy.context.active_object
    crown.name = f"Tooth_{idx+1}_Crown_{ttype}"
    crown.scale = cscale
    add_subdiv(crown, 2)
    crown.data.materials.append(mat_enamel)

    # ── Cusps on crown ──
    if ncusps >= 1:
        cusp_offsets = []
        if ncusps == 1:
            cusp_offsets = [(0, 0)]
        elif ncusps == 2:
            cusp_offsets = [(-0.4, 0), (0.4, 0)]
        elif ncusps == 4:
            cusp_offsets = [(-0.4, -0.35), (0.4, -0.35),
                           (-0.4,  0.35), (0.4,  0.35)]

        for ci, (cox, coy) in enumerate(cusp_offsets):
            cusp_r = cr * 0.45
            cx = ax + cox * cr
            cy = ay + coy * cr
            cz = CROWN_Z + cr * 0.45
            bpy.ops.mesh.primitive_uv_sphere_add(
                radius=cusp_r, segments=16, ring_count=12,
                location=(cx, cy, cz),
            )
            cusp = bpy.context.active_object
            cusp.name = f"Tooth_{idx+1}_Cusp_{ci}"
            cusp.scale = (0.85, 0.80, 0.55)
            add_subdiv(cusp, 1)
            cusp.data.materials.append(mat_enamel)

    # ── Dentin core (visible between cusps on molars/premolars) ──
    if ncusps >= 2:
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=cr * 0.82, segments=16, ring_count=12,
            location=(ax, ay, CROWN_Z - cr * 0.05),
        )
        dcore = bpy.context.active_object
        dcore.name = f"Tooth_{idx+1}_Dentin"
        dcore.scale = (cscale[0] * 0.90, cscale[1] * 0.90, cscale[2] * 0.85)
        add_subdiv(dcore, 1)
        dcore.data.materials.append(mat_dentin)

    # ── Root ──
    root_z = CROWN_Z + ROOT_Z_OFFSET - rdepth * 0.5
    bpy.ops.mesh.primitive_cone_add(
        radius1=rr1, radius2=rr2, depth=rdepth,
        vertices=20, location=(ax, ay, root_z),
    )
    root = bpy.context.active_object
    root.name = f"Tooth_{idx+1}_Root_{ttype}"
    add_subdiv(root, 1)
    root.data.materials.append(mat_root)

    # ── Second root for molars ──
    if ttype == 'molar':
        root2_x = ax + 0.04 * math.cos(angle_to_center + math.pi * 0.3)
        root2_y = ay + 0.04 * math.sin(angle_to_center + math.pi * 0.3)
        bpy.ops.mesh.primitive_cone_add(
            radius1=rr1 * 0.85, radius2=rr2, depth=rdepth * 0.90,
            vertices=20,
            location=(root2_x, root2_y, root_z + 0.02),
        )
        root2 = bpy.context.active_object
        root2.name = f"Tooth_{idx+1}_Root2"
        root2.rotation_euler = (0.05, 0.08, 0)
        add_subdiv(root2, 1)
        root2.data.materials.append(mat_root)


# ════════════════════════════════════════════════════════════
#  MANDIBULAR CANAL  (inferior alveolar canal — bezier tube)
# ════════════════════════════════════════════════════════════
canal_data = bpy.data.curves.new('canal_curve', type='CURVE')
canal_data.dimensions = '3D'
canal_sp = canal_data.splines.new('BEZIER')

canal_points = [
    (-1.35, -0.35, -0.06),   # right mandibular foramen
    (-1.05,  0.05, -0.09),
    (-0.75,  0.35, -0.08),
    (-0.40,  0.60, -0.07),
    ( 0.0,   0.70, -0.06),   # midline
    ( 0.40,  0.60, -0.07),
    ( 0.75,  0.35, -0.08),
    ( 1.05,  0.05, -0.09),
    ( 1.35, -0.35, -0.06),   # left mandibular foramen
]
canal_sp.bezier_points.add(len(canal_points) - 1)
for i, pt in enumerate(canal_points):
    bp = canal_sp.bezier_points[i]
    bp.co = pt
    bp.handle_left_type = 'AUTO'
    bp.handle_right_type = 'AUTO'

canal_data.bevel_depth = 0.035
canal_data.bevel_resolution = 6

canal_obj = bpy.data.objects.new('Mandibular_Canal', canal_data)
bpy.context.collection.objects.link(canal_obj)
bpy.context.view_layer.objects.active = canal_obj
canal_obj.select_set(True)
bpy.ops.object.convert(target='MESH')
add_subdiv(canal_obj, 1)
bpy.ops.object.modifier_apply(modifier="Subdiv")
bpy.ops.object.shade_smooth()
canal_obj.data.materials.append(mat_canal)
canal_obj.scale = (1.0, 1.0, 1.3)

# ════════════════════════════════════════════════════════════
#  IAN NERVE  (inferior alveolar nerve — thinner tube inside canal)
# ════════════════════════════════════════════════════════════
nerve_data = bpy.data.curves.new('nerve_curve', type='CURVE')
nerve_data.dimensions = '3D'
nerve_sp = nerve_data.splines.new('BEZIER')

nerve_sp.bezier_points.add(len(canal_points) - 1)
for i, pt in enumerate(canal_points):
    bp = nerve_sp.bezier_points[i]
    bp.co = (pt[0], pt[1], pt[2] + 0.005)
    bp.handle_left_type = 'AUTO'
    bp.handle_right_type = 'AUTO'

nerve_data.bevel_depth = 0.015
nerve_data.bevel_resolution = 4

nerve_obj = bpy.data.objects.new('IAN_Nerve', nerve_data)
bpy.context.collection.objects.link(nerve_obj)
bpy.context.view_layer.objects.active = nerve_obj
nerve_obj.select_set(True)
bpy.ops.object.convert(target='MESH')
add_subdiv(nerve_obj, 1)
bpy.ops.object.modifier_apply(modifier="Subdiv")
bpy.ops.object.shade_smooth()
nerve_obj.data.materials.append(mat_nerve)
nerve_obj.scale = (1.0, 1.0, 1.3)

# ════════════════════════════════════════════════════════════
#  MENTAL FORAMINA  (bilateral openings on body of mandible)
# ════════════════════════════════════════════════════════════
for side in [-1, 1]:
    fx = side * 0.55
    fy = 0.72
    fz = 0.05

    # Outer foramen ring
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.045, depth=0.07, vertices=20,
        location=(fx, fy, fz),
    )
    mf = bpy.context.active_object
    mf.name = f"Mental_Foramen_{'R' if side < 0 else 'L'}"
    mf.rotation_euler = (math.pi / 2, 0, 0)
    add_subdiv(mf, 1)
    mf.data.materials.append(mat_foramen)

    # Inner dark hole
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.028, depth=0.09, vertices=16,
        location=(fx, fy + 0.01, fz),
    )
    mfi = bpy.context.active_object
    mfi.name = f"Mental_Foramen_Inner_{'R' if side < 0 else 'L'}"
    mfi.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.shade_smooth()
    mfi.data.materials.append(mat_foramen)

    # Small nerve stub exiting the foramen
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.012, depth=0.12, vertices=12,
        location=(fx, fy + 0.06, fz),
    )
    stub = bpy.context.active_object
    stub.name = f"Mental_Nerve_Stub_{'R' if side < 0 else 'L'}"
    stub.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.shade_smooth()
    stub.data.materials.append(mat_nerve)


# ════════════════════════════════════════════════════════════
#  APPLY ALL MODIFIERS  &  EXPORT GLB
# ════════════════════════════════════════════════════════════
bpy.ops.object.select_all(action='SELECT')
for obj in bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
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
