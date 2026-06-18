import type { Lang } from '@/components/providers/LanguageProvider'

/**
 * Shell + shared dashboard copy, both languages.
 * Rules: no em/en dashes anywhere; plain, beginner-friendly wording (assume the
 * reader has never used a GEO tool); Indonesian uses the formal "Anda" register.
 */

export interface DashboardCopy {
  nav: {
    gettingStarted: string
    dismissGettingStarted: string
    brandInsights: string
    overview: string
    prompts: string
    citations: string
    agentsInsights: string
    aiVisibility: string
    research: string
    tools: string
    recommendations: string
    suggested: string
    todo: string
    admin: string
    allProjects: string
    billing: string
    usage: string
    boost: string
    manageUsers: string
  }
  footer: {
    accountSettings: string
    logout: string
    tier: (plan: string) => string
  }
  switcher: {
    selectProject: string
    newProject: string
  }
  sidebar: {
    collapse: string
    expand: string
  }
}

export const DASHBOARD_COPY: Record<Lang, DashboardCopy> = {
  id: {
    nav: {
      gettingStarted: 'Panduan Awal',
      dismissGettingStarted: 'Sembunyikan panduan awal',
      brandInsights: 'Insight Brand',
      overview: 'Ringkasan',
      prompts: 'Prompts',
      citations: 'Jawaban AI',
      agentsInsights: 'Analitik AI',
      aiVisibility: 'Visibilitas AI',
      research: 'Riset Pertanyaan',
      tools: 'Tools Audit GEO',
      recommendations: 'Rekomendasi',
      suggested: 'Artikel AI',
      todo: 'Daftar Tugas',
      admin: 'Admin',
      allProjects: 'Semua Project',
      billing: 'Tagihan',
      usage: 'Pemakaian',
      boost: 'Naikkan Ranking AI',
      manageUsers: 'Kelola User',
    },
    footer: {
      accountSettings: 'Pengaturan Akun',
      logout: 'Keluar',
      tier: (plan: string): string => `Paket ${plan}`,
    },
    switcher: {
      selectProject: 'Pilih project',
      newProject: 'Project baru',
    },
    sidebar: {
      collapse: 'Kecilkan sidebar',
      expand: 'Besarkan sidebar',
    },
  },
  en: {
    nav: {
      gettingStarted: 'Getting Started',
      dismissGettingStarted: 'Dismiss getting started',
      brandInsights: 'Brand Insights',
      overview: 'Overview',
      prompts: 'Prompts',
      citations: 'Citations',
      agentsInsights: 'Agents Insights',
      aiVisibility: 'AI Visibility',
      research: 'AI Prompt Research',
      tools: 'GEO Audit Tools',
      recommendations: 'Recommendations',
      suggested: 'AI Articles',
      todo: 'To-Do',
      admin: 'Admin',
      allProjects: 'All Projects',
      billing: 'Billing',
      usage: 'Monitor Usage',
      boost: 'Boost your AI Ranking',
      manageUsers: 'Manage Users',
    },
    footer: {
      accountSettings: 'Account Settings',
      logout: 'Log out',
      tier: (plan: string): string => `${plan} Tier`,
    },
    switcher: {
      selectProject: 'Select a project',
      newProject: 'New project',
    },
    sidebar: {
      collapse: 'Collapse sidebar',
      expand: 'Expand sidebar',
    },
  },
}
