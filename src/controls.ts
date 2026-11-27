import * as THREE from 'three';
import type { RoleConfig } from './roles';

export interface ControlCallbacks {
  onPause: () => void;
  onResume: () => void;
}

export class FirstPersonControls {
  readonly camera: THREE.PerspectiveCamera;
  private readonly element: HTMLElement;
  private readonly colliders: THREE.Box3[];
  private readonly callbacks: ControlCallbacks;
  private readonly keys = new Set<string>();
  private readonly playerRadius = 0.34;
  private yaw = 0;
  private pitch = 0;
  private active = false;
  private enabled = false;
  private paused = true;
  private lastFrame = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    element: HTMLElement,
    colliders: THREE.Box3[],
    callbacks: ControlCallbacks,
  ) {
    this.camera = camera;
    this.element = element;
    this.colliders = colliders;
    this.callbacks = callbacks;
    this.camera.rotation.order = 'YXZ';
    this.element.addEventListener('click', this.onClick);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  reset(role: RoleConfig): void {
    this.enabled = true;
    this.keys.clear();
    this.yaw = role.yaw;
    this.pitch = 0;
    this.camera.position.set(...role.position);
    this.updateCameraRotation();
    this.paused = true;
    this.lastFrame = 0;
  }

  disable(): void {
    this.enabled = false;
    this.paused = true;
    this.keys.clear();
    if (document.pointerLockElement === this.element) document.exitPointerLock();
  }

  resume(): void {
    if (!this.enabled) return;
    this.paused = false;
    this.lastFrame = performance.now();
    this.callbacks.onResume();
  }

  pause(): void {
    if (!this.enabled) return;
    this.paused = true;
    this.keys.clear();
    if (document.pointerLockElement === this.element) document.exitPointerLock();
    this.callbacks.onPause();
  }

  dispose(): void {
    this.element.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  update(now: number): void {
    if (!this.active || this.paused) return;
    const delta = Math.min((now - (this.lastFrame || now)) / 1000, 0.05);
    this.lastFrame = now;
    const forward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const strafe = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    if (!forward && !strafe) return;
    const speed = 5.2 * delta / Math.hypot(forward, strafe);
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const dx = (strafe * cos - forward * sin) * speed;
    const dz = (-strafe * sin - forward * cos) * speed;
    this.moveWithCollision(dx, dz);
  }

  private moveWithCollision(dx: number, dz: number): void {
    const nextX = this.camera.position.x + dx;
    if (!this.collides(nextX, this.camera.position.z)) this.camera.position.x = nextX;
    const nextZ = this.camera.position.z + dz;
    if (!this.collides(this.camera.position.x, nextZ)) this.camera.position.z = nextZ;
  }

  private collides(x: number, z: number): boolean {
    const point = new THREE.Vector3(x, this.camera.position.y, z);
    return this.colliders.some((collider) => {
      const closest = collider.clampPoint(point, new THREE.Vector3());
      const dx = point.x - closest.x;
      const dz = point.z - closest.z;
      return dx * dx + dz * dz < this.playerRadius * this.playerRadius;
    });
  }

  private updateCameraRotation(): void {
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  private onClick = (): void => {
    if (this.active && document.pointerLockElement !== this.element) {
      void this.element.requestPointerLock();
    }
  };

  private onPointerLockChange = (): void => {
    this.active = document.pointerLockElement === this.element;
    if (this.active) {
      this.paused = false;
      this.lastFrame = performance.now();
      this.callbacks.onResume();
    } else if (!this.paused) {
      this.pause();
    }
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.active || this.paused) return;
    this.yaw -= event.movementX * 0.0022;
    this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0022, -1.42, 1.42);
    this.updateCameraRotation();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Escape' && this.enabled) {
      event.preventDefault();
      this.pause();
      return;
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code) && this.active && !this.paused) {
      event.preventDefault();
      this.keys.add(event.code);
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onBlur = (): void => {
    this.keys.clear();
  };
}
