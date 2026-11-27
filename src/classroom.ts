import * as THREE from 'three';

const palette = {
  wall: 0xf3e9d8,
  floor: 0xd7e7e2,
  trim: 0xc5d7d0,
  wood: 0xc98d55,
  woodLight: 0xe4b879,
  chair: 0x72a9a0,
  chairLight: 0x9bc7b9,
  uniform: 0x568b86,
  uniformDark: 0x405e60,
  board: 0x315c59,
  ink: 0xf2e5bc,
  skin: 0xf0bd91,
};

const colliders: THREE.Box3[] = [];

function box(
  parent: THREE.Group,
  size: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
  color: number,
  options: { collider?: boolean; material?: THREE.Material; radius?: number } = {},
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(...size);
  const material = options.material ?? new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = size[1] > 0.18;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (options.collider) {
    mesh.updateWorldMatrix(true, false);
    const worldPosition = mesh.getWorldPosition(new THREE.Vector3());
    const radius = options.radius ?? 0;
    colliders.push(new THREE.Box3(
      new THREE.Vector3(worldPosition.x - size[0] / 2 - radius, 0, worldPosition.z - size[2] / 2 - radius),
      new THREE.Vector3(worldPosition.x + size[0] / 2 + radius, 2.4, worldPosition.z + size[2] / 2 + radius),
    ));
  }
  return mesh;
}

function sphere(parent: THREE.Group, radius: number, position: THREE.Vector3Tuple, color: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 18, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 }),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeDesk(parent: THREE.Group, x: number, z: number, seat: number): void {
  const desk = new THREE.Group();
  desk.position.set(x, 0, z);
  parent.add(desk);

  box(desk, [2.35, 0.14, 1.08], [0, 1.02, 0], palette.woodLight, { collider: true, radius: 0.12 });
  box(desk, [2.2, 0.1, 0.12], [0, 0.91, -0.46], palette.wood);
  for (const legX of [-0.98, 0.98]) {
    for (const legZ of [-0.39, 0.39]) {
      box(desk, [0.09, 0.9, 0.09], [legX, 0.45, legZ], palette.wood);
    }
  }

  const chair = new THREE.Group();
  chair.position.z = 1.28;
  desk.add(chair);
  box(chair, [1.32, 0.13, 0.82], [0, 0.52, 0], palette.chair, { collider: true, radius: 0.12 });
  box(chair, [1.32, 0.62, 0.12], [0, 0.87, 0.35], palette.chairLight, { collider: true, radius: 0.1 });
  for (const legX of [-0.52, 0.52]) {
    for (const legZ of [-0.3, 0.3]) {
      box(chair, [0.08, 0.5, 0.08], [legX, 0.25, legZ], palette.wood);
    }
  }
  makeStudent(chair, seat);
}

function makeStudent(parent: THREE.Group, seat: number): void {
  const person = new THREE.Group();
  person.position.set(0, 0, -0.02);
  parent.add(person);
  box(person, [0.7, 0.72, 0.4], [0, 0.87, 0.08], seat % 2 === 0 ? palette.uniform : palette.uniformDark);
  box(person, [0.23, 0.45, 0.34], [-0.19, 0.25, -0.42], 0x536d70);
  box(person, [0.23, 0.45, 0.34], [0.19, 0.25, -0.42], 0x536d70);
  sphere(person, 0.31, [0, 1.5, 0.02], palette.skin);
  sphere(person, 0.32, [0, 1.68, 0.045], 0x634b3c);
  for (const eyeX of [-0.12, 0.12]) sphere(person, 0.042, [eyeX, 1.52, -0.27], 0xffffff);
  for (const eyeX of [-0.12, 0.12]) sphere(person, 0.017, [eyeX, 1.52, -0.309], 0x283b42);
}

function makeTeacher(parent: THREE.Group): void {
  const person = new THREE.Group();
  person.position.set(-3.15, 0, -7.5);
  parent.add(person);
  box(person, [0.82, 1.18, 0.52], [0, 0.84, 0], 0x638d87);
  box(person, [0.17, 0.7, 0.18], [-0.22, 0.35, 0], 0x384d4c);
  box(person, [0.17, 0.7, 0.18], [0.22, 0.35, 0], 0x384d4c);
  sphere(person, 0.35, [0, 1.64, 0], palette.skin);
  sphere(person, 0.36, [0, 1.87, 0.04], 0xddd4c4);
  for (const eyeX of [-0.13, 0.13]) sphere(person, 0.05, [eyeX, 1.66, 0.31], 0xffffff);
  for (const eyeX of [-0.13, 0.13]) sphere(person, 0.021, [eyeX, 1.66, 0.354], 0x283b42);
}

