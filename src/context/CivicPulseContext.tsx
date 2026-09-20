import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Incident,
  IncidentCategory,
  RepairEvent,
  Hotspot,
  CategoryHealth,
  Insight,
  InsightStatus,
  ActivityEvent,
  NotificationItem,
  NavigationPage,
  DateRangeFilter,
  UserProfile,
} from '../types';
import { dataService } from '../services/dataService';
import { FailureMemory, LocationMemory, ScenarioKey } from '../services/failure-memory';
import { insightEngine } from '../services/intelligence/insightEngine';

interface CivicPulseContextType {
  // Navigation & Page State
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Modals & Drawers
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  selectedIncident: Incident | null;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isMethodologyModalOpen: boolean;
  setIsMethodologyModalOpen: (open: boolean) => void;
  methodologyCategory: IncidentCategory;
  openMethodology: (category: IncidentCategory) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Filters
  selectedDateRange: DateRangeFilter;
  setSelectedDateRange: (range: DateRangeFilter) => void;
  filterCategory: string | null;
  setFilterCategory: (cat: string | null) => void;
  daysFilter: number;

  // Core Data
  incidents: Incident[];
  repairs: RepairEvent[];
  hotspots: Hotspot[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;

  // Failure Memory Intelligence
  activeScenario: ScenarioKey | null;
  loadScenario: (key: ScenarioKey) => void;
  getFailureMemory: (incidentId: string) => FailureMemory | null;
  locationMemories: LocationMemory[];

  // Derived Intelligence
  metrics: ReturnType<typeof dataService.getMetrics>;
  categoryHealth: CategoryHealth[];
  insights: Insight[];
  activityStream: ActivityEvent[];

  // User Profile
  user: UserProfile;
  theme: 'light' | 'dark' | 'contrast';
  setTheme: (theme: 'light' | 'dark' | 'contrast') => void;

  // Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reportIncident: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Incident;
  updateIncidentStatus: (id: string, status: Incident['status'], notes?: string) => void;
  updateInsightLifecycleStatus: (id: string, status: InsightStatus, notes?: string) => void;
  resetDemoData: () => void;
  refreshData: () => void;
  isRefreshing: boolean;
}

const defaultUser: UserProfile = {
  id: 'USR-882',
  name: 'Dr. Anita Sengupta',
  role: 'Municipal Infrastructure Director',
  department: 'Urban Resilience & Infrastructure Intelligence',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  email: 'anita.sengupta@mayura.gov.in',
  notificationsEnabled: true,
  highContrast: false,
};

const CivicPulseContext = createContext<CivicPulseContextType | undefined>(undefined);

export const CivicPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState<boolean>(false);
  const [methodologyCategory, setMethodologyCategory] = useState<IncidentCategory>('Pothole');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter>('90d');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>(() => dataService.getIncidents());
  const [repairs, setRepairs] = useState<RepairEvent[]>(() => dataService.getAllRepairs());
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => dataService.getHotspots());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => dataService.getNotifications());

  const [activeScenario, setActiveScenario] = useState<ScenarioKey | null>(() => dataService.getActiveScenario());
  const [insightVersion, setInsightVersion] = useState<number>(0);

  const [user] = useState<UserProfile>(defaultUser);
  const [theme, setTheme] = useState<'light' | 'dark' | 'contrast'>('light');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const daysFilter = useMemo(() => {
    switch (selectedDateRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'custom':
        return 60;
      default:
        return 90;
    }
  }, [selectedDateRange]);

  const syncStateFromService = useCallback(() => {
    setIncidents(dataService.getIncidents());
    setRepairs(dataService.getAllRepairs());
    setHotspots(dataService.getHotspots());
    setNotifications(dataService.getNotifications());
    setActiveScenario(dataService.getActiveScenario());
  }, []);

  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      syncStateFromService();
      setIsRefreshing(false);
    }, 450);
  }, [syncStateFromService]);

  const resetDemoData = useCallback(() => {
    dataService.resetDemoData();
    syncStateFromService();
    setSelectedIncidentId(null);
  }, [syncStateFromService]);

  const loadScenario = useCallback(
    (key: ScenarioKey) => {
      const result = dataService.loadMemoryScenario(key);
      syncStateFromService();
      setSelectedIncidentId(result.primaryIncidentId);
    },
    [syncStateFromService]
  );

  const getFailureMemory = useCallback(
    (incidentId: string) => {
      return dataService.getFailureMemory(incidentId);
    },
    // re-evaluate when incidents or repairs change
    [incidents, repairs]
  );

  const locationMemories = useMemo(() => {
    return dataService.getAllLocationMemories();
  }, [incidents, repairs]);

  const markNotificationRead = useCallback((id: string) => {
    dataService.markNotificationAsRead(id);
    setNotifications(dataService.getNotifications());
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dataService.markAllNotificationsAsRead();
    setNotifications(dataService.getNotifications());
  }, []);

  const reportIncident = useCallback(
    (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = dataService.createIncident(data);
      syncStateFromService();
      return created;
    },
    [syncStateFromService]
  );

  const updateIncidentStatus = useCallback(
    (id: string, status: Incident['status'], notes?: string) => {
      dataService.updateIncidentStatus(id, status, notes);
      syncStateFromService();
    },
    [syncStateFromService]
  );

  const updateInsightLifecycleStatus = useCallback(
    (id: string, status: InsightStatus, notes?: string) => {
      insightEngine.updateStatus(id, status, notes);
      setInsightVersion((v) => v + 1);
    },
    []
  );

  const openMethodology = useCallback((category: IncidentCategory) => {
    setMethodologyCategory(category);
    setIsMethodologyModalOpen(true);
  }, []);

  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find((i) => i.id === selectedIncidentId) || null;
  }, [selectedIncidentId, incidents]);

  const metrics = useMemo(() => {
    return dataService.getMetrics(daysFilter);
  }, [incidents, repairs, hotspots, daysFilter]);

  const categoryHealth = useMemo(() => {
    return dataService.getInfrastructureHealth();
  }, [incidents]);

  const insights = useMemo(() => {
    return dataService.getGeneratedInsights();
  }, [incidents, repairs, hotspots, insightVersion]);

  const activityStream = useMemo(() => {
    return dataService.getActivityStream();
  }, [incidents]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Global keyboard shortcut for Command Palette: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsGlobalSearchOpen(false);
        setIsMethodologyModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      selectedIncidentId,
      setSelectedIncidentId,
      selectedIncident,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isReportModalOpen,
      setIsReportModalOpen,
      isMethodologyModalOpen,
      setIsMethodologyModalOpen,
      methodologyCategory,
      openMethodology,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      selectedDateRange,
      setSelectedDateRange,
      filterCategory,
      setFilterCategory,
      daysFilter,
      incidents,
      repairs,
      hotspots,
      notifications,
      unreadNotifsCount,
      activeScenario,
      loadScenario,
      getFailureMemory,
      locationMemories,
      metrics,
      categoryHealth,
      insights,
      activityStream,
      user,
      theme,
      setTheme,
      markNotificationRead,
      markAllNotificationsRead,
      reportIncident,
      updateIncidentStatus,
      updateInsightLifecycleStatus,
      resetDemoData,
      refreshData,
      isRefreshing,
    }),
    [
      currentPage,
      isSidebarCollapsed,
      selectedIncidentId,
      selectedIncident,
      isCommandPaletteOpen,
      isReportModalOpen,
      isMethodologyModalOpen,
      methodologyCategory,
      openMethodology,
      isGlobalSearchOpen,
      selectedDateRange,
      filterCategory,
      daysFilter,
      incidents,
      repairs,
      hotspots,
      notifications,
      unreadNotifsCount,
      activeScenario,
      loadScenario,
      getFailureMemory,
      locationMemories,
      metrics,
      categoryHealth,
      insights,
      activityStream,
      user,
      theme,
      markNotificationRead,
      markAllNotificationsRead,
      reportIncident,
      updateIncidentStatus,
      updateInsightLifecycleStatus,
      resetDemoData,
      refreshData,
      isRefreshing,
    ]
  );

  return <CivicPulseContext.Provider value={value}>{children}</CivicPulseContext.Provider>;
};

export const useCivicPulse = () => {
  const context = useContext(CivicPulseContext);
  if (!context) {
    throw new Error('useCivicPulse must be used within a CivicPulseProvider');
  }
  return context;
};
