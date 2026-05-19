"""
Blender Script — Realistic Molar Tooth Model (v2 - High Detail)
Anatomically detailed with proper PBR materials, subdivision, and correct proportions
"""
import bpy
import bmesh
import math
import os

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in bpy.data.materials: bpy.data.materials.remove(m)
for c in bpy.data.collections: bpy.data.collections.remove(c)

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "tooth.glb")

def mat(name, base, sub=(0,0,0), sub_w=0.0, rough=0.5, metal=0.0, alpha=1.0, emi=(0,0,0,1), emi_s=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = base
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Alpha"].default_value = alpha
    # Subsurface for organic realism
    b.inputs["Subsurface Weight"].default_value = sub_w
    if sub_w > 0:
        b.inputs["Subsurface Radius"].default_value = sub
    if emi_s > 0:
        b.inputs["Emission Color"].default_value = emi
        b.inputs["Emission Strength"].default_value = emi_s
    return m

# Realistic dental materials
m_enamel   = mat("Enamel",   (0.88, 0.86, 0.80, 1), sub=(0.8,0.7,0.5), sub_w=0.15, rough=0.08, metal=0.02)
m_dentin   = mat("Dentin",   (0.80, 0.70, 0.45, 1), sub=(0.9,0.6,0.3), sub_w=0.35, rough=0.45)
m_pulp     = mat("Pulp",     (0.72, 0.12, 0.14, 1), sub=(1.0,0.2,0.1), sub_w=0.6,  rough=0.7, emi=(0.5,0.05,0.05,1), emi_s=0.15)
m_cej      = mat("CEJ",      (0.70, 0.58, 0.30, 1), sub=(0.6,0.4,0.2), sub_w=0.2,  rough=0.35, metal=0.1)
m_root     = mat("Cementum", (0.75, 0.66, 0.45, 1), sub=(0.7,0.5,0.3), sub_w=0.3,  rough=0.55)
m_canal    = mat("Canal",    (0.65, 0.10, 0.12, 1), sub=(1.0,0.15,0.1),sub_w=0.5,  rough=0.8, emi=(0.4,0.02,0.03,1), emi_s=0.1)
m_gingiva  = mat("Gingiva",  (0.78, 0.38, 0.40, 1), sub=(1.0,0.3,0.25),sub_w=0.55, rough=0.65, alpha=0.45)

def add_subdiv(obj, levels=2):
    mod = obj.modifiers.new("Subdiv", 'SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

# ── Crown body ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.50, segments=64, ring_count=32, location=(0, 0, 0.42))
crown = bpy.context.active_object
crown.name = "Crown"
crown.scale = (1.0, 0.88, 0.72)
# Sculpt-style deformation for realistic occlusal surface
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(crown.data)
for v in bm.verts:
    wz = v.co.z
    # Create occlusal concavity (central fossa)
    if wz > 0.3:
        dist = math.sqrt(v.co.x**2 + v.co.y**2)
        if dist < 0.15:
            v.co.z -= 0.06
    # Create marginal ridges
    if wz > 0.25 and abs(v.co.x) > 0.25:
        v.co.z += 0.03
bmesh.update_edit_mesh(crown.data)
bpy.ops.object.mode_set(mode='OBJECT')
add_subdiv(crown, 2)
crown.data.materials.append(m_enamel)

# ── Cusps (4 realistic bumps) ──
cusps = [(0.16, 0.14, 0.82), (-0.16, 0.14, 0.80), (0.16, -0.14, 0.78), (-0.16, -0.14, 0.76)]
for i, pos in enumerate(cusps):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, segments=32, ring_count=20, location=pos)
    c = bpy.context.active_object
    c.name = f"Cusp_{i+1}"
    c.scale = (0.95, 0.9, 0.65)
    add_subdiv(c, 1)
    c.data.materials.append(m_enamel)

# ── Dentin core (visible at occlusal pits) ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.40, segments=32, ring_count=20, location=(0, 0, 0.38))
dentin = bpy.context.active_object
dentin.name = "Dentin_Core"
dentin.scale = (0.92, 0.80, 0.65)
add_subdiv(dentin, 1)
dentin.data.materials.append(m_dentin)

# ── CEJ band (cemento-enamel junction) ──
bpy.ops.mesh.primitive_torus_add(major_radius=0.44, minor_radius=0.035, major_segments=64, minor_segments=16, location=(0, 0, 0.02))
cej = bpy.context.active_object
cej.name = "CEJ_Band"
cej.scale = (1.0, 0.88, 0.55)
bpy.ops.object.shade_smooth()
cej.data.materials.append(m_cej)

# ── Root trunk (before bifurcation) ──
bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.35, vertices=32, location=(0, 0, -0.18))
trunk = bpy.context.active_object
trunk.name = "Root_Trunk"
trunk.scale = (0.85, 0.75, 1.0)
add_subdiv(trunk, 1)
trunk.data.materials.append(m_root)

