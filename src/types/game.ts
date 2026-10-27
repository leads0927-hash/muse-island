export type MissionId = 'click' | 'double-click' | 'drag' | 'paint' | 'right-click';

export interface Mission {
  id: MissionId;
  title: string;
  description: string;
  goal: string;
  difficulty: number;
  status: 'new' | 'progress' | 'done' | 'locked';
  progress: number;
  tone: 'sky' | 'sun' | 'mint' | 'peach' | 'lilac';
  xp: number;
  iconName: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tone: 'sky' | 'sun' | 'mint' | 'peach' | 'lilac';
  got: boolean;
  iconName: string;
}

export interface DailyQuest {
  id: string;
  text: string;
  done: boolean;
}

export interface ZoneConfig {
  id: MissionId;
  title: string;
  kind: MissionId;
  coords: [number, number]; // [x, z] in 3D world
}
