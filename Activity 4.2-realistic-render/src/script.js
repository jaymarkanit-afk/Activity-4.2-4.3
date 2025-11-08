import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

//Loader
const gltfLoader = new GLTFLoader();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//Texture Loader
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Lights
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
// Fix shadow acne for rounded surfaces
directionalLight.shadow.normalBias = 0.05;
directionalLight.shadow.bias = -0.0001;
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
// scene.add(directionalLightCameraHelper); // Uncomment to see light helper
scene.add(directionalLight);

//Model
let hamburgerModel = null;

gltfLoader.load("/models/hamburger.glb", (gltf) => {
  hamburgerModel = gltf.scene;
  hamburgerModel.scale.set(0.3, 0.3, 0.3);
  hamburgerModel.position.set(0, -1, 0);
  scene.add(hamburgerModel);

  // GUI - Model (created after model loads)
  const modelFolder = gui.addFolder("Hamburger Model");
  modelFolder
    .add(hamburgerModel.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Rotation Y");

  updateAllMaterials();
});

/**
 * Environment map
 */
let currentEnvironmentMapIndex = 0;
const environmentMapPaths = [
  ["/textures/environmentMaps/0/px.jpg", "/textures/environmentMaps/0/nx.jpg", "/textures/environmentMaps/0/py.jpg", "/textures/environmentMaps/0/ny.jpg", "/textures/environmentMaps/0/pz.jpg", "/textures/environmentMaps/0/nz.jpg"],
  ["/textures/environmentMaps/1/px.jpg", "/textures/environmentMaps/1/nx.jpg", "/textures/environmentMaps/1/py.jpg", "/textures/environmentMaps/1/ny.jpg", "/textures/environmentMaps/1/pz.jpg", "/textures/environmentMaps/1/nz.jpg"],
  ["/textures/environmentMaps/2/px.jpg", "/textures/environmentMaps/2/nx.jpg", "/textures/environmentMaps/2/py.jpg", "/textures/environmentMaps/2/ny.jpg", "/textures/environmentMaps/2/pz.jpg", "/textures/environmentMaps/2/nz.jpg"],
  ["/textures/environmentMaps/3/px.jpg", "/textures/environmentMaps/3/nx.jpg", "/textures/environmentMaps/3/py.jpg", "/textures/environmentMaps/3/ny.jpg", "/textures/environmentMaps/3/pz.jpg", "/textures/environmentMaps/3/nz.jpg"],
];

let environmentMap = cubeTextureLoader.load(environmentMapPaths[currentEnvironmentMapIndex]);
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;
scene.environment = environmentMap;

debugObject.envMapIntensity = 1;
debugObject.envMapIndex = 0;

// Initialize materials with environment map (will be called again when model loads)
// This ensures the ground gets the environment map immediately

const updateEnvironmentMap = () => {
  environmentMap = cubeTextureLoader.load(environmentMapPaths[debugObject.envMapIndex]);
  environmentMap.encoding = THREE.sRGBEncoding;
  scene.background = environmentMap;
  scene.environment = environmentMap;
  updateAllMaterials();
};

gui.add(debugObject, "envMapIndex", { "Map 0": 0, "Map 1": 1, "Map 2": 2, "Map 3": 3 }).name("Environment Map").onChange(updateEnvironmentMap);
gui.add(debugObject, "envMapIntensity").min(0).max(10).step(0.001).name("Env Map Intensity").onChange(() => {
  updateAllMaterials();
});

// GUI - Directional Light
const lightFolder = gui.addFolder("Directional Light");
lightFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("Intensity");
lightFolder
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("X");
lightFolder
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Y");
lightFolder
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Z");
lightFolder
  .add(directionalLight.shadow, "normalBias")
  .min(0)
  .max(0.1)
  .step(0.001)
  .name("Shadow Normal Bias");
lightFolder
  .add(directionalLight.shadow, "bias")
  .min(-0.01)
  .max(0.01)
  .step(0.0001)
  .name("Shadow Bias");
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 1.5, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// GUI - Tone Mapping (created after renderer is initialized)
const toneMappingFolder = gui.addFolder("Tone Mapping");
toneMappingFolder.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});
toneMappingFolder.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      // Handle both single materials and material arrays
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
          material.envMap = scene.environment;
          material.envMapIntensity = debugObject.envMapIntensity;
          material.needsUpdate = true;
        }
      });

      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Optional: Add subtle animation to the hamburger
  if (hamburgerModel) {
    // Slight rotation animation (optional - can be disabled)
    // hamburgerModel.rotation.y = elapsedTime * 0.1;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
