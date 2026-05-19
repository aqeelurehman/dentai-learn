"""
Blender Python Script — Fibrous Dysplasia / Bone Pathology Model
Exports: bone.glb
Anatomy: Bone segment with ground-glass pattern, woven bone trabeculae,
         fibrous tissue islands, Chinese-letter pattern, periosteum,
         bone marrow spaces, cross-section cut revealing interior
"""
import bpy
import bmesh
import math
import random
import os

# ────────────────────────────────────────────────────────────
# Clear scene completely
# ────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials:
    bpy.data.materials.remove(m)

random.seed(99)

OUTPUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "public", "models", "bone.glb"
)


# ────────────────────────────────────────────────────────────
# Material helper with Subsurface Weight + Subsurface Radius
# ────────────────────────────────────────────────────────────
def make_mat(
    name, color,
    alpha=1.0,
    roughness=0.5,
    metallic=0.0,
    subsurface_w=0.0,
    subsurface_radius=(1.0, 0.2, 0.1),
    emission_color=(0, 0, 0, 1),
    emission_strength=0.0,
):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = False
    if alpha < 1.0:
        mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else None
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha

    # Subsurface scattering for organic bone realism
    if subsurface_w > 0.0:
        bsdf.inputs["Subsurface Weight"].default_value = subsurface_w
        bsdf.inputs["Subsurface Radius"].default_value = subsurface_radius

    # Emission
    if emission_strength > 0.0:
        bsdf.inputs["Emission Color"].default_value = emission_color
        bsdf.inputs["Emission Strength"].default_value = emission_strength

    return mat


# ────────────────────────────────────────────────────────────
# Helper: add subdivision surface modifier
# ────────────────────────────────────────────────────────────
def add_subsurf(obj, levels=2, render_levels=2):
    mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = render_levels
    mod.subdivision_type = 'CATMULL_CLARK'
    return mod


# ────────────────────────────────────────────────────────────
# Helper: displace vertices randomly for surface irregularity
# ────────────────────────────────────────────────────────────
def add_surface_noise(obj, strength=0.03):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    for v in bm.verts:
        offset_x = random.uniform(-strength, strength)
        offset_y = random.uniform(-strength, strength)
        offset_z = random.uniform(-strength, strength)
        v.co.x += offset_x
        v.co.y += offset_y
        v.co.z += offset_z
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')


# ────────────────────────────────────────────────────────────
# Materials
# ────────────────────────────────────────────────────────────

# Cortical bone — dense outer bone, slightly warm ivory
mat_cortical = make_mat(
    "CorticalBone",
    color=(0.82, 0.76, 0.62, 1),
    roughness=0.6,
    subsurface_w=0.2,
    subsurface_radius=(0.8, 0.3, 0.15),
    emission_color=(0.15, 0.12, 0.08, 1),
    emission_strength=0.05,
)

# Spongy / cancellous bone interior
mat_spongy = make_mat(
    "SpongyBone",
    color=(0.78, 0.70, 0.55, 1),
    roughness=0.8,
    subsurface_w=0.15,
    subsurface_radius=(0.6, 0.25, 0.1),
)

# Dysplastic expansion — reddish pathological enlargement
mat_expand = make_mat(
    "DysplasticExpansion",
    color=(0.88, 0.52, 0.42, 1),
    roughness=0.55,
    subsurface_w=0.25,
    subsurface_radius=(0.9, 0.35, 0.2),
    emission_color=(0.55, 0.2, 0.12, 1),
    emission_strength=0.15,
)

# Ground-glass opacity zone — translucent hazy interior
mat_ground = make_mat(
    "GroundGlassOpacity",
    color=(0.88, 0.84, 0.74, 1),
    alpha=0.5,
    roughness=0.35,
    subsurface_w=0.3,
    subsurface_radius=(1.0, 0.5, 0.25),
    emission_color=(0.45, 0.38, 0.28, 1),
    emission_strength=0.1,
)

# Woven bone trabeculae — immature disorganised bone
mat_woven = make_mat(
    "WovenBone",
    color=(0.75, 0.65, 0.45, 1),
    roughness=0.7,
    subsurface_w=0.15,
    subsurface_radius=(0.5, 0.2, 0.1),
    emission_color=(0.3, 0.2, 0.1, 1),
    emission_strength=0.08,
)