function makeWindows(room: THREE.Group): void {
  const sideX = -13.8;
  const windowCenters = [-5.2, 0, 5.2];
  const windowWidth = 2.65;
  const windowHeight = 2.2;
  const wallThickness = 0.45;
  const wallHeight = 5.2;
  const windowBottom = 1.35;

  const spans: Array<[number, number]> = [[-10.5, -6.525], [-3.875, -1.325], [1.325, 3.875], [6.525, 10.5]];
  for (const [start, end] of spans) {
    box(room, [wallThickness, wallHeight, end - start], [sideX, wallHeight / 2, (start + end) / 2], palette.wall, { collider: true });
  }

  for (const z of windowCenters) {
    box(room, [wallThickness, windowBottom, windowWidth], [sideX, windowBottom / 2, z], palette.wall, { collider: true });
    const topHeight = wallHeight - windowBottom - windowHeight;
    box(room, [wallThickness, topHeight, windowWidth], [sideX, windowBottom + windowHeight + topHeight / 2, z], palette.wall, { collider: true });

    const pane = new THREE.Mesh(
      new THREE.PlaneGeometry(windowWidth, windowHeight),
      new THREE.MeshStandardMaterial({ color: 0xa9d9db, emissive: 0x567b78, emissiveIntensity: 0.18, roughness: 0.3, side: THREE.DoubleSide }),
    );
    pane.rotation.y = Math.PI / 2;
    pane.position.set(sideX + wallThickness / 2 + 0.015, windowBottom + windowHeight / 2, z);
    room.add(pane);

    const frameColor = 0xfaf5eb;
    box(room, [0.14, windowHeight + 0.18, 0.14], [sideX + 0.28, windowBottom + windowHeight / 2, z - windowWidth / 2], frameColor);
    box(room, [0.14, windowHeight + 0.18, 0.14], [sideX + 0.28, windowBottom + windowHeight / 2, z + windowWidth / 2], frameColor);
    box(room, [0.14, 0.13, windowWidth + 0.1], [sideX + 0.28, windowBottom, z], frameColor);
    box(room, [0.14, 0.13, windowWidth + 0.1], [sideX + 0.28, windowBottom + windowHeight, z], frameColor);
    box(room, [0.2, 0.07, windowWidth + 0.24], [sideX + 0.34, windowBottom, z], palette.woodLight);
  }
}

function makeRearDoor(room: THREE.Group): void {
  const doorLeft = 8.7;
  const doorRight = 11.6;
  const backZ = 10.5;
  box(room, [doorLeft + 14, 5.2, 0.45], [(doorLeft - 14) / 2, 2.6, backZ], palette.wall, { collider: true });
  box(room, [14 - doorRight, 5.2, 0.45], [(doorRight + 14) / 2, 2.6, backZ], palette.wall, { collider: true });
  box(room, [doorRight - doorLeft, 2.55, 0.45], [(doorLeft + doorRight) / 2, 3.925, backZ], palette.wall);

  box(room, [0.16, 2.7, 0.2], [doorLeft, 1.35, backZ - 0.12], palette.wood);
  box(room, [0.16, 2.7, 0.2], [doorRight, 1.35, backZ - 0.12], palette.wood);
  box(room, [doorRight - doorLeft + 0.16, 0.16, 0.2], [(doorLeft + doorRight) / 2, 2.7, backZ - 0.12], palette.wood);

  const door = new THREE.Group();
  door.position.set(doorLeft + 0.04, 0, backZ + 0.2);
  door.rotation.y = -Math.PI / 2;
  room.add(door);
  box(door, [2.55, 2.5, 0.12], [1.275, 1.25, 0], 0xb77b4a);
  box(door, [0.08, 1.9, 0.04], [1.275, 1.25, -0.08], 0xd9a36c);
  sphere(door, 0.07, [2.25, 1.18, -0.1], 0xf2d28d);
}

function makePickupCookie(room: THREE.Group): THREE.Group {
  const shelfPosition = new THREE.Vector3(7.2, 0, 15.3);
  box(room, [1.15, 0.9, 1.65], [shelfPosition.x, 0.45, shelfPosition.z], palette.wood, { collider: true });
  box(room, [1.25, 0.09, 1.76], [shelfPosition.x, 0.94, shelfPosition.z], palette.woodLight);
  box(room, [1.08, 0.08, 0.09], [shelfPosition.x, 0.28, shelfPosition.z - 0.73], palette.woodLight);

  const pickup = new THREE.Group();
  pickup.position.set(7.95, 1.13, shelfPosition.z);
  room.add(pickup);
  const cookie = sphere(pickup, 0.28, [0, 0, 0], 0xe7ad62);
  cookie.scale.set(1, 0.36, 1);
  for (const [x, z] of [[-0.13, -0.1], [0.12, -0.14], [-0.04, 0.12], [0.17, 0.1], [-0.19, 0.08]]) {
    const chip = sphere(pickup, 0.035, [x, 0.085, z], 0x70452f);
    chip.scale.set(1, 0.5, 1);
  }
  return pickup;
}

