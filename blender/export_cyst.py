"""
Blender Script — Realistic Dentigerous Cyst Model (v2 - High Detail)
Anatomically accurate with layered walls, fluid, embedded tooth, and bone cross-section
"""
import bpy
import bmesh
import math
import os

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials: bpy.data.materials.remove(m)

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "cyst.glb")

def mat(name, base, sub=(0,0,0), sub_w=0.0, rough=0.5, metal=0.0, alpha=1.0, emi=(0,0,0,1), emi_s=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Alpha"].default_value = alpha
    b.inputs["Subsurface Weight"].default_value = sub_w
    if sub_w > 0: b.inputs["Subsurface Radius"].default_value = sub
    if emi_s > 0:
        b.inputs["Emission Color"].default_value = emi
        b.inputs["Emission Strength"].default_value = emi_s
    return m

def subdiv(obj, lvl=2):
    mod = obj.modifiers.new("S", 'SUBSURF')
    mod.levels = lvl; mod.render_levels = lvl
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

m_wall    = mat("FibrousWall",   (0.72, 0.62, 0.48, 1), sub=(0.6,0.4,0.3), sub_w=0.3,  rough=0.6)
m_lining  = mat("Epithelial",   (0.85, 0.45, 0.50, 1), sub=(1.0,0.3,0.25),sub_w=0.45, rough=0.35, alpha=0.55, emi=(0.5,0.15,0.18,1), emi_s=0.2)
m_fluid   = mat("CystFluid",    (0.50, 0.70, 0.82, 1), sub=(0.3,0.5,0.7), sub_w=0.4,  rough=0.05, alpha=0.30, emi=(0.15,0.35,0.55,1), emi_s=0.15)
m_tooth   = mat("ImpactedTooth",(0.85, 0.82, 0.72, 1), sub=(0.7,0.6,0.4), sub_w=0.15, rough=0.12, metal=0.03)
m_bone    = mat("Bone",         (0.78, 0.72, 0.58, 1), sub=(0.5,0.4,0.3), sub_w=0.2,  rough=0.65)
m_cancel  = mat("Cancellous",   (0.72, 0.60, 0.45, 1), sub=(0.8,0.5,0.3), sub_w=0.3,  rough=0.75)
m_periost = mat("Periosteum",   (0.75, 0.42, 0.40, 1), sub=(1.0,0.3,0.2), sub_w=0.4,  rough=0.6, alpha=0.4)

# ── Outer cyst wall (fibrous connective tissue) ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=64, ring_count=40, location=(0, 0, 0))
wall = bpy.context.active_object
wall.name = "Cyst_Wall"
wall.scale = (1.0, 0.88, 0.92)
# Add organic irregularity
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(wall.data)
import random; random.seed(55)
for v in bm.verts:
    n = random.gauss(0, 0.015)
    d = math.sqrt(v.co.x**2 + v.co.y**2 + v.co.z**2)
    if d > 0:
        v.co.x += v.co.x/d * n
        v.co.y += v.co.y/d * n
        v.co.z += v.co.z/d * n
bmesh.update_edit_mesh(wall.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(wall, 1)
wall.data.materials.append(m_wall)

# ── Epithelial lining (thin inner layer) ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.93, segments=56, ring_count=36, location=(0, 0, 0))
lining = bpy.context.active_object
lining.name = "Epithelial_Lining"
lining.scale = (1.0, 0.88, 0.92)
subdiv(lining, 1)
lining.data.materials.append(m_lining)

# ── Cyst fluid (keratin/cholesterol-rich) ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.82, segments=48, ring_count=32, location=(0, 0, 0))
fluid = bpy.context.active_object
fluid.name = "Cyst_Fluid"
fluid.scale = (1.0, 0.88, 0.92)
subdiv(fluid, 1)
fluid.data.materials.append(m_fluid)

# ── Impacted tooth (dentigerous cyst hallmark — attached at CEJ) ──
# Crown
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.20, segments=32, ring_count=20, location=(0.1, 0, 0.22))
tc = bpy.context.active_object
tc.name = "Tooth_Crown"
tc.scale = (0.95, 0.82, 0.65)
subdiv(tc, 2)
tc.data.materials.append(m_tooth)

# Cusps on impacted tooth
for pos in [(0.18, 0.06, 0.36), (0.02, 0.06, 0.34), (0.18, -0.06, 0.33), (0.02, -0.06, 0.32)]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, segments=16, ring_count=12, location=pos)
    cs = bpy.context.active_object
    cs.name = "TC"
    bpy.ops.object.shade_smooth()
    cs.data.materials.append(m_tooth)

# Root of impacted tooth
bpy.ops.mesh.primitive_cone_add(radius1=0.11, radius2=0.025, depth=0.45, vertices=24, location=(0.1, 0, -0.08))
tr = bpy.context.active_object
tr.name = "Tooth_Root"
subdiv(tr, 1)
tr.data.materials.append(m_tooth)

# ── Surrounding bone (half-section for cross-section view) ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.25, segments=48, ring_count=30, location=(0, 0, 0))
bone = bpy.context.active_object
bone.name = "Bone_Shell"
bone.scale = (1.12, 1.0, 0.72)
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(bone.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 0.02], context='VERTS')
bmesh.update_edit_mesh(bone.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(bone, 1)
bone.data.materials.append(m_bone)

# Cancellous bone layer
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.15, segments=40, ring_count=24, location=(0, 0, 0))
canc = bpy.context.active_object
canc.name = "Cancellous"
canc.scale = (1.08, 0.95, 0.68)
bpy.ops.object.mode_set(mode='EDIT')
bm2 = bmesh.from_edit_mesh(canc.data)
bmesh.ops.delete(bm2, geom=[v for v in bm2.verts if v.co.y > 0.02], context='VERTS')
bmesh.update_edit_mesh(canc.data)
bpy.ops.object.mode_set(mode='OBJECT')
subdiv(canc, 1)
canc.data.materials.append(m_cancel)

# ── Bone expansion rim ──
bpy.ops.mesh.primitive_torus_add(major_radius=1.12, minor_radius=0.06, major_segments=48, minor_segments=12, location=(0, 0, 0))
rim = bpy.context.active_object
rim.name = "Expansion_Rim"
rim.scale = (1.0, 0.88, 0.48)
bpy.ops.object.shade_smooth()
rim.data.materials.append(m_periost)

# ── Apply modifiers & export ──
bpy.ops.object.select_all(action='SELECT')
for obj in bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = obj
    for mod in obj.modifiers:
        try: bpy.ops.object.modifier_apply(modifier=mod.name)
        except: pass

bpy.ops.export_scene.gltf(filepath=OUTPUT, export_format='GLB', use_selection=True, export_apply=True, export_materials='EXPORT')
print(f"Exported: {OUTPUT}")
