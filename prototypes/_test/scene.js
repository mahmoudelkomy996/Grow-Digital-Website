import * as THREE from "three";
export function createScene({ canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#052626");
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); cam.position.set(0, 0, 6);
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), new THREE.MeshBasicMaterial({ color: "#7fe0c8", wireframe: true }));
  mesh.position.x = 1.6; scene.add(mesh);
  return {
    resize(w, h, dpr) { renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); },
    render(t, p) { mesh.rotation.set(p * 6, t * 0.3, 0); renderer.render(scene, cam); },
  };
}