# Fibrous tissue islands — pinkish soft tissue
mat_fibrous = make_mat(
    "FibrousTissue",
    color=(0.85, 0.55, 0.50, 1),
    alpha=0.55,
    roughness=0.7,
    subsurface_w=0.4,
    subsurface_radius=(1.0, 0.4, 0.25),
    emission_color=(0.5, 0.2, 0.15, 1),
    emission_strength=0.08,
)

# Periosteum — thin translucent outer membrane
mat_periost = make_mat(
    "Periosteum",
    color=(0.80, 0.58, 0.52, 1),
    alpha=0.35,
    roughness=0.6,
    subsurface_w=0.2,
    subsurface_radius=(0.7, 0.3, 0.15),
    emission_color=(0.25, 0.1, 0.08, 1),
    emission_strength=0.05,
)

# Bone marrow — dark red
mat_marrow = make_mat(
    "BoneMarrow",
    color=(0.55, 0.12, 0.10, 1),
    roughness=0.8,
    subsurface_w=0.35,
    subsurface_radius=(0.9, 0.15, 0.08),
    emission_color=(0.35, 0.06, 0.04, 1),
    emission_strength=0.1,
)


# ────────────────────────────────────────────────────────────
# 1. Main bone segment — horizontal cylinder (mandible section)
# ────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.5, depth=2.4, vertices=48, location=(0, 0, 0)
)
bone_main = bpy.context.active_object
bone_main.name = "Bone_Segment"
bone_main.rotation_euler = (0, math.pi / 2, 0)   # horizontal orientation
bone_main.data.materials.append(mat_cortical)
add_subsurf(bone_main, levels=1, render_levels=2)

# Add surface irregularity via bmesh noise
add_surface_noise(bone_main, strength=0.025)
bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 2. Expanded dysplastic region — bulging sphere merged into bone
# ────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.72, segments=40, ring_count=28, location=(0.1, 0, 0.05)
)
expand = bpy.context.active_object
expand.name = "Dysplastic_Expansion"
expand.scale = (0.95, 0.85, 1.05)
expand.data.materials.append(mat_expand)
add_subsurf(expand, levels=1, render_levels=2)
add_surface_noise(expand, strength=0.02)
bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 3. Cross-section cut — delete front half of inner bone
# ────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.46, depth=2.3, vertices=44, location=(0, 0, 0)
)
inner = bpy.context.active_object
inner.name = "Inner_Bone"
inner.rotation_euler = (0, math.pi / 2, 0)

# Enter edit mode and delete front half (y > 0)
bpy.context.view_layer.objects.active = inner
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(inner.data)
bm.verts.ensure_lookup_table()
verts_to_delete = [v for v in bm.verts if v.co.y > 0.02]
bmesh.ops.delete(bm, geom=verts_to_delete, context='VERTS')
bmesh.update_edit_mesh(inner.data)
bpy.ops.object.mode_set(mode='OBJECT')

inner.data.materials.append(mat_spongy)
add_subsurf(inner, levels=1, render_levels=2)
bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 4. Ground-glass opacity zone — semi-transparent interior sphere
# ────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.48, segments=36, ring_count=24, location=(0.05, -0.02, 0)
)
gg_zone = bpy.context.active_object
gg_zone.name = "Ground_Glass_Zone"
gg_zone.scale = (0.75, 0.68, 0.88)
gg_zone.data.materials.append(mat_ground)
add_subsurf(gg_zone, levels=1, render_levels=2)
bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 5. Woven bone trabeculae — 35+ small randomly oriented cylinders
#    forming characteristic Chinese-letter pattern
# ────────────────────────────────────────────────────────────
NUM_TRABECULAE = 38

for i in range(NUM_TRABECULAE):
    x = random.uniform(-0.55, 0.55)
    y = random.uniform(-0.35, -0.03)
    z = random.uniform(-0.42, 0.42)

    length = random.uniform(0.08, 0.22)
    radius = random.uniform(0.012, 0.022)

    angle_x = random.uniform(-math.pi / 3, math.pi / 3)
    angle_y = random.uniform(0, math.pi)
    angle_z = random.uniform(0, math.pi)

    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=length, vertices=8, location=(x, y, z)
    )
    trab = bpy.context.active_object
    trab.name = f"Trabecula_{i:02d}"
    trab.rotation_euler = (angle_x, angle_y, angle_z)
    trab.data.materials.append(mat_woven)
    add_subsurf(trab, levels=1, render_levels=1)
    bpy.ops.object.shade_smooth()

