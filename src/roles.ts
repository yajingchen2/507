import type { Vector3Tuple } from 'three';

export type RoleId = 'snacker' | 'supervisor';

export interface RoleConfig {
  id: RoleId;
  label: string;
  position: Vector3Tuple;
  yaw: number;
  color: string;
}

export const roles: Record<RoleId, RoleConfig> = {
  snacker: {
    id: 'snacker',
    label: '偷吃者',
    position: [10.15, 1.65, 18.5],
    yaw: 0,
    color: '#f4a261',
  },
  supervisor: {
    id: 'supervisor',
    label: '监管者',
    position: [4.1, 1.65, -6.15],
    yaw: Math.PI,
    color: '#72a9a0',
  },
};
