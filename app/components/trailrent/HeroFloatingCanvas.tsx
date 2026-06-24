import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {Suspense, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {
  DEFAULT_GEAR_KEYS,
  gearArtToDataUrl,
  type GearArtKey,
} from '~/components/trailrent/gearLineArt';

type FloatItem = {
  id: string;
  textureUrl: string;
  position: [number, number, number];
  scale: number;
  phase: number;
};

const FLOAT_LAYOUT: Array<{
  position: [number, number, number];
  scale: number;
  phase: number;
  gearKey: GearArtKey;
}> = [
  {position: [-2.4, 0.6, -0.4], scale: 1.1, phase: 0, gearKey: 'tent'},
  {position: [2.2, -0.2, 0.2], scale: 0.95, phase: 1.2, gearKey: 'sleepingBag'},
  {position: [-1.2, -1.1, 0.6], scale: 0.85, phase: 2.1, gearKey: 'cookSet'},
  {position: [1.4, 1.0, -0.8], scale: 1.0, phase: 0.7, gearKey: 'snowboard'},
];

function FloatingPlane({
  textureUrl,
  position,
  scale,
  phase,
  scrollProgress,
}: FloatItem & {scrollProgress: number}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(
    THREE.TextureLoader,
    textureUrl,
    (loader) => {
      loader.setCrossOrigin('anonymous');
    },
  );

  useMemo(() => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }, [texture]);

  useFrame(({clock}) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    mesh.position.y =
      position[1] + Math.sin(t * 0.55 + phase) * 0.18 + scrollProgress * 0.65;
    mesh.position.z = position[2] - scrollProgress * 0.45;
    mesh.rotation.z = Math.sin(t * 0.35 + phase) * 0.04;
    mesh.rotation.y = Math.sin(t * 0.25 + phase) * 0.06;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1.35, 1.35]} />
      <meshBasicMaterial map={texture} transparent opacity={0.92} toneMapped={false} />
    </mesh>
  );
}

function Scene({
  items,
  scrollProgress,
}: {
  items: FloatItem[];
  scrollProgress: number;
}) {
  return (
    <>
      <ambientLight intensity={1} />
      {items.map((item) => (
        <FloatingPlane key={item.id} {...item} scrollProgress={scrollProgress} />
      ))}
    </>
  );
}

type HeroFloatingCanvasProps = {
  packageImageUrls?: string[];
  scrollProgress: number;
};

export function HeroFloatingCanvas({
  packageImageUrls = [],
  scrollProgress,
}: HeroFloatingCanvasProps) {
  const items = useMemo((): FloatItem[] => {
    return FLOAT_LAYOUT.map((slot, index) => {
      const packageUrl = packageImageUrls[index];
      const textureUrl =
        packageUrl && packageUrl.length > 0
          ? packageUrl
          : gearArtToDataUrl(
              DEFAULT_GEAR_KEYS[index] ?? slot.gearKey,
            );

      return {
        id: `float-${index}`,
        textureUrl,
        position: slot.position,
        scale: slot.scale,
        phase: slot.phase,
      };
    });
  }, [packageImageUrls]);

  return (
    <div className="cm-hero-canvas" aria-hidden>
      <Canvas
        camera={{position: [0, 0, 4.5], fov: 42}}
        dpr={[1, 1.5]}
        gl={{alpha: true, antialias: true}}
      >
        <Suspense fallback={null}>
          <Scene items={items} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
