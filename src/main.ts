import * as THREE from 'three';
import { createClassroom } from './classroom';
import { FirstPersonControls } from './controls';
import { roles, type RoleId } from './roles';
import './style.css';

const menu = document.querySelector<HTMLElement>('#menu')!;
const game = document.querySelector<HTMLElement>('#game')!;
const canvasHost = document.querySelector<HTMLElement>('#game-canvas')!;
const hud = document.querySelector<HTMLElement>('#hud')!;
const pauseMenu = document.querySelector<HTMLElement>('#pause-menu')!;
const startHint = document.querySelector<HTMLElement>('#start-hint')!;
const roleLabel = document.querySelector<HTMLElement>('#role-label')!;
const snack = document.querySelector<HTMLElement>('#snack')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
canvasHost.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdce9e3);
scene.fog = new THREE.Fog(0xdce9e3, 28, 52);
scene.add(new THREE.HemisphereLight(0xfff4dc, 0x829e99, 2.2));
const sunlight = new THREE.DirectionalLight(0xfff1d0, 2.4);
sunlight.position.set(-5, 10, 4);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
scene.add(sunlight);

const camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.1, 100);
const colliders = createClassroom(scene);
let controls: FirstPersonControls;

function updateOverlay(paused: boolean): void {
  hud.classList.toggle('hidden', paused);
  pauseMenu.classList.toggle('hidden', !paused);
  startHint.classList.toggle('hidden', paused || document.pointerLockElement === renderer.domElement);
}

controls = new FirstPersonControls(camera, renderer.domElement, colliders, {
  onPause: () => updateOverlay(true),
  onResume: () => updateOverlay(false),
});

function enterGame(roleId: RoleId): void {
  const role = roles[roleId];
  controls.reset(role);
  roleLabel.textContent = role.label;
  snack.classList.toggle('hidden', !role.carriesSnack);
  menu.classList.add('hidden');
  game.classList.remove('hidden');
  pauseMenu.classList.add('hidden');
  hud.classList.remove('hidden');
  startHint.classList.remove('hidden');
}

function returnToMenu(): void {
  controls.disable();
  game.classList.add('hidden');
  menu.classList.remove('hidden');
  pauseMenu.classList.add('hidden');
}

document.querySelectorAll<HTMLButtonElement>('[data-role]').forEach((button) => {
  button.addEventListener('click', () => enterGame(button.dataset.role as RoleId));
});
document.querySelector<HTMLButtonElement>('#resume-button')!.addEventListener('click', () => {
  if (document.pointerLockElement === renderer.domElement) {
    controls.resume();
  } else {
    void renderer.domElement.requestPointerLock();
  }
});
document.querySelector<HTMLButtonElement>('#menu-button')!.addEventListener('click', returnToMenu);

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== renderer.domElement && menu.classList.contains('hidden')
    && pauseMenu.classList.contains('hidden')) {
    startHint.classList.remove('hidden');
  }
});

function animate(now: number): void {
  requestAnimationFrame(animate);
  controls.update(now);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('beforeunload', () => controls.dispose());
