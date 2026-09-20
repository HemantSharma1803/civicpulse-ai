import { IncidentCategory } from '../../types';
import { DemoTeam, DemoUser } from './types';

export const DEMO_TEAMS: DemoTeam[] = [
  {
    id: 'team-roads',
    name: 'Roads Team',
    categorySpecialty: ['Pothole', 'Damaged Footpath'],
    leadName: 'Supervisor One',
    memberCount: 6,
    color: 'amber',
    description: 'Pavement patching, asphalt saw-cutting, footpath slabs, and arterial subbase remediation.',
  },
  {
    id: 'team-lighting',
    name: 'Lighting Team',
    categorySpecialty: ['Broken Streetlight', 'Traffic Signal Issue'],
    leadName: 'Field Technician B',
    memberCount: 4,
    color: 'blue',
    description: 'Public luminaire replacements, overhead feeder cabling, timer relays, and transit signal heads.',
  },
  {
    id: 'team-waste',
    name: 'Waste Management Team',
    categorySpecialty: ['Garbage Overflow'],
    leadName: 'Operator One',
    memberCount: 8,
    color: 'purple',
    description: 'Commercial market compactor deployment, municipal dumper clearing, and litter containment.',
  },
  {
    id: 'team-water',
    name: 'Water & Drainage Team',
    categorySpecialty: ['Water Leakage', 'Drainage Issue'],
    leadName: 'Field Technician A',
    memberCount: 5,
    color: 'cyan',
    description: 'Pressurized water main clamp repairs, box culvert desilting, storm drain gully unblocking.',
  },
  {
    id: 'team-infra',
    name: 'General Infrastructure Team',
    categorySpecialty: ['Traffic Signal Issue', 'Damaged Footpath'],
    leadName: 'Reviewer One',
    memberCount: 4,
    color: 'emerald',
    description: 'Multi-disciplinary rapid interventions, cross-agency junction safety, and hazard barriers.',
  },
];

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-op-1',
    name: 'Operator One',
    role: 'Central Dispatcher & Triage Specialist',
    teamId: 'team-waste',
    email: 'demo.operator1@mayura.local',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-tech-a',
    name: 'Field Technician A',
    role: 'Civil Works & Drainage Lead',
    teamId: 'team-water',
    email: 'demo.tech.a@mayura.local',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-tech-b',
    name: 'Field Technician B',
    role: 'Electrical & Transit Signals Specialist',
    teamId: 'team-lighting',
    email: 'demo.tech.b@mayura.local',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-sup-1',
    name: 'Supervisor One',
    role: 'Municipal Operations Field Supervisor',
    teamId: 'team-roads',
    email: 'demo.supervisor1@mayura.local',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-rev-1',
    name: 'Reviewer One',
    role: 'Quality Assurance & Post-Repair Auditor',
    teamId: 'team-infra',
    email: 'demo.reviewer1@mayura.local',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
  },
];

/**
 * Deterministic rule-based smart team suggestion for work order creation.
 */
export function suggestTeamForCategory(category: IncidentCategory): {
  team: DemoTeam;
  reason: string;
} {
  switch (category) {
    case 'Pothole':
    case 'Damaged Footpath':
      return {
        team: DEMO_TEAMS[0], // Roads Team
        reason: 'Automated workflow rule: Pavement and surface integrity routed to Roads Division.',
      };
    case 'Broken Streetlight':
      return {
        team: DEMO_TEAMS[1], // Lighting Team
        reason: 'Automated workflow rule: Public illumination and fixture repair routed to Lighting Team.',
      };
    case 'Garbage Overflow':
      return {
        team: DEMO_TEAMS[2], // Waste Management Team
        reason: 'Automated workflow rule: Solid waste, market refuse, and bin clearing routed to Waste Team.',
      };
    case 'Water Leakage':
    case 'Drainage Issue':
      return {
        team: DEMO_TEAMS[3], // Water & Drainage Team
        reason: 'Automated workflow rule: Pipe pressure mains, silted culverts, and stormwater drains routed to Water & Drainage Team.',
      };
    case 'Traffic Signal Issue':
      return {
        team: DEMO_TEAMS[1], // Lighting / Signal Team
        reason: 'Automated workflow rule: Microcontroller junction controllers and intersection signals routed to Electrical/Lighting Division.',
      };
    default:
      return {
        team: DEMO_TEAMS[4], // General Infrastructure Team
        reason: 'Automated workflow rule: General infrastructure hazard routed to Multi-Disciplinary Team.',
      };
  }
}
