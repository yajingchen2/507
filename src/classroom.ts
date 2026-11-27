import * as THREE from 'three';

const palette = {
  wall: 0xf3e9d8,
  floor: 0xd7e7e2,
  trim: 0xc5d7d0,
  wood: 0xc98d55,
  woodLight: 0xe4b879,
  chair: 0x72a9a0,
  chairLight: 0x9bc7b9,
  board: 0x315c59,
  ink: 0xf2e5bc,
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
    const radius = options.radius ?? 0;
    colliders.push(new THREE.Box3(
      new THREE.Vector3(position[0] - size[0] / 2 - radius, 0, position[2] - size[2] / 2 - radius),
      new THREE.Vector3(position[0] + size[0] / 2 + radius, 2.4, position[2] + size[2] / 2 + radius),
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
  box(desk, [2.35, 0.14, 1.05], [0, 1.02, 0], palette.woodLight, { collider: true, radius: 0.12 });
  box(desk, [2.38, 0.12, 0.12], [0, 0.91, -0.46], palette.wood);
  for (const legX of [-0.92, 0.92]) {
    for (const legZ of [-0.35, 0.35]) box(desk, [0.09, 0.88, 0.09], [legX, 0.45, legZ], palette.wood);
  }
  box(desk, [1.35, 0.13, 0.83], [0, 0.53, 0.93], palette.chair, { collider: true, radius: 0.12 });
  box(desk, [1.35, 0.9, 0.13], [0, 0.99, 1.31], palette.chairLight, { collider: true, radius: 0.12 });
  for (const legX of [-0.51, 0.51]) {
    box(desk, [0.08, 0.5, 0.08], [legX, 0.25, 0.65], palette.wood);
    box(desk, [0.08, 0.72, 0.08], [legX, 0.37, 1.23], palette.wood);
  }
  if (seat % 3 !== 1) makeStudent(desk, 0, palette.chair);
}

function makeStudent(parent: THREE.Group, x: number, shirtColor: number): void {
  const person = new THREE.Group();
  person.position.set(x, 0.53, 1.05);
  parent.add(person);
  box(person, [0.72, 0.74, 0.44], [0, 0.48, 0.08], shirtColor);
  sphere(person, 0.32, [0, 1.12, -0.01], 0xf0bd91);
  sphere(person, 0.33, [0, 1.31, -0.045], 0x634b3c);
  for (const eyeX of [-0.12, 0.12]) sphere(person, 0.045, [eyeX, 1.14, -0.3], 0xffffff);
  for (const eyeX of [-0.12, 0.12]) sphere(person, 0.018, [eyeX, 1.14, -0.341], 0x283b42);
}

function makeTeacher(parent: THREE.Group): void {
  const person = new THREE.Group();
  person.position.set(0, 0, -8.65);
  parent.add(person);
  box(person, [0.9, 1.22, 0.54], [0, 0.82, 0], 0x638d87);
  sphere(person, 0.37, [0, 1.72, 0], 0xf0bd91);
  sphere(person, 0.38, [0, 1.96, 0.02], 0xddd4c4);
  box(person, [0.13, 0.72, 0.14], [-0.26, 0.34, 0], 0x384d4c);
  box(person, [0.13, 0.72, 0.14], [0.26, 0.34, 0], 0x384d4c);
  for (const eyeX of [-0.14, 0.14]) sphere(person, 0.055, [eyeX, 1.75, 0.32], 0xffffff);
  for (const eyeX of [-0.14, 0.14]) sphere(person, 0.023, [eyeX, 1.75, 0.37], 0x283b42);
}

export function createClassroom(scene: THREE.Scene): THREE.Box3[] {
  colliders.length = 0;
  const room = new THREE.Group();
  scene.add(room);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.96 });
  box(room, [20, 0.3, 32], [0, -0.15, 0], palette.floor, { material: floorMaterial });
  box(room, [20, 5.2, 0.45], [0, 2.6, -16], palette.wall, { collider: true, material: wallMaterial });
  box(room, [20, 5.2, 0.45], [0, 2.6, 16], palette.wall, { collider: true, material: wallMaterial });
  box(room, [0.45, 5.2, 32], [-10, 2.6, 0], palette.wall, { collider: true, material: wallMaterial });
  box(room, [0.45, 5.2, 32], [10, 2.6, 0], palette.wall, { collider: true, material: wallMaterial });
  box(room, [20, 0.22, 0.28], [0, 0.12, -15.68], palette.trim);
  box(room, [20, 0.22, 0.28], [0, 0.12, 15.68], palette.trim);

  box(room, [8.2, 2.05, 0.22], [0, 3.34, -15.66], palette.board);
  box(room, [8.65, 0.13, 0.34], [0, 2.28, -15.48], palette.wood);
  box(room, [0.11, 0.85, 0.025], [-2.4, 3.43, -15.51], palette.ink);
  box(room, [0.8, 0.08, 0.025], [-2.05, 3.06, -15.51], palette.ink);
  box(room, [0.11, 0.42, 0.025], [2.25, 3.42, -15.51], palette.ink);
  box(room, [0.72, 0.08, 0.025], [2.56, 3.23, -15.51], palette.ink);

  box(room, [3.8, 0.22, 1.45], [0, 1.05, -12.35], palette.woodLight, { collider: true });
  box(room, [3.3, 0.86, 1.12], [0, 0.54, -12.35], palette.wood, { collider: true });
  box(room, [3.2, 0.08, 0.06], [0, 0.28, -11.77], 0xad7445);
  makeTeacher(room);

  const rowPositions = [-5.4, -1.7, 2, 5.7, 9.4];
  const columns = [-6.25, 6.25];
  rowPositions.forEach((z, row) => columns.forEach((x, column) => makeDesk(room, x, z, row * 2 + column)));
  box(room, [0.16, 0.01, 31], [-1.65, 0.01, 0], 0xf4dca6);
  box(room, [0.16, 0.01, 31], [1.65, 0.01, 0], 0xf4dca6);
  box(room, [0.08, 0.01, 31], [-8.35, 0.01, 0], 0xf4dca6);
  box(room, [0.08, 0.01, 31], [8.35, 0.01, 0], 0xf4dca6);

  const ceiling = box(room, [19, 0.16, 30], [0, 5.15, 0], 0xffffff);
  ceiling.material = new THREE.MeshStandardMaterial({ color: 0xfaf5eb, roughness: 1, side: THREE.DoubleSide });
  for (const x of [-7, -3.5, 0, 3.5, 7]) {
    box(room, [0.7, 0.045, 1.15], [x, 5.04, -3], 0xfff0c4);
    const light = new THREE.PointLight(0xffedc4, 22, 10);
    light.position.set(x, 4.65, -3);
    scene.add(light);
  }
  for (const z of [-11.4, -3, 5, 12]) {
    const light = new THREE.PointLight(0xffedc4, 14, 8);
    light.position.set(0, 4.1, z);
    scene.add(light);
  }

  return colliders;
}