export interface ClassroomScene {
  colliders: THREE.Box3[];
  snackPickup: THREE.Group;
}

export function createClassroom(scene: THREE.Scene): ClassroomScene {
  colliders.length = 0;
  const room = new THREE.Group();
  scene.add(room);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.96 });
  box(room, [28, 0.3, 21], [0, -0.15, 0], palette.floor, { material: floorMaterial });
  box(room, [7.75, 0.3, 10.2], [10.125, -0.15, 15.6], palette.floor, { material: floorMaterial });

  box(room, [28, 5.2, 0.45], [0, 2.6, -10.5], palette.wall, { collider: true, material: wallMaterial });
  makeRearDoor(room);
  box(room, [0.45, 5.2, 21], [14, 2.6, 0], palette.wall, { collider: true, material: wallMaterial });
  box(room, [0.45, 5.2, 10], [6.25, 2.6, 15.5], palette.wall, { collider: true, material: wallMaterial });
  box(room, [0.45, 5.2, 10], [14, 2.6, 15.5], palette.wall, { collider: true, material: wallMaterial });
  box(room, [8.2, 5.2, 0.45], [10.15, 2.6, 20.5], palette.wall, { collider: true, material: wallMaterial });
  makeWindows(room);
  box(room, [28, 0.22, 0.28], [0, 0.12, -10.18], palette.trim);
  box(room, [22.7, 0.22, 0.28], [-2.65, 0.12, 10.18], palette.trim);
  box(room, [2.4, 0.22, 0.28], [12.8, 0.12, 10.18], palette.trim);

  box(room, [11.4, 2.35, 0.22], [0, 3.45, -10.22], palette.board);
  box(room, [11.9, 0.13, 0.34], [0, 2.22, -10.03], palette.wood);
  box(room, [0.11, 0.92, 0.025], [-3.45, 3.49, -10.06], palette.ink);
  box(room, [0.88, 0.08, 0.025], [-3.08, 3.07, -10.06], palette.ink);
  box(room, [0.11, 0.48, 0.025], [2.82, 3.46, -10.06], palette.ink);
  box(room, [0.78, 0.08, 0.025], [3.15, 3.24, -10.06], palette.ink);

  box(room, [3.5, 0.18, 1.25], [0, 1.04, -7.7], palette.woodLight, { collider: true });
  box(room, [3.15, 0.82, 1.05], [0, 0.51, -7.7], palette.wood, { collider: true });
  for (const legX of [-1.25, 1.25]) {
    box(room, [0.12, 0.45, 0.12], [legX, 0.23, -7.7], palette.wood);
  }
  makeTeacher(room);

  const rowPositions = [-3.65, 0.05, 3.75];
  const columns = [-8.45, -4.8, 4.8, 8.45];
  rowPositions.forEach((z, row) => columns.forEach((x, column) => makeDesk(room, x, z, row * 4 + column)));

  box(room, [0.14, 0.01, 20], [-1.55, 0.01, 0], 0xf4dca6);
  box(room, [0.14, 0.01, 20], [1.55, 0.01, 0], 0xf4dca6);
  box(room, [0.08, 0.01, 20], [-11.55, 0.01, 0], 0xf4dca6);
  box(room, [0.08, 0.01, 20], [11.55, 0.01, 0], 0xf4dca6);
  box(room, [27, 0.01, 0.08], [0, 0.01, 6.1], 0xf4dca6);

  const ceiling = box(room, [27, 0.16, 20], [0, 5.15, 0], 0xffffff);
  ceiling.material = new THREE.MeshStandardMaterial({ color: 0xfaf5eb, roughness: 1, side: THREE.DoubleSide });
  for (const x of [-9, -4.5, 0, 4.5, 9]) {
    box(room, [1.2, 0.045, 0.7], [x, 5.04, -2.5], 0xfff0c4);
    const light = new THREE.PointLight(0xffedc4, 18, 9);
    light.position.set(x, 4.65, -2.5);
    scene.add(light);
  }
  for (const z of [-8, -2, 4, 9]) {
    const light = new THREE.PointLight(0xffedc4, 12, 8);
    light.position.set(0, 4.1, z);
    scene.add(light);
  }

  const snackPickup = makePickupCookie(room);
  return { colliders, snackPickup };
}
