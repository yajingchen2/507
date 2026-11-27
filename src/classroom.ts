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

const studentLooks = [
  { jacket: 0x287a78, shirt: 0xe9bd54, pants: 0x303d57, hair: 0x50342b, style: 'swept' },
  { jacket: 0x773b68, shirt: 0x773b68, pants: 0x493b3b, hair: 0x4c3028, style: 'round' },
  { jacket: 0xe75d37, shirt: 0xe75d37, pants: 0x4c5637, hair: 0x60402e, style: 'curls' },
  { jacket: 0x275db4, shirt: 0xd7b879, pants: 0xc3a77c, hair: 0x50332b, style: 'bob' },
] as const;

const colliders: THREE.Box3[] = [];

export interface ClassroomSeat {
  id: string;
  target: THREE.Object3D;
  sittingPosition: THREE.Vector3Tuple;
  standingPosition: THREE.Vector3Tuple;
  yaw: number;
}

type ClassroomSeatPlacement = Omit<ClassroomSeat, 'target'>;

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

function ellipsoid(
  parent: THREE.Group,
  size: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
  color: number,
): THREE.Mesh {
  const mesh = sphere(parent, 1, position, color);
  mesh.scale.set(...size);
  return mesh;
}

function limb(
  parent: THREE.Group,
  start: THREE.Vector3Tuple,
  end: THREE.Vector3Tuple,
  radius: number,
  color: number,
): THREE.Mesh {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.78 }),
  );
  mesh.position.copy(from.add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makePurpleHoodieStudent(parent: THREE.Group): void {
  const person = new THREE.Group();
  parent.add(person);

  const purple = 0x773b68;
  const hood = 0x54294e;
  const skin = 0xf0bd91;
  const pants = 0x493b3b;

  ellipsoid(person, [0.2, 0.16, 0.2], [0, 0.66, 0.02], pants);
  ellipsoid(person, [0.17, 0.13, 0.2], [-0.17, 0.64, -0.02], pants);
  ellipsoid(person, [0.17, 0.13, 0.2], [0.17, 0.64, -0.02], pants);

  ellipsoid(person, [0.105, 0.31, 0.105], [-0.17, 0.51, -0.4], pants);
  ellipsoid(person, [0.105, 0.31, 0.105], [0.17, 0.51, -0.4], pants);
  ellipsoid(person, [0.115, 0.08, 0.18], [-0.17, 0.09, -0.49], 0xe9e0d1);
  ellipsoid(person, [0.115, 0.08, 0.18], [0.17, 0.09, -0.49], 0xe9e0d1);

  ellipsoid(person, [0.37, 0.34, 0.29], [0, 1.02, 0.04], purple);
  ellipsoid(person, [0.34, 0.16, 0.29], [0, 1.18, 0.08], hood);
  ellipsoid(person, [0.12, 0.2, 0.11], [-0.27, 1.1, 0.06], purple);
  ellipsoid(person, [0.12, 0.2, 0.11], [0.27, 1.1, 0.06], purple);

  for (const side of [-1, 1]) {
    limb(person, [side * 0.3, 1.14, 0.04], [side * 0.35, 1.0, -0.3], 0.105, purple);
    limb(person, [side * 0.35, 1.0, -0.3], [side * 0.31, 0.91, -0.68], 0.08, purple);
    ellipsoid(person, [0.09, 0.07, 0.075], [side * 0.31, 0.9, -0.69], skin);
  }
  ellipsoid(person, [0.085, 0.12, 0.09], [0, 1.19, 0.015], skin);

  ellipsoid(person, [0.305, 0.335, 0.27], [0, 1.48, 0.01], skin);
  for (const side of [-1, 1]) {
    ellipsoid(person, [0.07, 0.105, 0.075], [side * 0.29, 1.43, 0.005], skin);
    ellipsoid(person, [0.135, 0.15, 0.14], [side * 0.112, 1.51, -0.19], 0xfff8eb);
    sphere(person, 0.047, [side * 0.092, 1.5, -0.323], 0x292522);
    sphere(person, 0.014, [side * 0.078, 1.525, -0.337], 0xffffff);
  }
  ellipsoid(person, [0.075, 0.062, 0.055], [0, 1.42, -0.265], 0xd88d65);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.011, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x713c32 }),
  );
  smile.position.set(0, 1.365, -0.25);
  smile.rotation.set(0, Math.PI, Math.PI);
  person.add(smile);

  const hair = new THREE.Group();
  person.add(hair);
  ellipsoid(hair, [0.31, 0.19, 0.27], [0, 1.74, 0.045], 0x4c3028);
  ellipsoid(hair, [0.25, 0.09, 0.11], [0, 1.66, -0.17], 0x4c3028);
  ellipsoid(hair, [0.13, 0.1, 0.1], [-0.16, 1.64, -0.17], 0x4c3028);
  ellipsoid(hair, [0.13, 0.1, 0.1], [0.16, 1.64, -0.17], 0x4c3028);
}

