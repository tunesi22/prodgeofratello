export type { Section, Post } from '../types'
import type { Post } from '../types'

import { post as aiOverviewZeroClick68PersenPencarianGoogle2026 } from './ai-overview-zero-click-68-persen-pencarian-google-2026'
import { post as citelensStudiSeoTakMenentukanSitasiChatgpt } from './citelens-studi-seo-tak-menentukan-sitasi-chatgpt'
import { post as riset77PersenPenggunaAiSearchIndonesiaPakaiChatgpt } from './riset-77-persen-pengguna-ai-search-indonesia-pakai-chatgpt'
import { post as googleAiOverviewRolloutAsiaTenggaraDampakBrandIndonesia } from './google-ai-overview-rollout-asia-tenggara-dampak-brand-indonesia'
import { post as chatgptInstantCheckoutAgenticCommerceProtocol2026 } from './chatgpt-instant-checkout-agentic-commerce-protocol-2026'
import { post as shopeeTokopediaAiRekomendasiProdukUmkm2026 } from './shopee-tokopedia-ai-rekomendasi-produk-umkm-2026'
import { post as gemini3UpdateJuli2026DampakBrand } from './gemini-3-update-juli-2026-dampak-brand'
import { post as llmsTxtStandarBaruAiCrawler } from './llms-txt-standar-baru-ai-crawler'
import { post as aiCrawlerGptbotClaudebotPerplexitybotPanduan } from './ai-crawler-gptbot-claudebot-perplexitybot-panduan'
import { post as schemaMarkupUntukGeo } from './schema-markup-untuk-geo'
import { post as geoIndustriKesehatanKlinikApotek } from './geo-industri-kesehatan-klinik-apotek'
import { post as studiKasusBrandOtomotifGeoScoreNaik } from './studi-kasus-brand-otomotif-geo-score-naik'
import { post as brandLokalIndonesiaViralChatgptJuni2026 } from './brand-lokal-indonesia-viral-chatgpt-juni-2026'
import { post as chatgptSearchKalahkanGoogle5Kategori } from './chatgpt-search-kalahkan-google-5-kategori'
import { post as geoVsSeoManaLebihPenting2026 } from './geo-vs-seo-mana-lebih-penting-2026'
import { post as googleAiOverviewUpdateJuni2026 } from './google-ai-overview-update-juni-2026'
import { post as perplexityAi100JutaPengguna } from './perplexity-ai-100-juta-pengguna'
import { post as perplexityPagesFiturBaruBrand } from './perplexity-pages-fitur-baru-brand'
import { post as roadmapGeoBrandIndonesia2026 } from './roadmap-geo-brand-indonesia-2026'
import { post as geoBrandFashionLokalIndonesia } from './geo-brand-fashion-lokal-indonesia'
import { post as strategiGeoIndustriFnb2026 } from './strategi-geo-industri-fnb-2026'
import { post as _5KesalahanGeoBrandIndonesia } from './5-kesalahan-geo-brand-indonesia'
import { post as panduanKontenDisukaiMesinAi } from './panduan-konten-disukai-mesin-ai'
import { post as geoUmkmIndonesiaPanduan2026 } from './geo-umkm-indonesia-panduan-2026'
import { post as mengapaGenZPercayaRekomendasiAi } from './mengapa-gen-z-percaya-rekomendasi-ai'
import { post as claudeVsChatgptUntukBrandIndonesia } from './claude-vs-chatgpt-untuk-brand-indonesia'
import { post as geoScoreCaraMengukurVisibilitasAi } from './geo-score-cara-mengukur-visibilitas-ai'
import { post as trenGeoAsiaTenggaraIndonesiaMemimpin } from './tren-geo-asia-tenggara-indonesia-memimpin'
import { post as ulasanGoogleMapsPengaruhiRekomendasiAi } from './ulasan-google-maps-pengaruhi-rekomendasi-ai'
import { post as studiKasusBrandKulinerNaik3xMentionAi } from './studi-kasus-brand-kuliner-naik-3x-mention-ai'
import { post as apaItuGeo } from './apa-itu-geo'
import { post as mengapaBrandHarusPeduliAi } from './mengapa-brand-harus-peduli-ai'
import { post as caraKerjaAuditGeo } from './cara-kerja-audit-geo'

// Sorted newest first.
export const posts: Post[] = [
  aiOverviewZeroClick68PersenPencarianGoogle2026,
  citelensStudiSeoTakMenentukanSitasiChatgpt,
  riset77PersenPenggunaAiSearchIndonesiaPakaiChatgpt,
  googleAiOverviewRolloutAsiaTenggaraDampakBrandIndonesia,
  chatgptInstantCheckoutAgenticCommerceProtocol2026,
  shopeeTokopediaAiRekomendasiProdukUmkm2026,
  gemini3UpdateJuli2026DampakBrand,
  llmsTxtStandarBaruAiCrawler,
  aiCrawlerGptbotClaudebotPerplexitybotPanduan,
  schemaMarkupUntukGeo,
  geoIndustriKesehatanKlinikApotek,
  studiKasusBrandOtomotifGeoScoreNaik,
  brandLokalIndonesiaViralChatgptJuni2026,
  chatgptSearchKalahkanGoogle5Kategori,
  geoVsSeoManaLebihPenting2026,
  googleAiOverviewUpdateJuni2026,
  perplexityAi100JutaPengguna,
  perplexityPagesFiturBaruBrand,
  roadmapGeoBrandIndonesia2026,
  geoBrandFashionLokalIndonesia,
  strategiGeoIndustriFnb2026,
  _5KesalahanGeoBrandIndonesia,
  panduanKontenDisukaiMesinAi,
  geoUmkmIndonesiaPanduan2026,
  mengapaGenZPercayaRekomendasiAi,
  claudeVsChatgptUntukBrandIndonesia,
  geoScoreCaraMengukurVisibilitasAi,
  trenGeoAsiaTenggaraIndonesiaMemimpin,
  ulasanGoogleMapsPengaruhiRekomendasiAi,
  studiKasusBrandKulinerNaik3xMentionAi,
  apaItuGeo,
  mengapaBrandHarusPeduliAi,
  caraKerjaAuditGeo,
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}
