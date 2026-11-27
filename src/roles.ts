import type { Vector3Tuple } from 'three';

export type RoleId = 'snacker' | 'supervisor';

export interface RoleConfig {
  id: RoleId;
  label: string;
  position: Vector3Tuple;
  yaw: number;
  color: string;
  carriesSnack: boolean;
}

export const roles: Record<RoleId, RoleConfig> = {
  snacker: {
    id: 'snacker',
    label: '偷吃者',
    position: [0, 1.65, 11],
    yaw: 0,
    color: '#f4a261',
    carriesSnack: true,
  },
  supervisor: {
    id: 'supervisor',
    label: '监管者',
    position: [0, 1.65, -10],
    yaw: Math.PI,
    color: '#72a9a0',
    carriesSnack: false,
  },
};
