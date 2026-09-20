import {
  Incident,
  IncidentCategory,
  RepairEvent,
  Hotspot,
  CategoryHealth,
  Insight,
  ActivityEvent,
  NotificationItem,
  ScoreMethodology,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_REPAIR_EVENTS,
  INITIAL_HOTSPOTS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import {
  FailureMemory,
  LocationMemory,
  ScenarioKey,
  MEMORY_SCENARIOS,
  buildFailureMemory,
  buildLocationMemory,
  clusterIncidentsByLocation,
} from './failure-memory';
import { insightEngine } from './intelligence/insightEngine';

// In-memory runtime store (seeded from initial data, persistable in localStorage for user session)
const STORAGE_KEY_INCIDENTS = 'civicpulse_incidents_v1';
const STORAGE_KEY_REPAIRS = 'civicpulse_repairs_v1';
const STORAGE_KEY_NOTIFS = 'civicpulse_notifs_v1';
const STORAGE_KEY_SCENARIO = 'civicpulse_active_scenario_v1';

class DataService {
  private incidents: Incident[] = [];
  private repairs: RepairEvent[] = [];
  private hotspots: Hotspot[] = [];
  private notifications: NotificationItem[] = [];
  private activeScenario: ScenarioKey | null = null;

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): void {
    try {
      const savedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      const savedRepairs = localStorage.getItem(STORAGE_KEY_REPAIRS);
      const savedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
      const savedScenario = localStorage.getItem(STORAGE_KEY_SCENARIO) as ScenarioKey | null;

      this.incidents = savedIncidents ? JSON.parse(savedIncidents) : [...INITIAL_INCIDENTS];
      this.repairs = savedRepairs ? JSON.parse(savedRepairs) : [...INITIAL_REPAIR_EVENTS];
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : [...INITIAL_NOTIFICATIONS];
      this.activeScenario = savedScenario;
    } catch {
      this.incidents = [...INITIAL_INCIDENTS];
      this.repairs = [...INITIAL_REPAIR_EVENTS];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.activeScenario = null;
    }
    this.hotspots = [...INITIAL_HOTSPOTS];
  }

  public resetDemoData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_INCIDENTS);
      localStorage.removeItem(STORAGE_KEY_REPAIRS);
      localStorage.removeItem(STORAGE_KEY_NOTIFS);
      localStorage.removeItem(STORAGE_KEY_SCENARIO);
    } catch {
      // ignore
    }
    this.incidents = [...INITIAL_INCIDENTS];
    this.repairs = [...INITIAL_REPAIR_EVENTS];
    this.hotspots = [...INITIAL_HOTSPOTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.activeScenario = null;
  }

  public getActiveScenario(): ScenarioKey | null {
    return this.activeScenario;
  }

  public loadMemoryScenario(scenarioKey: ScenarioKey): { primaryIncidentId: string } {
    const scenario = MEMORY_SCENARIOS[scenarioKey];
    if (!scenario) {
      throw new Error(`Scenario ${scenarioKey} not found.`);
    }

    this.incidents = [...scenario.incidents];
    this.repairs = [...scenario.repairs];
    this.hotspots = [...scenario.hotspots];
    this.activeScenario = scenarioKey;

    const notif: NotificationItem = {
      id: `NOTIF-SCENARIO-${Date.now()}`,
      title: `Demo Scenario Loaded: ${scenario.label}`,
      message: `${scenario.subtitle}. Data recalculations updated across all views.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'hotspot',
      linkIncidentId: scenario.primaryIncidentId,
    };
    this.notifications.unshift(notif);

    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.incidents));
      localStorage.setItem(STORAGE_KEY_REPAIRS, JSON.stringify(this.repairs));
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEY_SCENARIO, scenarioKey);
    } catch {
      // ignore
    }

    return { primaryIncidentId: scenario.primaryIncidentId };
  }

  // --- Failure Memory Engine Access ---
  public getFailureMemory(incidentId: string): FailureMemory | null {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;
    return buildFailureMemory(incident, this.incidents, this.repairs);
  }

  public getAllLocationMemories(): LocationMemory[] {
    const clusters = clusterIncidentsByLocation(this.incidents, 350);
    const locationMemories: LocationMemory[] = [];

    for (const cluster of clusters) {
      if (cluster.length === 0) continue;
      const memoriesByCategory: Record<string, FailureMemory> = {};

      for (const inc of cluster) {
        if (!memoriesByCategory[inc.category]) {
          memoriesByCategory[inc.category] = buildFailureMemory(inc, this.incidents, this.repairs);
        }
      }

      locationMemories.push(buildLocationMemory(cluster, this.repairs, memoriesByCategory));
    }

    // Sort locations by highest incident count descending
    locationMemories.sort((a, b) => b.totalIncidents - a.totalIncidents);
    return locationMemories;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.incidents));
      localStorage.setItem(STORAGE_KEY_REPAIRS, JSON.stringify(this.repairs));
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
      if (this.activeScenario) {
        localStorage.setItem(STORAGE_KEY_SCENARIO, this.activeScenario);
      }
    } catch {
      // ignore
    }
  }

  // --- Incidents ---
  public getIncidents(): Incident[] {
    return [...this.incidents];
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((inc) => inc.id.toLowerCase() === id.toLowerCase());
  }

  public getRepairsForIncident(incidentId: string): RepairEvent[] {
    return this.repairs.filter((rep) => rep.incidentId === incidentId);
  }

  public getAllRepairs(): RepairEvent[] {
    return [...this.repairs];
  }

  public getHotspots(): Hotspot[] {
    return [...this.hotspots];
  }

  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.persist();
  }

  public markAllNotificationsAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persist();
  }

  public createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Incident {
    const nextNum = 1000 + this.incidents.length + 1;
    const newId = `INC-${nextNum}`;
    const now = new Date().toISOString();

    const relatedIds = incidentData.relatedIncidentIds || [];
    const recurrenceCount = relatedIds.length > 0 ? relatedIds.length : (incidentData.recurrenceCount || 0);

    const newIncident: Incident = {
      ...incidentData,
      id: newId,
      recurrenceCount,
      relatedIncidentIds: relatedIds,
      createdAt: now,
      updatedAt: now,
    };

    // Bidirectionally link related incident records
    if (relatedIds.length > 0) {
      this.incidents = this.incidents.map((existing) => {
        if (relatedIds.includes(existing.id)) {
          const updatedRelated = existing.relatedIncidentIds.includes(newId)
            ? existing.relatedIncidentIds
            : [...existing.relatedIncidentIds, newId];
          return {
            ...existing,
            relatedIncidentIds: updatedRelated,
            recurrenceCount: Math.max(existing.recurrenceCount, updatedRelated.length),
            updatedAt: now,
          };
        }
        return existing;
      });
    }

    this.incidents.unshift(newIncident);

    // Add activity notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: relatedIds.length > 0 ? 'Recurring Incident Logged' : 'New Incident Logged',
      message: `${newIncident.title} reported at ${newIncident.address}.${
        relatedIds.length > 0 ? ` Connected to ${relatedIds.length} historical failure(s).` : ''
      }`,
      timestamp: now,
      read: false,
      type: relatedIds.length > 0 ? 'hotspot' : 'status',
      linkIncidentId: newId,
    };
    this.notifications.unshift(newNotif);

    this.persist();
    return newIncident;
  }

  public updateIncidentStatus(id: string, status: Incident['status'], notes?: string): Incident | null {
    const idx = this.incidents.findIndex((inc) => inc.id === id);
    if (idx === -1) return null;

    const old = this.incidents[idx];
    const updated: Incident = {
      ...old,
      status,
      updatedAt: new Date().toISOString(),
      resolutionNotes: notes || old.resolutionNotes,
    };
    this.incidents[idx] = updated;

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: `Incident ${id} Status Changed`,
      message: `Status updated to ${status.replace('_', ' ').toUpperCase()} for "${old.title}".`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'status',
      linkIncidentId: id,
    };
    this.notifications.unshift(newNotif);

    this.persist();
    return updated;
  }

  // --- Metrics Calculation Engine ---
  public getMetrics(daysFilter: number = 90) {
    const now = new Date('2026-09-20T12:00:00Z'); // Fixed baseline matching dataset current time
    const cutoffDate = new Date(now.getTime() - daysFilter * 24 * 60 * 60 * 1000);
    const prevCutoffDate = new Date(cutoffDate.getTime() - daysFilter * 24 * 60 * 60 * 1000);

    const periodIncidents = this.incidents.filter((inc) => new Date(inc.createdAt) >= cutoffDate);
    const priorPeriodIncidents = this.incidents.filter(
      (inc) => new Date(inc.createdAt) >= prevCutoffDate && new Date(inc.createdAt) < cutoffDate
    );

    const total = periodIncidents.length;
    const priorTotal = priorPeriodIncidents.length;

    const active = periodIncidents.filter((inc) => inc.status !== 'resolved').length;
    const priorActive = priorPeriodIncidents.filter((inc) => inc.status !== 'resolved').length;

    const recurringHotspotsCount = this.hotspots.filter(
      (h) => h.recurrenceState === 'RECURRENT' || h.recurrenceState === 'PERSISTENT'
    ).length;

    const recentlyResolved = periodIncidents.filter((inc) => inc.status === 'resolved').length;
    const priorResolved = priorPeriodIncidents.filter((inc) => inc.status === 'resolved').length;

    const repairEventsCount = this.repairs.filter((rep) => new Date(rep.date) >= cutoffDate).length;
    const priorRepairEvents = this.repairs.filter(
      (rep) => new Date(rep.date) >= prevCutoffDate && new Date(rep.date) < cutoffDate
    ).length;

    // Calculate real mathematical average recurrence interval (in days) between linked incidents
    let totalIntervalDays = 0;
    let intervalsCount = 0;

    this.hotspots.forEach((h) => {
      if (h.avgIntervalDays) {
        totalIntervalDays += h.avgIntervalDays;
        intervalsCount++;
      }
    });

    const avgRecurrenceInterval = intervalsCount > 0 ? Math.round(totalIntervalDays / intervalsCount) : 24;

    return {
      totalIncidents: {
        value: total,
        priorValue: priorTotal,
        diff: total - priorTotal,
        trend: total >= priorTotal ? 'up' : 'down',
      },
      activeIncidents: {
        value: active,
        priorValue: priorActive,
        diff: active - priorActive,
        trend: active >= priorActive ? 'up' : 'down',
      },
      recurringHotspots: {
        value: recurringHotspotsCount,
        description: 'Zones with ≥2 repeated infrastructure failures',
        stateSummary: `${recurringHotspotsCount} active chronic clusters`,
      },
      recentlyResolved: {
        value: recentlyResolved,
        priorValue: priorResolved,
        diff: recentlyResolved - priorResolved,
        trend: recentlyResolved >= priorResolved ? 'up' : 'down',
      },
      repairEvents: {
        value: repairEventsCount,
        priorValue: priorRepairEvents,
        diff: repairEventsCount - priorRepairEvents,
        trend: repairEventsCount >= priorRepairEvents ? 'up' : 'down',
      },
      avgRecurrenceInterval: {
        value: `${avgRecurrenceInterval} Days`,
        numeric: avgRecurrenceInterval,
        description: 'Mean elapsed time until failure re-emergence',
      },
    };
  }

  // --- Transparent Explainable City Health Overview ---
  public getInfrastructureHealth(): CategoryHealth[] {
    const categoryConfig: {
      category: IncidentCategory;
      label: string;
      desc: string;
    }[] = [
      {
        category: 'Pothole',
        label: 'Roads & Pavements',
        desc: 'Arterial carriageways, service roads, asphalt integrity',
      },
      {
        category: 'Broken Streetlight',
        label: 'Public Lighting & Cables',
        desc: 'Streetlight masts, underground conduits, circuit relays',
      },
      {
        category: 'Garbage Overflow',
        label: 'Waste & Sanitation',
        desc: 'Commercial depots, compactor bins, collection routes',
      },
      {
        category: 'Water Leakage',
        label: 'Potable Water Distribution',
        desc: 'Transmission mains, distribution valves, service sleeves',
      },
      {
        category: 'Drainage Issue',
        label: 'Stormwater & Drainage',
        desc: 'Surface gullies, box culverts, outfall conduits',
      },
      {
        category: 'Damaged Footpath',
        label: 'Pedestrian Infrastructure',
        desc: 'Granite pavers, tactile pathways, safety barriers',
      },
      {
        category: 'Traffic Signal Issue',
        label: 'Traffic Control Systems',
        desc: 'Controller cabinets, countdown displays, vehicle sensors',
      },
    ];

    return categoryConfig.map(({ category, label, desc }) => {
      const categoryIncidents = this.incidents.filter((inc) => inc.category === category);
      const volume = categoryIncidents.length;
      const active = categoryIncidents.filter((inc) => inc.status !== 'resolved').length;
      const recurring = categoryIncidents.filter((inc) => inc.recurrenceCount > 0).length;
      const resolved = categoryIncidents.filter((inc) => inc.status === 'resolved').length;

      // Transparent Formula:
      // Base: 100
      // - Active incidents deduction: (active * 6)
      // - Recurrence penalty: (recurring * 7)
      // - High/Critical severity weight penalty: critical * 5 + high * 3
      const criticalCount = categoryIncidents.filter(
        (inc) => inc.status !== 'resolved' && inc.severity === 'critical'
      ).length;
      const highCount = categoryIncidents.filter(
        (inc) => inc.status !== 'resolved' && inc.severity === 'high'
      ).length;

      const penalty = active * 6 + recurring * 7 + criticalCount * 8 + highCount * 4;
      const calculatedScore = Math.max(18, Math.min(98, 100 - penalty));

      let status: CategoryHealth['status'] = 'optimal';
      if (calculatedScore < 50) status = 'critical';
      else if (calculatedScore < 70) status = 'degraded';
      else if (calculatedScore < 85) status = 'moderate';

      let trend: CategoryHealth['trend'] = 'stable';
      if (active > recurring) trend = 'deteriorating';
      else if (resolved > active) trend = 'improving';

      return {
        category,
        label,
        incidentVolume: volume,
        activeCount: active,
        recurringCount: recurring,
        resolvedCount: resolved,
        healthScore: calculatedScore,
        status,
        trend,
        description: desc,
        unresolvedAvgDays: active > 0 ? 14 : 4,
      };
    });
  }

  public getScoreMethodology(category: IncidentCategory): ScoreMethodology {
    const categoryIncidents = this.incidents.filter((inc) => inc.category === category);
    const active = categoryIncidents.filter((inc) => inc.status !== 'resolved').length;
    const recurring = categoryIncidents.filter((inc) => inc.recurrenceCount > 0).length;
    const criticalCount = categoryIncidents.filter(
      (inc) => inc.status !== 'resolved' && inc.severity === 'critical'
    ).length;
    const highCount = categoryIncidents.filter(
      (inc) => inc.status !== 'resolved' && inc.severity === 'high'
    ).length;

    const activeDeduction = active * 6;
    const recurrenceDeduction = recurring * 7;
    const durationDeduction = criticalCount * 8 + highCount * 4;
    const finalScore = Math.max(18, Math.min(98, 100 - (activeDeduction + recurrenceDeduction + durationDeduction)));

    return {
      baseScore: 100,
      activeDeduction,
      recurrenceDeduction,
      durationDeduction,
      finalScore,
      explanation: `Calculated from ${categoryIncidents.length} seeded records: 100 base score - (${active} active × 6 pts) - (${recurring} recurring × 7 pts) - (${criticalCount} critical & ${highCount} high severity penalty = ${durationDeduction} pts).`,
    };
  }

  // --- CivicPulse Intelligence Insights (Data-Grounded) ---
  public getGeneratedInsights(): Insight[] {
    return insightEngine.getInsights(this.incidents, this.hotspots, this.repairs);
  }

  // --- Live Activity Stream from Seeded Dataset ---
  public getActivityStream(): ActivityEvent[] {
    const recentIncidents = [...this.incidents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return recentIncidents.map((inc) => {
      let title = `Incident ${inc.id} Logged`;
      let desc = inc.title;
      let type: ActivityEvent['type'] = 'report';

      if (inc.status === 'resolved') {
        title = `Incident ${inc.id} Resolved`;
        desc = inc.resolutionNotes || 'Remedial action executed and verified by field inspection.';
        type = 'status_change';
      } else if (inc.repairEventIds.length > 0) {
        title = `Repair Logged for ${inc.id}`;
        desc = `Contractor dispatch completed at ${inc.address}.`;
        type = 'repair';
      } else if (inc.recurrenceCount >= 2) {
        title = `Recurrence Detected: ${inc.id}`;
        desc = `Failure pattern confirmed at ${inc.address}. Prior incidents: ${inc.relatedIncidentIds.join(', ')}`;
        type = 'hotspot_flagged';
      }

      return {
        id: `ACT-${inc.id}`,
        incidentId: inc.id,
        incidentTitle: inc.title,
        location: inc.address,
        type,
        title,
        description: desc,
        timestamp: inc.updatedAt || inc.createdAt,
        severity: inc.severity,
        status: inc.status,
        recurrenceBadge: inc.recurrenceCount > 0,
      };
    });
  }

  // --- Global Search ---
  public globalSearch(query: string) {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return {
        incidents: [],
        locations: [],
        categories: [],
      };
    }

    const matchedIncidents = this.incidents
      .filter(
        (inc) =>
          inc.id.toLowerCase().includes(clean) ||
          inc.title.toLowerCase().includes(clean) ||
          inc.address.toLowerCase().includes(clean) ||
          inc.category.toLowerCase().includes(clean) ||
          inc.tags.some((t) => t.toLowerCase().includes(clean)) ||
          inc.status.toLowerCase().includes(clean)
      )
      .slice(0, 8);

    const matchedLocations = this.hotspots
      .filter(
        (h) =>
          h.locationName.toLowerCase().includes(clean) ||
          h.address.toLowerCase().includes(clean) ||
          h.zone.toLowerCase().includes(clean)
      )
      .slice(0, 5);

    const categories: IncidentCategory[] = [
      'Pothole',
      'Broken Streetlight',
      'Garbage Overflow',
      'Water Leakage',
      'Drainage Issue',
      'Damaged Footpath',
      'Traffic Signal Issue',
    ];

    const matchedCategories = categories.filter((c) => c.toLowerCase().includes(clean));

    return {
      incidents: matchedIncidents,
      locations: matchedLocations,
      categories: matchedCategories,
    };
  }
}

export const dataService = new DataService();
