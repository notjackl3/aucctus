import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AnalysisResult } from '../types/analysis';

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  brand: '#c4362a',
  brandDark: '#8b2720',
  go: '#16a34a',
  nogo: '#dc2626',
  maybe: '#d97706',
  white: '#ffffff',
  surface: '#f8f7f6',
  border: '#e8e0dd',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b5a5a',
  textMuted: '#a09090',
  bgLight: '#fef9f8',
  goLight: '#f0fdf4',
  nogoLight: '#fef2f2',
  maybeLight: '#fffbeb',
};

// ── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
    paddingBottom: 48,
  },

  // Cover
  cover: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  coverHeader: {
    backgroundColor: C.brand,
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 48,
  },
  coverLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coverCompany: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 6,
  },
  coverMarket: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  coverBody: {
    padding: 48,
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
    marginBottom: 32,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  scoreBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  scoreLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  recBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  recText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  coverHeadline: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: C.textPrimary,
    lineHeight: 1.45,
    marginBottom: 4,
    flexShrink: 1,
    maxWidth: 380,
  },
  coverDate: {
    fontSize: 9,
    color: C.textMuted,
  },
  coverMeta: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  // Page header stripe
  pageHeaderBar: {
    backgroundColor: C.brand,
    height: 4,
  },
  pageHeader: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageHeaderLeft: {
    fontSize: 8,
    color: C.textMuted,
  },
  pageHeaderRight: {
    fontSize: 8,
    color: C.textMuted,
  },

  // Body
  body: {
    paddingHorizontal: 48,
    paddingTop: 28,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.brand,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: C.textMuted,
    marginLeft: 'auto',
  },

  // Summary text
  summaryText: {
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.65,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 9,
    color: C.textPrimary,
    lineHeight: 1.6,
  },
  mutedText: {
    fontSize: 8,
    color: C.textMuted,
  },

  // Cards
  card: {
    backgroundColor: C.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.textPrimary,
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 8,
    color: C.textSecondary,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  cardCol: {
    flex: 1,
  },
  tagLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  tagText: {
    fontSize: 8,
    color: C.textSecondary,
    lineHeight: 1.5,
  },

  // Bullet lists
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletDot: {
    fontSize: 9,
    color: C.brand,
    width: 12,
    marginTop: 0.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.55,
  },

  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  twoColLeft: {
    flex: 1,
  },
  twoColRight: {
    flex: 1,
  },

  // Stat chips
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statChip: {
    backgroundColor: C.bgLight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  statChipLabel: {
    fontSize: 7,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statChipValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.textPrimary,
  },

  // Belief / challenge rows
  beliefRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  beliefBullet: {
    fontSize: 9,
    width: 14,
    marginTop: 0.5,
  },
  beliefText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.55,
  },

  // Risk list
  riskItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 2,
  },
  riskNumber: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.nogo,
    width: 16,
    marginTop: 0.5,
  },
  riskText: {
    flex: 1,
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.55,
  },

  // Source list
  sourceItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ebe9',
  },
  sourceIndex: {
    fontSize: 8,
    color: C.textMuted,
    width: 20,
    marginTop: 1,
  },
  sourceTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.textPrimary,
    marginBottom: 2,
  },
  sourcePublisher: {
    fontSize: 7,
    color: C.textMuted,
  },

  // Conditions / Highlight box
  highlightBox: {
    backgroundColor: C.bgLight,
    borderLeftWidth: 3,
    borderLeftColor: C.brand,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 3,
  },
  highlightLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.brand,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  highlightText: {
    fontSize: 9,
    color: C.textPrimary,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: C.textMuted,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function recColor(rec?: string) {
  if (rec === 'go') return { bg: C.goLight, text: C.go };
  if (rec === 'no-go') return { bg: C.nogoLight, text: C.nogo };
  return { bg: C.maybeLight, text: C.maybe };
}

function recLabel(rec?: string) {
  if (rec === 'go') return 'Go';
  if (rec === 'no-go') return 'No-Go';
  return 'Proceed with Caution';
}

function scoreColor(score?: number) {
  if (!score) return C.brand;
  if (score >= 70) return C.go;
  if (score >= 40) return C.maybe;
  return C.nogo;
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function BulletList({ items, color }: { items: string[]; color?: string }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={S.bulletItem}>
          <Text style={[S.bulletDot, { color: color || C.brand }]}>•</Text>
          <Text style={S.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={S.sectionHeader}>
      <View style={S.sectionDot} />
      <Text style={S.sectionTitle}>{title}</Text>
      {sub && <Text style={S.sectionSubtitle}>{sub}</Text>}
    </View>
  );
}

function Footer({ company, market, page }: { company: string; market: string; page: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>{company} — {market}</Text>
      <Text style={S.footerText}>{page}</Text>
      <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

// ── Cover page ──────────────────────────────────────────────────────────────
function CoverPage({ data }: { data: AnalysisResult }) {
  const a = data.opportunityAssessment;
  const sc = scoreColor(a?.score);
  const rc = recColor(a?.recommendation);

  return (
    <Page size="A4" style={S.page}>
      <View style={S.cover}>
        {/* Red header */}
        <View style={S.coverHeader}>
          <Text style={S.coverLabel}>Competitive Landscape Assessment</Text>
          <Text style={S.coverCompany}>{data.request.companyName}</Text>
          <Text style={S.coverMarket}>{data.request.marketSpace}</Text>
        </View>

        {/* Score + headline */}
        <View style={S.coverBody}>
          <View style={S.scoreRow}>
            {/* Score circle */}
            <View style={[S.scoreBox, { backgroundColor: sc }]}>
              <Text style={S.scoreNumber}>{a?.score ?? '—'}</Text>
              <Text style={S.scoreLabel}>/ 100</Text>
            </View>

            {/* Meta */}
            <View style={S.coverMeta}>
              {a?.recommendation && (
                <View style={[S.recBadge, { backgroundColor: rc.bg }]}>
                  <Text style={[S.recText, { color: rc.text }]}>{recLabel(a.recommendation)}</Text>
                </View>
              )}
              <Text style={S.coverHeadline}>{a?.headline || 'Assessment complete'}</Text>
              <Text style={S.coverDate}>
                {fmtDate(data.completedAt) || fmtDate(data.createdAt)}
              </Text>
            </View>
          </View>

          {/* Strategic reasoning preview */}
          {a?.reasoning && (
            <View>
              <Text style={[S.mutedText, { marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Helvetica-Bold' }]}>
                Strategic Reasoning
              </Text>
              <Text style={[S.bodyText, { color: C.textSecondary }]}>{a.reasoning}</Text>
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}

// ── Strategic Assessment page ────────────────────────────────────────────────
function AssessmentPage({ data }: { data: AnalysisResult }) {
  const a = data.opportunityAssessment;
  if (!a) return null;

  return (
    <Page size="A4" style={S.page}>
      <View style={S.pageHeaderBar} />
      <View style={S.pageHeader}>
        <Text style={S.pageHeaderLeft}>Strategic Assessment</Text>
        <Text style={S.pageHeaderRight}>{data.request.companyName} — {data.request.marketSpace}</Text>
      </View>

      <View style={S.body}>
        {/* Strategic fit */}
        {a.strategicFitSummary && (
          <View style={S.section}>
            <SectionHeader title="Strategic Fit" />
            <Text style={S.summaryText}>{a.strategicFitSummary}</Text>
          </View>
        )}

        {/* Reasons to believe / challenge */}
        <View style={[S.section, { marginBottom: 16 }]}>
          <SectionHeader title="Evidence Balance" />
          <View style={S.twoCol}>
            {/* Reasons to believe */}
            <View style={S.twoColLeft}>
              <View style={{ backgroundColor: C.goLight, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Text style={[S.tagLabel, { color: C.go, marginBottom: 6 }]}>Reasons to Believe</Text>
                {(a.reasonsToBelieve || []).slice(0, 5).map((r, i) => (
                  <View key={i} style={S.beliefRow}>
                    <Text style={[S.beliefBullet, { color: C.go }]}>+</Text>
                    <Text style={[S.beliefText, { color: '#166534' }]}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reasons to challenge */}
            <View style={S.twoColRight}>
              <View style={{ backgroundColor: C.nogoLight, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: '#fecaca' }}>
                <Text style={[S.tagLabel, { color: C.nogo, marginBottom: 6 }]}>Reasons to Challenge</Text>
                {(a.reasonsToChallenge || []).slice(0, 5).map((r, i) => (
                  <View key={i} style={S.beliefRow}>
                    <Text style={[S.beliefBullet, { color: C.nogo }]}>−</Text>
                    <Text style={[S.beliefText, { color: '#991b1b' }]}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Conditions to pursue */}
        {a.conditionsToPursue && (
          <View style={S.section}>
            <SectionHeader title="Conditions to Pursue" />
            <View style={S.highlightBox}>
              <Text style={S.highlightLabel}>This becomes attractive when</Text>
              <Text style={S.highlightText}>{a.conditionsToPursue}</Text>
            </View>
          </View>
        )}

        {/* Right to win + Timing */}
        <View style={S.twoCol}>
          {a.rightToWin && (
            <View style={S.twoColLeft}>
              <SectionHeader title="Right to Win" />
              <Text style={S.summaryText}>{a.rightToWin}</Text>
            </View>
          )}
          {a.timingAssessment && (
            <View style={S.twoColRight}>
              <SectionHeader title="Timing" />
              <View style={[S.card, { backgroundColor: C.bgLight }]}>
                <Text style={[S.cardTitle, { textTransform: 'capitalize' }]}>{a.timingAssessment}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <Footer company={data.request.companyName} market={data.request.marketSpace} page="Strategic Assessment" />
    </Page>
  );
}

// ── Incumbents page ──────────────────────────────────────────────────────────
function IncumbentsPage({ data }: { data: AnalysisResult }) {
  const inc = data.incumbents;
  if (!inc) return null;

  return (
    <Page size="A4" style={S.page}>
      <View style={S.pageHeaderBar} />
      <View style={S.pageHeader}>
        <Text style={S.pageHeaderLeft}>Incumbents</Text>
        <Text style={S.pageHeaderRight}>{data.request.companyName} — {data.request.marketSpace}</Text>
      </View>

      <View style={S.body}>
        <View style={S.section}>
          <SectionHeader title="Competitive Landscape" sub={inc.marketConcentration ? `Concentration: ${inc.marketConcentration}` : undefined} />
          <Text style={S.summaryText}>{inc.summary}</Text>
        </View>

        {inc.players.map((p, i) => (
          <View key={i} style={S.card}>
            <Text style={S.cardTitle}>{p.name}</Text>
            <Text style={S.cardSub}>{p.marketPosition}</Text>
            <Text style={[S.bodyText, { marginBottom: 8 }]}>{p.description}</Text>

            <View style={S.cardRow}>
              {(p.strengths?.length ?? 0) > 0 && (
                <View style={S.cardCol}>
                  <Text style={S.tagLabel}>Strengths</Text>
                  <BulletList items={(p.strengths || []).slice(0, 3)} color={C.go} />
                </View>
              )}
              {(p.weaknesses?.length ?? 0) > 0 && (
                <View style={S.cardCol}>
                  <Text style={S.tagLabel}>Weaknesses</Text>
                  <BulletList items={(p.weaknesses || []).slice(0, 3)} color={C.nogo} />
                </View>
              )}
            </View>

            {(p.estimatedRevenue || p.founded || p.headquarters) && (
              <View style={[S.cardRow, { marginTop: 8, gap: 8 }]}>
                {p.estimatedRevenue && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={S.mutedText}>Revenue:</Text>
                    <Text style={[S.mutedText, { color: C.textSecondary }]}>{p.estimatedRevenue}</Text>
                  </View>
                )}
                {p.founded && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={S.mutedText}>Founded:</Text>
                    <Text style={[S.mutedText, { color: C.textSecondary }]}>{p.founded}</Text>
                  </View>
                )}
                {p.headquarters && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={S.mutedText}>HQ:</Text>
                    <Text style={[S.mutedText, { color: C.textSecondary }]}>{p.headquarters}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <Footer company={data.request.companyName} market={data.request.marketSpace} page="Incumbents" />
    </Page>
  );
}

// ── Emerging competitors page ────────────────────────────────────────────────
function EmergingPage({ data }: { data: AnalysisResult }) {
  const em = data.emergingCompetitors;
  if (!em) return null;

  return (
    <Page size="A4" style={S.page}>
      <View style={S.pageHeaderBar} />
      <View style={S.pageHeader}>
        <Text style={S.pageHeaderLeft}>Emerging Competitors</Text>
        <Text style={S.pageHeaderRight}>{data.request.companyName} — {data.request.marketSpace}</Text>
      </View>

      <View style={S.body}>
        {/* Stats */}
        <View style={S.statRow}>
          {em.totalFundingInSpace && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>Total Funding</Text>
              <Text style={S.statChipValue}>{em.totalFundingInSpace}</Text>
            </View>
          )}
          {em.fundingTrend && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>Trend</Text>
              <Text style={[S.statChipValue, { fontSize: 9, textTransform: 'capitalize' }]}>{em.fundingTrend}</Text>
            </View>
          )}
          <View style={S.statChip}>
            <Text style={S.statChipLabel}>Startups Tracked</Text>
            <Text style={S.statChipValue}>{em.competitors.length}</Text>
          </View>
        </View>

        <View style={[S.section, { marginTop: 4 }]}>
          <SectionHeader title="Market Overview" />
          <Text style={S.summaryText}>{em.summary}</Text>
        </View>

        {em.competitors.map((c, i) => (
          <View key={i} style={S.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <Text style={S.cardTitle}>{c.name}</Text>
              {(c.fundingStage || c.fundingAmount) && (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  {c.fundingStage && (
                    <View style={{ backgroundColor: '#ede9fe', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 7, color: '#7c3aed', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }}>{c.fundingStage}</Text>
                    </View>
                  )}
                  {c.fundingAmount && (
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.textSecondary }}>{c.fundingAmount}</Text>
                  )}
                </View>
              )}
            </View>
            <Text style={[S.bodyText, { marginBottom: 6 }]}>{c.description}</Text>
            {c.differentiator && (
              <View>
                <Text style={S.tagLabel}>Differentiator</Text>
                <Text style={S.tagText}>{c.differentiator}</Text>
              </View>
            )}
            {(c.investors?.length ?? 0) > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={S.tagLabel}>Investors</Text>
                <Text style={S.tagText}>{(c.investors || []).join(', ')}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <Footer company={data.request.companyName} market={data.request.marketSpace} page="Emerging Competitors" />
    </Page>
  );
}

// ── Market sizing page ───────────────────────────────────────────────────────
function MarketPage({ data }: { data: AnalysisResult }) {
  const m = data.marketSizing;
  if (!m) return null;

  return (
    <Page size="A4" style={S.page}>
      <View style={S.pageHeaderBar} />
      <View style={S.pageHeader}>
        <Text style={S.pageHeaderLeft}>Market Sizing</Text>
        <Text style={S.pageHeaderRight}>{data.request.companyName} — {data.request.marketSpace}</Text>
      </View>

      <View style={S.body}>
        {/* Market stats */}
        <View style={S.statRow}>
          {m.tam && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>TAM</Text>
              <Text style={S.statChipValue}>{m.tam}</Text>
            </View>
          )}
          {m.sam && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>SAM</Text>
              <Text style={S.statChipValue}>{m.sam}</Text>
            </View>
          )}
          {m.som && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>SOM</Text>
              <Text style={S.statChipValue}>{m.som}</Text>
            </View>
          )}
          {m.cagr && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>CAGR</Text>
              <Text style={S.statChipValue}>{m.cagr}</Text>
            </View>
          )}
          {m.timeframe && (
            <View style={S.statChip}>
              <Text style={S.statChipLabel}>Timeframe</Text>
              <Text style={[S.statChipValue, { fontSize: 9 }]}>{m.timeframe}</Text>
            </View>
          )}
        </View>

        <View style={S.section}>
          <SectionHeader title="Market Overview" />
          <Text style={S.summaryText}>{m.summary}</Text>
        </View>

        <View style={S.twoCol}>
          {(m.growthDrivers?.length ?? 0) > 0 && (
            <View style={S.twoColLeft}>
              <SectionHeader title="Growth Drivers" />
              <BulletList items={(m.growthDrivers || []).slice(0, 6)} color={C.go} />
            </View>
          )}
          {(m.constraints?.length ?? 0) > 0 && (
            <View style={S.twoColRight}>
              <SectionHeader title="Constraints" />
              <BulletList items={(m.constraints || []).slice(0, 6)} color={C.nogo} />
            </View>
          )}
        </View>
      </View>

      <Footer company={data.request.companyName} market={data.request.marketSpace} page="Market Sizing" />
    </Page>
  );
}

// ── Risks & sources page ─────────────────────────────────────────────────────
function RisksAndSourcesPage({ data }: { data: AnalysisResult }) {
  const a = data.opportunityAssessment;
  const allSources = [
    ...(data.incumbents?.sources || []),
    ...(data.emergingCompetitors?.sources || []),
    ...(data.marketSizing?.sources || []),
  ].filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i); // url-dedup

  return (
    <Page size="A4" style={S.page}>
      <View style={S.pageHeaderBar} />
      <View style={S.pageHeader}>
        <Text style={S.pageHeaderLeft}>Risks & Sources</Text>
        <Text style={S.pageHeaderRight}>{data.request.companyName} — {data.request.marketSpace}</Text>
      </View>

      <View style={S.body}>
        {/* Key risks */}
        {(a?.keyRisks?.length ?? 0) > 0 && (
          <View style={S.section}>
            <SectionHeader title="Key Risks" sub={`${a!.keyRisks!.length} identified`} />
            {a!.keyRisks!.map((risk, i) => (
              <View key={i} style={S.riskItem}>
                <Text style={S.riskNumber}>{i + 1}.</Text>
                <Text style={S.riskText}>{risk}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Leadership questions */}
        {(a?.needsLeadershipInput?.length ?? 0) > 0 && (
          <View style={S.section}>
            <SectionHeader title="Open Leadership Questions" />
            {a!.needsLeadershipInput!.map((q, i) => (
              <View key={i} style={S.bulletItem}>
                <Text style={[S.bulletDot, { color: C.maybe }]}>?</Text>
                <Text style={S.bulletText}>{q}</Text>
              </View>
            ))}
          </View>
        )}

        {/* White space */}
        {(a?.whiteSpaceOpportunities?.length ?? 0) > 0 && (
          <View style={S.section}>
            <SectionHeader title="White Space Opportunities" />
            <BulletList items={a!.whiteSpaceOpportunities!.slice(0, 5)} color={C.brand} />
          </View>
        )}

        {/* Sources */}
        {allSources.length > 0 && (
          <View style={S.section}>
            <SectionHeader title="Sources" sub={`${allSources.length} total`} />
            {allSources.slice(0, 20).map((s, i) => (
              <View key={i} style={S.sourceItem}>
                <Text style={S.sourceIndex}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={S.sourceTitle}>{s.title}</Text>
                  <Text style={S.sourcePublisher}>{s.publisher || s.url}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Footer company={data.request.companyName} market={data.request.marketSpace} page="Risks & Sources" />
    </Page>
  );
}

// ── Root document ────────────────────────────────────────────────────────────
export default function WorkspacePDF({ data }: { data: AnalysisResult }) {
  return (
    <Document
      title={`${data.request.companyName} — ${data.request.marketSpace}`}
      author="Aucctus"
      subject="Competitive Landscape Assessment"
    >
      <CoverPage data={data} />
      <AssessmentPage data={data} />
      <IncumbentsPage data={data} />
      <EmergingPage data={data} />
      <MarketPage data={data} />
      <RisksAndSourcesPage data={data} />
    </Document>
  );
}