function makeOrangeVestStudent(parent: THREE.Group): void {
  const person = new THREE.Group();
  parent.add(person);

  const orange = 0xe75d37;
  const cream = 0xf0dfc7;
  const olive = 0x4c5637;
  const skin = 0xf0bd91;

  ellipsoid(person, [0.2, 0.16, 0.2], [0, 0.66, 0.02], olive);
  ellipsoid(person, [0.17, 0.13, 0.2], [-0.17, 0.64, -0.02], olive);
  ellipsoid(person, [0.17, 0.13, 0.2], [0.17, 0.64, -0.02], olive);
  ellipsoid(person, [0.105, 0.31, 0.105], [-0.17, 0.51, -0.4], olive);
  ellipsoid(person, [0.105, 0.31, 0.105], [0.17, 0.51, -0.4], olive);
  ellipsoid(person, [0.115, 0.08, 0.18], [-0.17, 0.09, -0.49], 0xe9e0d1);
  ellipsoid(person, [0.115, 0.08, 0.18], [0.17, 0.09, -0.49], 0xe9e0d1);

  ellipsoid(person, [0.36, 0.33, 0.28], [0, 1.02, 0.04], cream);
  ellipsoid(person, [0.29, 0.32, 0.18], [-0.12, 1.03, -0.2], orange);
  ellipsoid(person, [0.29, 0.32, 0.18], [0.12, 1.03, -0.2], orange);
  box(person, [0.035, 0.51, 0.025], [0, 1.03, -0.375], 0xf4c59d);
  for (const y of [0.84, 0.99, 1.14, 1.28]) {
    sphere(person, 0.018, [0, y, -0.397], 0xf7d7b2);
  }

  for (const side of [-1, 1]) {
    limb(person, [side * 0.3, 1.14, 0.04], [side * 0.35, 1.0, -0.3], 0.105, cream);
    limb(person, [side * 0.35, 1.0, -0.3], [side * 0.31, 0.91, -0.65], 0.08, cream);
    ellipsoid(person, [0.09, 0.07, 0.075], [side * 0.31, 0.9, -0.66], skin);
  }
  ellipsoid(person, [0.085, 0.12, 0.09], [0, 1.19, 0.015], skin);

  ellipsoid(person, [0.305, 0.335, 0.27], [0, 1.48, 0.01], skin);
  for (const side of [-1, 1]) {
    ellipsoid(person, [0.07, 0.105, 0.075], [side * 0.29, 1.43, 0.005], skin);
    ellipsoid(person, [0.135, 0.15, 0.14], [side * 0.112, 1.51, -0.19], 0xfff8eb);
    sphere(person, 0.047, [side * 0.092, 1.5, -0.323], 0x292522);
    sphere(person, 0.014, [side * 0.078, 1.525, -0.337], 0xffffff);
  }
  ellipsoid(person, [0.075, 0.062, 0.055], [0, 1.42, -0.265], 0xd88d65);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.011, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x713c32 }),
  );
  smile.position.set(0, 1.365, -0.25);
  smile.rotation.set(0, Math.PI, Math.PI);
  person.add(smile);

  const hair = new THREE.Group();
  person.add(hair);
  ellipsoid(hair, [0.29, 0.17, 0.25], [0, 1.7, 0.055], 0x60402e);
  for (const [x, y, z, size] of [
    [-0.22, 1.66, -0.035, 0.15],
    [0, 1.76, 0.005, 0.17],
    [0.22, 1.66, -0.035, 0.15],
    [-0.31, 1.51, 0.04, 0.125],
    [0.31, 1.51, 0.04, 0.125],
  ]) {
    ellipsoid(hair, [size, size, size], [x, y, z], 0x60402e);
  }
  ellipsoid(hair, [0.19, 0.1, 0.15], [-0.13, 1.61, -0.17], 0x60402e);
  ellipsoid(hair, [0.19, 0.1, 0.15], [0.13, 1.61, -0.17], 0x60402e);
}

