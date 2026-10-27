import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MissionId, ZoneConfig } from '../types/game';
import { sound } from '../audio/soundManager';

interface IslandWorld3DProps {
  zones: ZoneConfig[];
  onEnterMission: (id: MissionId) => void;
  completedMissions: string[];
}

export const IslandWorld3D: React.FC<IslandWorld3DProps> = ({
  zones,
  onEnterMission,
  completedMissions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<ZoneConfig | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3f7);
    scene.fog = new THREE.Fog(0xbfe3f7, 24, 60);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(13, 12, 13);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xb9e3c6, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7e6, 1.6);
    dirLight.position.set(12, 18, 9);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);

    // 4. Island Ground
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Main green grass cylinder
    const grassGeo = new THREE.CylinderGeometry(7.2, 6.8, 0.8, 48);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x76c893,
      roughness: 0.65,
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = -0.4;
    grassMesh.receiveShadow = true;
    islandGroup.add(grassMesh);

    // Dirt sub-layer
    const dirtGeo = new THREE.CylinderGeometry(6.7, 3.6, 1.8, 16);
    const dirtMat = new THREE.MeshStandardMaterial({
      color: 0x936639,
      roughness: 0.9,
      flatShading: true,
    });
    const dirtMesh = new THREE.Mesh(dirtGeo, dirtMat);
    dirtMesh.position.y = -1.6;
    islandGroup.add(dirtMesh);

    // Rock bottom tip
    const rockGeo = new THREE.ConeGeometry(3.6, 2.6, 10);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x6c584c,
      roughness: 0.95,
      flatShading: true,
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.y = -3.7;
    rockMesh.rotation.x = Math.PI;
    islandGroup.add(rockMesh);

    // Stone pathway ring on the grass
    const pathGeo = new THREE.RingGeometry(2.8, 3.6, 48);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xeddcd2,
      roughness: 0.8,
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.y = 0.012;
    pathMesh.receiveShadow = true;
    islandGroup.add(pathMesh);

    // Decorative Trees
    const treePositions = [
      [-5.5, 0.8],
      [1.5, -5.7],
      [5.6, -1.6],
      [-1.0, 5.6],
      [3.8, 4.5],
      [-5.6, -1.6],
    ];
    treePositions.forEach(([x, z], idx) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);
      const scale = 0.8 + (idx % 3) * 0.2;
      treeGroup.scale.set(scale, scale, scale);

      // Trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
      );
      trunk.position.y = 0.45;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage layers
      const foliageMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x52b788 : 0x40916c,
        roughness: 0.5,
      });
      const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 8), foliageMat);
      foliage1.position.y = 1.25;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 8), foliageMat);
      foliage2.position.y = 1.75;
      foliage2.castShadow = true;
      treeGroup.add(foliage2);

      islandGroup.add(treeGroup);
    });

    // Decorative Clouds
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const clouds = [
      { x: -9, y: 5, z: -6, s: 1.2 },
      { x: 8, y: 4, z: -8, s: 1.0 },
      { x: -7, y: 3.5, z: 8, s: 0.9 },
    ];
    clouds.forEach(({ x, y, z, s }) => {
      const c = new THREE.Group();
      c.position.set(x, y, z);
      for (let i = 0; i < 4; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.8 * s, 12, 8), cloudMat);
        puff.position.set((i - 1.5) * 0.9 * s, Math.sin(i) * 0.3 * s, 0);
        c.add(puff);
      }
      cloudGroup.add(c);
    });

    // 5. Buildings Setup
    const buildingMeshes: { [key: string]: THREE.Group } = {};

    zones.forEach((zone) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(zone.coords[0], 0, zone.coords[1]);
      bGroup.userData = { zoneId: zone.id, zone };

      // Base ring marker
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.45, 32),
        new THREE.MeshBasicMaterial({
          color: completedMissions.includes(zone.id) ? 0x52b788 : 0xffd166,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        })
      );
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.02;
      bGroup.add(ringMesh);

      // Building geometry per kind
      if (zone.kind === 'click') {
        // Star Observatory
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.85, 0.95, 1.4, 16),
          new THREE.MeshStandardMaterial({ color: 0x4cc9f0, roughness: 0.4 })
        );
        base.position.y = 0.7;
        base.castShadow = true;
        bGroup.add(base);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.86, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0x3a0ca3, roughness: 0.3 })
        );
        dome.position.y = 1.4;
        dome.castShadow = true;
        bGroup.add(dome);

        // Golden spinning star on top
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.4, 0),
          new THREE.MeshStandardMaterial({
            color: 0xffd60a,
            emissive: 0xffd60a,
            emissiveIntensity: 0.4,
          })
        );
        star.position.y = 2.45;
        star.name = 'starSpinner';
        bGroup.add(star);
      } else if (zone.kind === 'double-click') {
        // Mole Windmill / Cottage
        const house = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.2, 1.4),
          new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.5 })
        );
        house.position.y = 0.6;
        house.castShadow = true;
        bGroup.add(house);

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(1.2, 1.0, 4),
          new THREE.MeshStandardMaterial({ color: 0xfb8500, roughness: 0.4 })
        );
        roof.position.y = 1.7;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        bGroup.add(roof);

        // Mini mole statue
        const moleHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
        );
        moleHead.position.set(0, 2.3, 0);
        bGroup.add(moleHead);
      } else if (zone.kind === 'drag') {
        // Cheese Bakery
        const cheeseBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 1.1, 0.9, 12),
          new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.4 })
        );
        cheeseBase.position.y = 0.45;
        cheeseBase.castShadow = true;
        bGroup.add(cheeseBase);

        // Big Cheese slice roof
        const cheeseRoof = new THREE.Mesh(
          new THREE.ConeGeometry(1.15, 0.9, 6),
          new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.4 })
        );
        cheeseRoof.position.y = 1.35;
        bGroup.add(cheeseRoof);

        const cherry = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.2 })
        );
        cherry.position.y = 1.95;
        bGroup.add(cherry);
      } else if (zone.kind === 'paint') {
        // Art Studio
        const studio = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 1.05, 1.3, 8),
          new THREE.MeshStandardMaterial({ color: 0xff70a6, roughness: 0.4 })
        );
        studio.position.y = 0.65;
        studio.castShadow = true;
        bGroup.add(studio);

        // Palette Dome
        const palette = new THREE.Mesh(
          new THREE.TorusGeometry(0.65, 0.2, 8, 16),
          new THREE.MeshStandardMaterial({ color: 0x70d6ff })
        );
        palette.position.y = 1.6;
        palette.rotation.x = Math.PI / 2;
        bGroup.add(palette);

        // Paintbrush
        const brush = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.08, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xff9770 })
        );
        brush.position.set(0.4, 2.0, 0);
        brush.rotation.z = -0.3;
        bGroup.add(brush);
      } else if (zone.kind === 'right-click') {
        // Flag Fortress / Lighthouse
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.85, 2.0, 16),
          new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.4 })
        );
        tower.position.y = 1.0;
        tower.castShadow = true;
        bGroup.add(tower);

        const cap = new THREE.Mesh(
          new THREE.ConeGeometry(0.75, 0.7, 16),
          new THREE.MeshStandardMaterial({ color: 0xe63946 })
        );
        cap.position.y = 2.35;
        bGroup.add(cap);

        // Red Flag
        const flag = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.3, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xe63946 })
        );
        flag.position.set(0.3, 2.7, 0);
        flag.name = 'flagWave';
        bGroup.add(flag);
      }

      islandGroup.add(bGroup);
      buildingMeshes[zone.id] = bGroup;
    });

    // 6. Mascot Character Mouse (3D Mesh)
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(1.5, 0, 2.5);
    scene.add(mouseGroup);

    // Mouse Body
    const bodyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xc8ccd6, roughness: 0.5 })
    );
    bodyMesh.position.y = 0.42;
    bodyMesh.scale.set(1, 1.1, 1.1);
    bodyMesh.castShadow = true;
    mouseGroup.add(bodyMesh);

    // Mouse Belly
    const bellyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf3ede4 })
    );
    bellyMesh.position.set(0, 0.38, 0.22);
    bellyMesh.scale.set(0.8, 0.9, 0.5);
    mouseGroup.add(bellyMesh);

    // Mouse Ears (Left & Right)
    [-1, 1].forEach((side) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.3, 0.8, -0.05);

      const earOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0xc8ccd6 })
      );
      earOuter.rotation.x = Math.PI / 2;
      earGroup.add(earOuter);

      const earInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.07, 16),
        new THREE.MeshStandardMaterial({ color: 0xf7b3b3 })
      );
      earInner.rotation.x = Math.PI / 2;
      earGroup.add(earInner);

      mouseGroup.add(earGroup);
    });

    // Mouse Snout & Nose
    const snoutMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xff9aa8 })
    );
    snoutMesh.position.set(0, 0.48, 0.46);
    mouseGroup.add(snoutMesh);

    // Mouse Eyes
    [-0.14, 0.14].forEach((xPos) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x1d3557 })
      );
      eye.position.set(xPos, 0.56, 0.38);
      mouseGroup.add(eye);
    });

    // 7. Navigation & Movement State
    const targetPos = new THREE.Vector3(1.5, 0, 2.5);
    let isMoving = false;
    let stepSoundTimer = 0;

    // Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let theta = Math.PI / 4;
    let phi = Math.PI / 3.4;
    let radius = 18;

    const updateCameraOrbit = () => {
      phi = Math.max(0.2, Math.min(Math.PI / 2.3, phi));
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraOrbit();

    // Raycaster for mouse picking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        theta -= deltaX * 0.007;
        phi -= deltaY * 0.007;
        updateCameraOrbit();
        return;
      }

      // Hover check on buildings
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(islandGroup.children, true);
      let foundZone: ZoneConfig | null = null;

      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== islandGroup) {
          if (parent.userData && parent.userData.zone) {
            foundZone = parent.userData.zone;
            break;
          }
          parent = parent.parent;
        }
        if (foundZone) break;
      }

      if (foundZone !== hoveredZone) {
        if (foundZone) sound.playHover();
        setHoveredZone(foundZone);
        container.style.cursor = foundZone ? 'pointer' : 'default';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasDraggingFar =
        Math.hypot(e.clientX - prevMouseX, e.clientY - prevMouseY) > 6;
      isDragging = false;

      if (wasDraggingFar) return;

      // Handle Click on Building or Ground
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(islandGroup.children, true);

      // 1. Check building hit
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== islandGroup) {
          if (parent.userData && parent.userData.zone) {
            const z: ZoneConfig = parent.userData.zone;
            sound.playStarCatch(2);
            targetPos.set(z.coords[0] + 0.8, 0, z.coords[1] + 0.8);
            setTimeout(() => {
              onEnterMission(z.id);
            }, 350);
            return;
          }
          parent = parent.parent;
        }
      }

      // 2. Check grass click for movement
      const groundHit = raycaster.intersectObject(grassMesh);
      if (groundHit.length > 0) {
        const pt = groundHit[0].point;
        targetPos.set(pt.x, 0, pt.z);
        sound.playClick();
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(10, Math.min(26, radius + e.deltaY * 0.015));
      updateCameraOrbit();
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Floating island gentle hover
      islandGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;

      // Building animations (spin star, wave flag, bounce on hover)
      zones.forEach((z) => {
        const b = buildingMeshes[z.id];
        if (b) {
          const isHovered = hoveredZone?.id === z.id;
          const targetScale = isHovered ? 1.15 : 1.0;
          b.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

          const star = b.getObjectByName('starSpinner');
          if (star) star.rotation.y += delta * 2.5;

          const flag = b.getObjectByName('flagWave');
          if (flag) flag.rotation.y = Math.sin(elapsed * 4) * 0.25;
        }
      });

      // Mascot Character Walking Physics
      const dist = mouseGroup.position.distanceTo(targetPos);
      if (dist > 0.08) {
        isMoving = true;
        const dir = new THREE.Vector3().subVectors(targetPos, mouseGroup.position).normalize();
        mouseGroup.position.addScaledVector(dir, Math.min(dist, 4.0 * delta));

        // Rotate towards moving direction
        const targetAngle = Math.atan2(dir.x, dir.z);
        mouseGroup.rotation.y = THREE.MathUtils.lerp(mouseGroup.rotation.y, targetAngle, 0.2);

        // Waddle bounce
        bodyMesh.position.y = 0.42 + Math.abs(Math.sin(elapsed * 12)) * 0.12;

        // Step sound tick
        stepSoundTimer += delta;
        if (stepSoundTimer > 0.22) {
          stepSoundTimer = 0;
          sound.playStep();
        }
      } else {
        isMoving = false;
        bodyMesh.position.y = 0.42 + Math.sin(elapsed * 2.5) * 0.03;
      }

      // Rotate clouds
      cloudGroup.rotation.y += delta * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [zones, onEnterMission, completedMissions]);

  return (
    <div className="world-frame relative h-[440px] w-full overflow-hidden sm:h-[520px]">
      <div ref={containerRef} className="size-full touch-none" />

      {/* Atmospheric Vignette Overlay */}
      <div className="world-overlay pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />

      {/* Top HUD Hint */}
      <div className="hud-panel pointer-events-none absolute left-4 top-4 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md">
        🖱️ 건물 클릭: 미션 입장 · 잔디 클릭: 캐릭터 이동 · 드래그: 섬 회전 · 휠: 줌
      </div>

      {/* Building Hover Pill */}
      {hoveredZone && (
        <div className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2">
          <div className="world-label world-label-active flex items-center gap-2 text-sm shadow-xl">
            <span className="text-base">📍</span>
            <span>{hoveredZone.title}</span>
            <span className="text-xs text-slate-500 font-bold">(클릭하여 입장!)</span>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="status-chip status-new">학습 월드 1</span>
          <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl text-shadow-game">
            마우스 아일랜드
          </h1>
          <p className="mt-0.5 text-sm font-bold text-white/95 text-shadow-game">
            3D 섬의 건물을 눌러 5가지 마우스 기술을 마스터해보세요!
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onEnterMission('click');
          }}
          className="btn-3d btn-3d-primary btn-3d-lg pointer-events-auto self-start sm:self-auto"
        >
          <span>🚀 첫 번째 미션 시작</span>
        </button>
      </div>
    </div>
  );
};