# ── Mesial root ──
bpy.ops.mesh.primitive_cone_add(radius1=0.22, radius2=0.04, depth=1.0, vertices=32, location=(0.11, 0, -0.82))
rm = bpy.context.active_object
rm.name = "Root_Mesial"
rm.scale = (0.75, 0.65, 1.0)
rm.rotation_euler = (0.04, -0.07, 0)
add_subdiv(rm, 2)
rm.data.materials.append(m_root)

# ── Distal root ──
bpy.ops.mesh.primitive_cone_add(radius1=0.20, radius2=0.035, depth=0.9, vertices=32, location=(-0.12, 0, -0.75))
rd = bpy.context.active_object
rd.name = "Root_Distal"
rd.scale = (0.70, 0.60, 1.0)
rd.rotation_euler = (0.03, 0.08, 0)
add_subdiv(rd, 2)
rd.data.materials.append(m_root)

# ── Pulp chamber ──
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17, segments=32, ring_count=20, location=(0, 0, 0.28))
pulp = bpy.context.active_object
pulp.name = "Pulp_Chamber"
pulp.scale = (0.85, 0.7, 1.05)
add_subdiv(pulp, 1)
pulp.data.materials.append(m_pulp)

# ── Root canals ──
for xoff, name in [(0.09, "Canal_Mesial"), (-0.10, "Canal_Distal")]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.7, vertices=16, location=(xoff, 0, -0.45))
    cn = bpy.context.active_object
    cn.name = name
    cn.rotation_euler = (0.02, xoff * 0.4, 0)
    add_subdiv(cn, 1)
    cn.data.materials.append(m_canal)

# ── Apical foramina ──
for pos in [(0.13, 0, -1.28), (-0.14, 0, -1.17)]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.028, segments=16, ring_count=12, location=pos)
    a = bpy.context.active_object
    a.name = "Apex"
    bpy.ops.object.shade_smooth()
    a.data.materials.append(m_canal)

# ── Gingival margin (translucent soft tissue ring) ──
bpy.ops.mesh.primitive_torus_add(major_radius=0.55, minor_radius=0.12, major_segments=48, minor_segments=16, location=(0, 0, 0.04))
gum = bpy.context.active_object
gum.name = "Gingiva"
gum.scale = (1.0, 0.88, 0.45)
add_subdiv(gum, 1)
gum.data.materials.append(m_gingiva)

# ── Apply all modifiers for GLB export ──
bpy.ops.object.select_all(action='SELECT')
for obj in bpy.context.selected_objects:
    bpy.context.view_layer.objects.active = obj
    for mod in obj.modifiers:
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except:
            pass

bpy.ops.export_scene.gltf(filepath=OUTPUT, export_format='GLB', use_selection=True, export_apply=True, export_materials='EXPORT')
print(f"Exported: {OUTPUT}")