function makeBlueWorkwearStudent(parent: THREE.Group): void {
  const person = new THREE.Group();
  parent.add(person);

  const blue = 0x275db4;
  const darkBlue = 0x1e3e73;
  const khaki = 0xc3a77c;
  const cream = 0xe8dfce;
  const skin = 0xf0bd91;
  const hairColor = 0x50332b;

  ellipsoid(person, [0.2, 0.16, 0.2], [0, 0.66, 0.02], khaki);
  ellipsoid(person, [0.17, 0.13, 0.2], [-0.17, 0.64, -0.02], khaki);
  ellipsoid(person, [0.17, 0.13, 0.2], [0.17, 0.64, -0.02], khaki);
  ellipsoid(person, [0.105, 0.31, 0.105], [-0.17, 0.51, -0.4], khaki);
  ellipsoid(person, [0.105, 0.31, 0.105], [0.17, 0.51, -0.4], khaki);
  ellipsoid(person, [0.115, 0.08, 0.18], [-0.17, 0.09, -0.49], darkBlue);
  ellipsoid(person, [0.115, 0.08, 0.18], [0.17, 0.09, -0.49], darkBlue);

  ellipsoid(person, [0.36, 0.34, 0.28], [0, 1.02, 0.04], blue);
  ellipsoid(person, [0.17, 0.29, 0.035], [0, 1.02, -0.258], cream);
  for (const stripeY of [0.87, 0.99, 1.11, 1.23]) {
    box(person, [0.17, 0.035, 0.025], [0, stripeY, -0.29], 0x91bfdc);
  }
  ellipsoid(person, [0.1, 0.13, 0.035], [-0.12, 1.22, -0.26], blue);
  ellipsoid(person, [0.1, 0.13, 0.035], [0.12, 1.22, -0.26], blue);
  for (const side of [-1, 1]) {
    limb(person, [side * 0.29, 1.15, 0.04], [side * 0.36, 0.92, -0.22], 0.105, blue);
    limb(person, [side * 0.36, 0.92, -0.22], [side * 0.3, 0.8, -0.48], 0.08, blue);
    ellipsoid(person, [0.09, 0.07, 0.075], [side * 0.3, 0.79, -0.49], skin);
    box(person, [0.2, 0.07, 0.04], [side * 0.3, 0.91, -0.27], darkBlue);
    box(person, [0.18, 0.1, 0.045], [side * 0.18, 0.86, -0.23], 0x204e9d);
  }

  ellipsoid(person, [0.085, 0.12, 0.09], [0, 1.19, 0.015], skin);
  ellipsoid(person, [0.305, 0.335, 0.27], [0, 1.48, 0.01], skin);
  for (const side of [-1, 1]) {
    ellipsoid(person, [0.07, 0.105, 0.075], [side * 0.29, 1.43, 0.005], skin);
    ellipsoid(person, [0.135, 0.15, 0.14], [side * 0.112, 1.51, -0.19], 0xfff8eb);
    sphere(person, 0.047, [side * 0.092, 1.5, -0.323], 0x292522);
    sphere(person, 0.014, [side * 0.078, 1.525, -0.337], 0xffffff);
  }
  ellipsoid(person, [0.075, 0.062, 0.055], [0, 1.42, -0.265], 0xd88d65);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.011, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x713c32 }),
  );
  smile.position.set(0, 1.365, -0.25);
  smile.rotation.set(0, Math.PI, Math.PI);
  person.add(smile);

  const hair = new THREE.Group();
  person.add(hair);
  ellipsoid(hair, [0.31, 0.19, 0.27], [0, 1.72, 0.045], hairColor);
  ellipsoid(hair, [0.16, 0.12, 0.18], [-0.15, 1.62, 0.01], hairColor);
  ellipsoid(hair, [0.16, 0.12, 0.18], [0.15, 1.62, 0.01], hairColor);
  ellipsoid(hair, [0.1, 0.19, 0.14], [-0.27, 1.48, 0.045], hairColor);
  ellipsoid(hair, [0.1, 0.19, 0.14], [0.27, 1.48, 0.045], hairColor);
  ellipsoid(hair, [0.12, 0.17, 0.16], [-0.15, 1.74, -0.03], hairColor);
  ellipsoid(hair, [0.12, 0.17, 0.16], [0.15, 1.74, -0.03], hairColor);

  for (const side of [-1, 1]) {
    ellipsoid(person, [0.15, 0.17, 0.22], [side * 0.18, 0.6, -0.18], khaki);
    limb(person, [side * 0.18, 0.57, -0.2], [side * 0.18, 0.36, -0.53], 0.09, khaki);
    ellipsoid(person, [0.11, 0.07, 0.16], [side * 0.18, 0.1, -0.36], darkBlue);
  }
}