# Additional branching spurs connecting some trabeculae for realism
for i in range(12):
    x = random.uniform(-0.45, 0.45)
    y = random.uniform(-0.30, -0.05)
    z = random.uniform(-0.35, 0.35)

    length = random.uniform(0.04, 0.10)
    radius = random.uniform(0.008, 0.015)

    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=length, vertices=6, location=(x, y, z)
    )
    spur = bpy.context.active_object
    spur.name = f"Trabecula_Spur_{i:02d}"
    spur.rotation_euler = (
        random.uniform(-math.pi / 2, math.pi / 2),
        random.uniform(0, math.pi),
        random.uniform(0, math.pi),
    )
    spur.data.materials.append(mat_woven)
    bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 6. Fibrous tissue islands — 15 irregularly shaped spheres
# ────────────────────────────────────────────────────────────
NUM_FIBROUS = 15

for i in range(NUM_FIBROUS):
    x = random.uniform(-0.40, 0.40)
    y = random.uniform(-0.28, -0.03)
    z = random.uniform(-0.35, 0.35)
    r = random.uniform(0.04, 0.10)

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=r, segments=14, ring_count=10, location=(x, y, z)
    )
    fib = bpy.context.active_object
    fib.name = f"Fibrous_{i:02d}"

    # Irregular scaling for non-spherical organic shapes
    fib.scale = (
        random.uniform(0.6, 1.4),
        random.uniform(0.6, 1.4),
        random.uniform(0.6, 1.4),
    )

    fib.data.materials.append(mat_fibrous)
    add_subsurf(fib, levels=1, render_levels=1)

    # Slight vertex noise for organic irregularity
    add_surface_noise(fib, strength=0.015)
    bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 7. Periosteum — outer translucent covering over the bone
# ────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.54, depth=2.5, vertices=44, location=(0, 0, 0)
)
periost = bpy.context.active_object
periost.name = "Periosteum"
periost.rotation_euler = (0, math.pi / 2, 0)
periost.data.materials.append(mat_periost)
add_subsurf(periost, levels=1, render_levels=2)
bpy.ops.object.shade_smooth()

# Periosteum over the dysplastic bulge
bpy.ops.mesh.primitive_uv_sphere_add(
    radius=0.76, segments=32, ring_count=20, location=(0.1, 0, 0.05)
)
periost_bulge = bpy.context.active_object
periost_bulge.name = "Periosteum_Bulge"
periost_bulge.scale = (0.98, 0.88, 1.08)
periost_bulge.data.materials.append(mat_periost)
add_subsurf(periost_bulge, levels=1, render_levels=2)
bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 8. Bone marrow spaces — small dark-red spheres
# ────────────────────────────────────────────────────────────
NUM_MARROW = 8

for i in range(NUM_MARROW):
    x = random.uniform(-0.55, 0.55)
    y = random.uniform(-0.20, -0.05)
    z = random.uniform(-0.25, 0.25)
    r = random.uniform(0.05, 0.10)

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=r, segments=12, ring_count=8, location=(x, y, z)
    )
    marrow = bpy.context.active_object
    marrow.name = f"Marrow_{i:02d}"
    marrow.scale = (
        random.uniform(0.8, 1.2),
        random.uniform(0.8, 1.2),
        random.uniform(0.8, 1.2),
    )
    marrow.data.materials.append(mat_marrow)
    add_subsurf(marrow, levels=1, render_levels=1)
    bpy.ops.object.shade_smooth()


# ────────────────────────────────────────────────────────────
# 9. Select all, apply all modifiers, export GLB
# ────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')

# Apply all modifiers on every mesh object before export
for obj in bpy.context.selected_objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        for mod in obj.modifiers:
            bpy.ops.object.modifier_apply(modifier=mod.name)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
)

print(f"Exported: {OUTPUT}")
