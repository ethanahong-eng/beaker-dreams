/**
 * The 3D stage the Diatomic Bond Explorer runs inside.
 *
 * A direct port of the `<three-d-stage>` web component the original artifact
 * used, minus the parts that only made sense in a standalone 3D-export page:
 * the OBJ/GLB download toolbar, its exporter imports and the host telemetry
 * postMessage. What is left is exactly what the scene depends on — a WebGL
 * renderer with alpha over the host's own background, neutral studio lighting
 * (hemisphere wash + shadow-casting key + dim fill), a soft ground shadow,
 * damped orbit controls that stop auto-rotating on first interaction, a camera
 * auto-framed to the object's bounding sphere, and resize handling.
 *
 * Nothing in this module runs until `new DiatomicStage(...)`, so importing it
 * on the server is inert.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class DiatomicStage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly ground: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>;
  /** Called once per frame, before the render. */
  onFrame: (() => void) | null = null;

  private readonly host: HTMLElement;
  private readonly key: THREE.DirectionalLight;
  private readonly resizeObserver: ResizeObserver;
  private object: THREE.Object3D | null = null;

  constructor(host: HTMLElement) {
    this.host = host;

    // preserveDrawingBuffer keeps the last frame readable after compositing,
    // which is what lets a screenshot capture the scene instead of a blank
    // canvas. alpha:true lets the host element's own background show through.
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.outline = "none";
    this.renderer = renderer;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    camera.position.set(3, 2.2, 4);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    this.controls = controls;

    // Neutral studio: soft sky/ground wash, a shadow-casting key light, and a
    // dim fill from behind so silhouettes never go black.
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0002;
    this.key = key;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.18 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.ground = ground;
    scene.add(ground);

    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    this.fit();
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(host);
    renderer.setAnimationLoop(() => {
      controls.update();
      this.onFrame?.();
      renderer.render(scene, camera);
    });
  }

  private fit(): void {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Show (and own) the object. Replaces any previous object, enables shadows on
   * every mesh, rests it on the ground plane and frames the camera to its
   * bounds.
   */
  setObject(object: THREE.Object3D): void {
    if (this.object) this.scene.remove(this.object);
    this.object = object;
    object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) {
      // Rest the object on the ground without moving its origin.
      this.ground.position.y = box.min.y;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const dist = (sphere.radius / Math.tan((this.camera.fov * Math.PI) / 360)) * 1.35;
      const dir = new THREE.Vector3(1, 0.55, 1.25).normalize();
      this.camera.position.copy(sphere.center).add(dir.multiplyScalar(dist));
      this.camera.near = Math.max(dist / 100, 0.01);
      this.camera.far = dist * 100;
      this.camera.updateProjectionMatrix();
      this.controls.target.copy(sphere.center);
      this.controls.update();
      const span = sphere.radius * 3;
      this.key.shadow.camera.left = -span;
      this.key.shadow.camera.right = span;
      this.key.shadow.camera.top = span;
      this.key.shadow.camera.bottom = -span;
      this.key.shadow.camera.updateProjectionMatrix();
    }
    this.scene.add(object);
  }

  /** Stop the loop and release every GPU resource the stage itself owns. */
  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.ground.geometry.dispose();
    this.ground.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