function makeDesk(parent: THREE.Group, x: number, z: number, seat: number, sitSpot?: ClassroomSeatPlacement): ClassroomSeat | undefined {
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
  if (sitSpot) {
    const target = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 1.3, 0.55),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    target.position.set(0, 0.9, 0.18);
    chair.add(target);
    return { ...sitSpot, target };
  }
  makeStudent(chair, seat);
  return undefined;
}

function makeStudent(parent: THREE.Group, seat: number): void {
  const look = studentLooks[seat % studentLooks.length];
  if (look.style === 'round') {
    makePurpleHoodieStudent(parent);
    return;
  }
  if (look.style === 'curls') {
    makeOrangeVestStudent(parent);
    return;
  }
  if (look.style === 'bob') {
    makeBlueWorkwearStudent(parent);
    return;
  }
  const person = new THREE.Group();
  parent.add(person);
  const upperBody = new THREE.Group();
  upperBody.position.y = 0.27;
  person.add(upperBody);
  ellipsoid(upperBody, [0.35, 0.4, 0.29], [0, 0.91, -0.01], look.jacket);
  ellipsoid(upperBody, [0.15, 0.31, 0.035], [0, 0.94, -0.3], look.shirt);

  box(upperBody, [0.035, 0.32, 0.04], [0, 0.93, -0.34], 0xe3c47c);
  ellipsoid(upperBody, [0.12, 0.08, 0.045], [-0.09, 1.2, -0.28], 0xf2e5d0);
  ellipsoid(upperBody, [0.12, 0.08, 0.045], [0.09, 1.2, -0.28], 0xf2e5d0);
  for (const side of [-1, 1]) {
    limb(upperBody, [side * 0.29, 1.13, 0], [side * 0.36, 0.91, -0.12], 0.105, 0xf2e5d0);
    limb(upperBody, [side * 0.36, 0.91, -0.12], [side * 0.29, 0.79, -0.39], 0.085, 0xf2e5d0);
    box(upperBody, [0.19, 0.07, 0.035], [side * 0.29, 0.87, -0.2], 0x1d6867);
    ellipsoid(upperBody, [0.09, 0.07, 0.08], [side * 0.28, 0.77, -0.41], palette.skin);
    sphere(upperBody, 0.045, [side * 0.19, 0.95, -0.27], 0xe4c786);
  }

  const hair = new THREE.Group();
  upperBody.add(hair);
  ellipsoid(hair, [0.3, 0.17, 0.28], [-0.04, 1.34, 0.02], look.hair);
  ellipsoid(hair, [0.2, 0.13, 0.2], [0.17, 1.37, 0.055], look.hair);
  ellipsoid(hair, [0.15, 0.12, 0.19], [-0.22, 1.28, 0.07], look.hair);
  ellipsoid(hair, [0.19, 0.08, 0.17], [-0.36, 1.34, 0.05], look.hair);

  ellipsoid(upperBody, [0.25, 0.29, 0.25], [0, 1.1, 0.02], palette.skin);
  for (const side of [-1, 1]) {
    ellipsoid(upperBody, [0.065, 0.09, 0.07], [side * 0.23, 1.1, 0.02], palette.skin);
    ellipsoid(upperBody, [0.14, 0.155, 0.145], [side * 0.11, 1.13, -0.19], 0xfff8ea);
    sphere(upperBody, 0.055, [side * 0.09, 1.12, -0.32], 0x292522);
  }
  ellipsoid(upperBody, [0.035, 0.045, 0.03], [0, 1.04, -0.24], 0xd88d65);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.062, 0.01, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x713c32 }),
  );
  smile.position.set(0, 0.98, -0.245);
  smile.rotation.set(0, Math.PI, Math.PI);
  upperBody.add(smile);

  for (const side of [-1, 1]) {
    ellipsoid(person, [0.15, 0.17, 0.22], [side * 0.18, 0.6, -0.18], look.pants);
    limb(person, [side * 0.18, 0.57, -0.2], [side * 0.18, 0.36, -0.53], 0.09, look.pants);
    ellipsoid(
      person,
      [0.11, 0.07, 0.16],
      [side * 0.18, 0.1, -0.36],
      0xe87540,
    );
  }
}

