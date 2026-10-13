import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecurrenceCluster, Complaint, SystemStats } from '../types';

/**
 * Exports a detailed, official Greater Chennai Corporation (GCC)
 * Investigation Dossier for a single recurrence cluster.
 */
export function exportClusterReportPDF(cluster: RecurrenceCluster, complaints: Complaint[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // GCC Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GREATER CHENNAI CORPORATION (GCC)', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('STORMWATER DRAINAGE & CIVIC COMPLAINT RECURRENCE INTELLIGENCE', 14, 17);
  doc.text(`INCIDENT DOSSIER REF: ${cluster.id} | DATE: ${new Date().toLocaleDateString('en-IN')}`, 14, 23);

  // Status Badge
  const isRelapse = cluster.isPostRepairRecurrence || cluster.status === 'post_repair_relapse';
  if (isRelapse) {
    doc.setFillColor(225, 29, 72); // Rose-600
    doc.roundedRect(pageWidth - 70, 7, 56, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DEFECT WARRANTY BREACH', pageWidth - 42, 13, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Post-Repair Relapse (${cluster.daysBetweenRepairAndRecurrence || 14}d)`, pageWidth - 42, 18, { align: 'center' });
  }

  let y = 36;

  // Cluster Overview Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(cluster.title, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    body: [
      [
        { content: 'Area / Street:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        cluster.area,
        { content: 'Chennai Zone:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        cluster.zone,
      ],
      [
        { content: 'Ward Number:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        `Ward ${cluster.ward}`,
        { content: 'Cluster Coordinates:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        `${cluster.latitude.toFixed(4)} N, ${cluster.longitude.toFixed(4)} E`,
      ],
      [
        { content: 'Recurrence Count:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        `${cluster.recurrenceCount} Reported Incidents`,
        { content: 'Cluster Radius:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        `~${cluster.radiusMeters} meters`,
      ],
      [
        { content: 'Priority Score:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        `${cluster.priorityScore}/100 (${cluster.priorityScore >= 80 ? 'CRITICAL' : 'HIGH'})`,
        { content: 'Resolution Status:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        cluster.status.toUpperCase().replace(/_/g, ' '),
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Priority Score Formula Breakdown Callout
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  doc.text('TRANSPARENT PRIORITY BREAKDOWN:', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Formula: Recurrence (+${cluster.priorityBreakdown.recurrencePoints}pts) + Severity (+${cluster.priorityBreakdown.severityPoints}pts) + Duration (+${cluster.priorityBreakdown.durationPoints}pts) + Modifier (+${cluster.priorityBreakdown.vulnerabilityModifier}pts) = ${cluster.priorityScore}/100`,
    18,
    y + 10
  );
  doc.text(`Rationale: ${cluster.priorityBreakdown.rationale}`, 18, y + 14);

  y += 22;

  // AI Root Cause Hypotheses Section
  if (cluster.aiAnalysis) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('1. AI ROOT CAUSE DIAGNOSTIC HYPOTHESES (GEMINI 3.8 FLASH)', 14, y);
    y += 4;

    // Disclaimer Box
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('NOTICE: AI FINDINGS ARE HYPOTHESES, NOT CONFIRMED FACTS', 18, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text('Field Ward Engineers must physically inspect invert levels and culvert barrels prior to sanctioning civil work.', 18, y + 8);
    y += 16;

    // Hypotheses Table
    const hypRows = cluster.aiAnalysis.hypotheses.map((h, i) => [
      `#${i + 1}`,
      h.title,
      h.engineeringCategory,
      h.hypothesis,
      h.supportingEvidence.join('; '),
    ]);

    autoTable(doc, {
      startY: y,
      theme: 'striped',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      head: [['#', 'Hypothesis Name', 'Category', 'Hydraulic Mechanism', 'Corroborating Evidence']],
      body: hypRows,
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 32, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 64 },
        4: { cellWidth: 50 },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Recommended Inspections Table
    if (cluster.aiAnalysis.recommendedInspections?.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Recommended Field Engineering Inspections:', 14, y);
      y += 3;

      const inspRows = cluster.aiAnalysis.recommendedInspections.map((r) => [
        `Step ${r.step}`,
        r.inspectionType,
        r.targetAsset,
        r.description,
        r.urgency,
      ]);

      autoTable(doc, {
        startY: y,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        head: [['Step', 'Inspection Type', 'Target Asset', 'Protocol Description', 'Urgency']],
        body: inspRows,
        columnStyles: {
          0: { cellWidth: 14 },
          1: { cellWidth: 38, fontStyle: 'bold' },
          2: { cellWidth: 36 },
          3: { cellWidth: 72 },
          4: { cellWidth: 20 },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Page 2: Complaint History & Verified Repairs
  doc.addPage();
  y = 16;

  // Page 2 Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`2. CITIZEN COMPLAINT RECURRENCE LOG (${complaints.length} INCIDENTS)`, 14, y);
  y += 4;

  const complaintRows = complaints.map((c) => [
    c.id,
    new Date(c.createdAt).toLocaleDateString('en-IN'),
    c.severity.toUpperCase(),
    c.title,
    c.englishTranslation || c.description,
    c.landmark || c.area,
  ]);

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    head: [['ID', 'Date', 'Severity', 'Title', 'Description / Translation', 'Landmark']],
    body: complaintRows,
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 20 },
      2: { cellWidth: 16 },
      3: { cellWidth: 36, fontStyle: 'bold' },
      4: { cellWidth: 54 },
      5: { cellWidth: 30 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Recorded Interventions & Inspections
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('3. MUNICIPAL REPAIR & FIELD INSPECTION AUDIT TRAIL', 14, y);
  y += 4;

  const repairData = cluster.repairs.map((r) => [
    r.id,
    'Civil Intervention',
    new Date(r.workCompletedAt).toLocaleDateString('en-IN'),
    r.workType,
    `${r.officerName} (${r.officerDesignation})`,
    r.contractorAgency || 'GCC Direct',
    `INR ${r.estimatedCostINR?.toLocaleString() || 'N/A'}`,
  ]);

  const inspectionData = cluster.inspections.map((i) => [
    i.id,
    'Field Inspection',
    new Date(i.verifiedAt).toLocaleDateString('en-IN'),
    i.inspectionFindings,
    `${i.inspectorName} (${i.inspectorDesignation})`,
    i.approvalStatus === 'approved_verified' ? 'APPROVED & VERIFIED' : 'REJECTED - REWORK',
    `Silt: ${i.siltLevelCM}cm`,
  ]);

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    head: [['Ref ID', 'Type', 'Date', 'Scope / Findings', 'Official In-Charge', 'Agency / Decision', 'Details']],
    body: [...repairData, ...inspectionData],
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // Official Signature Block
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(148, 163, 184);
  doc.line(14, y, 75, y);
  doc.line(pageWidth - 75, y, pageWidth - 14, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Assistant Executive Engineer (SWD)', 14, y + 4);
  doc.text(`Ward ${cluster.ward}, Greater Chennai Corp`, 14, y + 8);

  doc.text('Executive Engineer / Quality Control', pageWidth - 75, y + 4);
  doc.text('Greater Chennai Corporation Head Office', pageWidth - 75, y + 8);

  // Download PDF
  const filename = `GCC_Recurrence_Report_${cluster.id}_${cluster.area.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Exports an executive citywide dashboard statistics report for Chennai municipal authorities.
 */
export function exportDashboardStatsPDF(stats: SystemStats | null, clusters: RecurrenceCluster[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GREATER CHENNAI CORPORATION (GCC)', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('EXECUTIVE MONSOON RECURRENCE & DEFECT LIABILITY BRIEFING', 14, 17);
  doc.text(`GENERATED: ${new Date().toLocaleString('en-IN')} | MONSOON READINESS PROTOCOL`, 14, 23);

  let y = 35;

  // Citywide KPIs Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CITYWIDE COMPLAINT RECURRENCE SUMMARY', 14, y);
  y += 5;

  const totalComplaints = stats?.totalComplaints ?? 16;
  const unresolvedCases = stats?.unresolvedCases ?? 13;
  const recurringIncidents = stats?.recurringIncidents ?? 9;
  const verifiedRepairs = stats?.verifiedRepairs ?? 4;
  const postRepairRelapses = stats?.postRepairRelapses ?? 5;
  const recurrenceRate = stats?.recurrenceRatePct ?? 75;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    head: [['Total Complaints', 'Unresolved Cases', 'Recurring Hotspots', 'Recurrence Rate', 'Verified Repairs', 'Post-Repair Relapses']],
    body: [
      [
        totalComplaints.toString(),
        unresolvedCases.toString(),
        recurringIncidents.toString(),
        `${recurrenceRate}%`,
        verifiedRepairs.toString(),
        postRepairRelapses.toString(),
      ],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Top Vulnerable Zones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOP VULNERABLE CHENNAI MUNICIPAL ZONES', 14, y);
  y += 4;

  const zoneData = (stats?.topVulnerableZones || [
    { zone: 'Zone 13 - Adyar', count: 4 },
    { zone: 'Zone 10 - Kodambakkam', count: 3 },
    { zone: 'Zone 14 - Perungudi', count: 3 },
    { zone: 'Zone 6 - Thiru-Vi-Ka Nagar', count: 2 },
    { zone: 'Zone 4 - Tondiarpet', count: 1 },
  ]).map((z, idx) => [`#${idx + 1}`, z.zone, `${z.count} recurring clusters`, 'High Alert']);

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    head: [['Rank', 'Municipal Zone', 'Active Recurrent Hotspots', 'Monsoon Action Protocol']],
    body: zoneData,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Active Hotspots Ranked by Priority
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CHRONIC CIVIC RECURRENCE HOTSPOTS (RANKED BY PRIORITY SCORE)', 14, y);
  y += 4;

  const sortedClusters = [...clusters].sort((a, b) => b.priorityScore - a.priorityScore);
  const clusterRows = sortedClusters.map((c, i) => [
    `#${i + 1}`,
    c.id,
    c.area,
    `${c.zone} (W${c.ward})`,
    `${c.recurrenceCount} events`,
    `${c.priorityScore}/100`,
    c.isPostRepairRecurrence ? 'POST-REPAIR RELAPSE' : c.status.toUpperCase().replace(/_/g, ' '),
    c.repairs.length > 0 ? `${c.repairs.length} intervention(s)` : 'None logged',
  ]);

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    head: [['#', 'ID', 'Area / Hotspot', 'Zone & Ward', 'Recurrence', 'Priority', 'Status', 'Intervention History']],
    body: clusterRows,
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18 },
      5: { cellWidth: 16, fontStyle: 'bold' },
      6: { cellWidth: 26 },
      7: { cellWidth: 24 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Sign-off section
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(148, 163, 184);
  doc.line(14, y, 75, y);
  doc.line(pageWidth - 75, y, pageWidth - 14, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Chief Engineer (Stormwater Drainage)', 14, y + 4);
  doc.text('Greater Chennai Corporation, Ripon Building', 14, y + 8);

  doc.text('Special Commissioner (Works)', pageWidth - 75, y + 4);
  doc.text('GCC Municipal Administration', pageWidth - 75, y + 8);

  const filename = `GCC_Executive_Recurrence_Briefing_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
