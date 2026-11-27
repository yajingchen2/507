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
const snackCount = document.querySelector<HTMLElement>('#snack-count')!;
const actionHint = document.querySelector<HTMLElement>('#action-hint')!;
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
const classroom = createClassroom(scene);
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
let currentRole: RoleId | undefined;
let snackPortions = 0;
let primaryHeld = false;
let waitingForRelease = false;
let biteProgress = 0;
let controls: FirstPersonControls;

function updateOverlay(paused: boolean): void {
  hud.classList.toggle('hidden', paused);
  pauseMenu.classList.toggle('hidden', !paused);
  startHint.classList.toggle('hidden', paused || document.pointerLockElement === renderer.domElement);
  startHint.textContent = '点击画面继续 · Esc 暂停';
  if (paused) actionHint.classList.add('hidden');
}

function canPickUpSnack(): boolean {
  if (currentRole !== 'snacker' || snackPortions > 0 || !classroom.snackPickup.visible) return false;
  camera.updateMatrixWorld(true);
  classroom.snackPickup.updateWorldMatrix(true, true);
  raycaster.setFromCamera(screenCenter, camera);
  const [hit] = raycaster.intersectObject(classroom.snackPickup, true);
  return hit !== undefined && hit.distance <= 3;
}

function isInsideClassroom(): boolean {
  const { x, z } = camera.position;
  return x > -13.6 && x < 13.6 && z > -10.3 && z < 10.2;
}

function refreshSnackHud(): void {
  const visible = currentRole === 'snacker' && snackPortions > 0;
  snack.classList.toggle('hidden', !visible);
  snackCount.textContent = String(snackPortions);
}

controls = new FirstPersonControls(camera, renderer.domElement, classroom.colliders, {
  onPause: () => updateOverlay(true),
  onResume: () => updateOverlay(false),
  onLockError: () => {
    startHint.textContent = '鼠标锁定失败，请点击画面或继续按钮重试。';
    startHint.classList.remove('hidden');
  },
  onInteract: () => {
    if (!canPickUpSnack()) return;
    snackPortions = 2;
    classroom.snackPickup.visible = false;
    refreshSnackHud();
  },
  onPrimaryAction: (pressed) => {
    primaryHeld = pressed;
    biteProgress = 0;
    if (!pressed) waitingForRelease = false;
  },
});

function enterGame(roleId: RoleId): void {
  const role = roles[roleId];
  currentRole = roleId;
  snackPortions = 0;
  primaryHeld = false;
  waitingForRelease = false;
  biteProgress = 0;
  classroom.snackPickup.visible = true;
  refreshSnackHud();
  controls.reset(role);
  roleLabel.textContent = role.label;
  menu.classList.add('hidden');
  game.classList.remove('hidden');
  pauseMenu.classList.add('hidden');
  hud.classList.remove('hidden');
  startHint.classList.remove('hidden');
}

function returnToMenu(): void {
  controls.disable();
  currentRole = undefined;
  snackPortions = 0;
  primaryHeld = false;
  waitingForRelease = false;
  biteProgress = 0;
  classroom.snackPickup.visible = true;
  refreshSnackHud();
  actionHint.classList.add('hidden');
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
    controls.requestPointerLock();
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
  if (currentRole === 'snacker' && snackPortions > 0 && primaryHeld && !waitingForRelease && isInsideClassroom()) {
    biteProgress += Math.min((now - previousFrame) / 1000, 0.05);
    if (biteProgress >= 0.7) {
      snackPortions -= 1;
      waitingForRelease = true;
      biteProgress = 0;
      refreshSnackHud();
    }
  }
  previousFrame = now;
  actionHint.classList.add('hidden');
  if (pauseMenu.classList.contains('hidden') && currentRole === 'snacker') {
    if (canPickUpSnack()) {
      actionHint.textContent = '按 E 拾取饼干';
      actionHint.classList.remove('hidden');
    } else if (snackPortions > 0 && !isInsideClassroom()) {
      actionHint.textContent = '进入教室后按住左键吃';
      actionHint.classList.remove('hidden');
    } else if (snackPortions > 0 && waitingForRelease && isInsideClassroom()) {
      actionHint.textContent = '松开并再次按住左键，继续吃';
      actionHint.classList.remove('hidden');
    } else if (snackPortions > 0 && isInsideClassroom()) {
      actionHint.textContent = primaryHeld
        ? `按住左键吃 ${Math.min(100, Math.round(biteProgress / 0.7 * 100))}%`
        : '按住左键吃';
      actionHint.classList.remove('hidden');
    }
  }
  snack.style.setProperty('--bite-progress', `${Math.min(1, biteProgress / 0.7)}`);
  snack.classList.toggle('snack-one-left', snackPortions === 1);
  renderer.render(scene, camera);
}
let previousFrame = performance.now();
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('beforeunload', () => controls.dispose());