function makeTeacher(parent: THREE.Group): void {
  const person = new THREE.Group();
  person.position.set(-3.15, 0, -7.5);
  parent.add(person);

  const cardigan = 0xe2a51c;
  const cream = 0xf5ebda;
  const hair = 0x55423b;
  ellipsoid(person, [0.36, 0.53, 0.28], [0, 1.12, 0], cardigan);
  ellipsoid(person, [0.18, 0.34, 0.045], [0, 1.1, 0.285], cream);
  ellipsoid(person, [0.12, 0.13, 0.055], [-0.11, 1.38, 0.29], cream).rotation.z = -0.28;
  ellipsoid(person, [0.12, 0.13, 0.055], [0.11, 1.38, 0.29], cream).rotation.z = 0.28;
  for (const side of [-1, 1]) {
    limb(person, [side * 0.3, 1.3, 0], [side * 0.45, 1.02, 0.12], 0.125, cardigan);
    ellipsoid(person, [0.13, 0.14, 0.12], [side * 0.45, 0.98, 0.15], palette.skin);
    ellipsoid(person, [0.17, 0.11, 0.22], [side * 0.17, 0.66, 0], 0x393336);
    limb(person, [side * 0.17, 0.62, 0], [side * 0.17, 0.19, 0], 0.12, 0x393336);
    ellipsoid(person, [0.16, 0.09, 0.21], [side * 0.17, 0.085, 0.03], 0x66442f);
  }

  for (const side of [-1, 1]) ellipsoid(person, [0.08, 0.11, 0.075], [side * 0.29, 1.78, 0.015], 0xec9e70);
  ellipsoid(person, [0.32, 0.4, 0.29], [0, 1.8, 0], palette.skin);
  ellipsoid(person, [0.3, 0.15, 0.28], [0, 2.12, 0.025], hair);
  ellipsoid(person, [0.12, 0.21, 0.16], [-0.27, 1.99, 0.035], hair);
  ellipsoid(person, [0.12, 0.21, 0.16], [0.27, 1.99, 0.035], hair);
  ellipsoid(person, [0.16, 0.12, 0.12], [-0.18, 2.18, -0.01], hair);
  ellipsoid(person, [0.16, 0.12, 0.12], [0.18, 2.18, -0.01], hair);

  for (const side of [-1, 1]) {
    ellipsoid(person, [0.16, 0.18, 0.16], [side * 0.12, 1.82, 0.215], 0xfff8eb);
    sphere(person, 0.065, [side * 0.095, 1.82, 0.365], 0x282522);
    sphere(person, 0.018, [side * 0.078, 1.85, 0.38], 0xffffff);
  }
  ellipsoid(person, [0.045, 0.055, 0.04], [0, 1.72, 0.27], 0xd98d64);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 8, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x713c32 }),
  );
  smile.position.set(0, 1.66, 0.267);
  smile.rotation.set(0, 0, Math.PI);
  person.add(smile);

  box(person, [0.045, 0.36, 0.035], [-0.09, 1.36, 0.31], 0x2d70bd).rotation.z = -0.22;
  box(person, [0.045, 0.36, 0.035], [0.09, 1.36, 0.31], 0x2d70bd).rotation.z = 0.22;
  box(person, [0.3, 0.22, 0.07], [0, 1.15, 0.34], 0x2466ae);
  box(person, [0.2, 0.13, 0.025], [0, 1.15, 0.385], 0xe8f0ed);
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
  seats: ClassroomSeat[];
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

  const seats: ClassroomSeat[] = [];
  const rowPositions = [-3.65, 0.05, 3.75];
  const columns = [-8.45, -4.8, 4.8, 8.45];
  rowPositions.forEach((z, row) => columns.forEach((x, column) => {
    let sitSpot: ClassroomSeatPlacement | undefined;
    if (row === 2 && column === 0) {
      sitSpot = {
        id: 'rear-window',
        sittingPosition: [x, 1.3, z + 1.28],
        standingPosition: [-10.65, 1.65, z + 1.28],
        yaw: 0,
      };
    } else if (row === 1 && column === 2) {
      sitSpot = {
        id: 'middle-aisle',
        sittingPosition: [x, 1.3, z + 1.28],
        standingPosition: [3.05, 1.65, z + 1.28],
        yaw: 0,
      };
    }
    const madeSeat = makeDesk(room, x, z, row * 4 + column, sitSpot);
    if (madeSeat) seats.push(madeSeat);
  }));

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
  return { colliders, snackPickup, seats };
}
