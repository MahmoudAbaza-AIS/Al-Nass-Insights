-- Seed from UI Mockups 1.png–7.png + list of UI items (cropped symbols).
-- Mockup sample numbers are visual placeholders only — not production KPI values.

-- ========== Symbols (nav, charts, icons, heroes, section headers) ==========
MERGE meta.Symbol AS t
USING (VALUES
    -- Navigation rail (shared across all 7 dashboards)
    (N'nav.hospital_overview', N'Hospital Overview Nav', N'Nav', N'NavIcon', N'mockup/sidebar/building', N'DASH-01 building icon'),
    (N'nav.clinical', N'Clinical Performance Nav', N'Nav', N'NavIcon', N'mockup/sidebar/heart_ekg', N'DASH-02 heart/EKG icon'),
    (N'nav.operating_room', N'Operating Room Nav', N'Nav', N'NavIcon', N'mockup/sidebar/scissors', N'DASH-03 scissors/scalpel icon'),
    (N'nav.call_center', N'Call Center Nav', N'Nav', N'NavIcon', N'mockup/sidebar/headset', N'DASH-04 headset icon'),
    (N'nav.outpatient', N'Outpatient Clinic Nav', N'Nav', N'NavIcon', N'mockup/sidebar/stethoscope', N'DASH-05 stethoscope/layout icon'),
    (N'nav.emergency', N'Emergency Nav', N'Nav', N'NavIcon', N'mockup/sidebar/ambulance', N'DASH-06 ambulance icon'),
    (N'nav.inpatient', N'Inpatient Nav', N'Nav', N'NavIcon', N'mockup/sidebar/bed', N'DASH-07 bed icon'),

    -- Chart / widget chrome types (from list of UI items + mockups)
    (N'chart.flip_counter', N'Flip Counter', N'Chart', N'FlipCounter', N'ui-items/flip_counter', N'3-digit flip display for visit counts'),
    (N'chart.cylinder_bars', N'3D Cylinder Bars', N'Chart', N'CylinderBars', N'mockup/dash01/application_request', N'Application request outcome bars'),
    (N'chart.radial_gauge', N'Radial Gauge', N'Chart', N'RadialGauge', N'ui-items/radial_gauge', N'Circular utilization / rate rings'),
    (N'chart.isometric_bars', N'Isometric Bar Chart', N'Chart', N'IsometricBars', N'mockup/dash01/outpatient_clinics', N'On-time / no-show / cancellation bars'),
    (N'chart.donut', N'Donut Chart', N'Chart', N'Donut', N'mockup/dash01/call_center', N'Inbound/outbound or appointment split'),
    (N'chart.progress_bar', N'Progress Bar', N'Chart', N'ProgressBar', N'ui-items/ventilator_utilization', N'Horizontal utilization bar'),
    (N'chart.sparkline', N'Sparkline Trend', N'Chart', N'Sparkline', N'mockup/dash02/outcomes', N'Recovery/complication/mortality waves'),
    (N'chart.radar', N'Radar / Spider Chart', N'Chart', N'Radar', N'ui-items/consultation_radar', N'Weekday consultation minutes'),
    (N'chart.speedometer', N'Speedometer Gauge', N'Chart', N'Speedometer', N'mockup/dash05/waiting_time', N'0–60 minute waiting gauge'),
    (N'chart.stacked_bars_week', N'Weekly Stacked Bars', N'Chart', N'StackedBars', N'mockup/dash04/call_volume_overview', N'Sun–Sat inbound/outbound'),
    (N'chart.line_trend', N'Line Trend Chart', N'Chart', N'LineTrend', N'mockup/dash04/abandon_rate', N'Abandon rate over days'),
    (N'chart.thermometer', N'Thermometer Capacity', N'Chart', N'Thermometer', N'mockup/dash07/bed_capacity', N'Used vs available beds'),
    (N'chart.star_rating', N'Star Rating', N'Chart', N'StarRating', N'mockup/dash07/satisfaction', N'1–5 patient satisfaction'),
    (N'chart.status_dots', N'OR Status Dots', N'Chart', N'StatusDots', N'mockup/dash03/or_status', N'Active/idle OR indicators'),

    -- Hero / isometric centerpieces
    (N'hero.hospital_building', N'Hospital Building 3D', N'Hero', N'IsometricHero', N'mockup/dash01/center', N'Hospital Overview centerpiece'),
    (N'hero.anatomy_wireframe', N'Anatomy Wireframe 3D', N'Hero', N'IsometricHero', N'mockup/dash02/center', N'Clinical Performance centerpiece'),
    (N'hero.or_table', N'Operating Table 3D', N'Hero', N'IsometricHero', N'mockup/dash03/center', N'OR Performance centerpiece'),
    (N'hero.call_globe', N'Headset Globe 3D', N'Hero', N'IsometricHero', N'mockup/dash04/center', N'Call Center centerpiece'),
    (N'hero.clinic_waiting', N'Clinic Waiting Room 3D', N'Hero', N'IsometricHero', N'mockup/dash05/center', N'OPD centerpiece'),
    (N'hero.ambulance', N'Ambulance 3D', N'Hero', N'IsometricHero', N'mockup/dash06/center', N'Emergency centerpiece'),
    (N'hero.inpatient_bed', N'Inpatient Bed Scene 3D', N'Hero', N'IsometricHero', N'mockup/dash07/center', N'Inpatient centerpiece'),

    -- Metric icons
    (N'icon.er_handshake', N'Door-to-Doctor Icon', N'Icon', N'MetricIcon', N'mockup/icon/handshake', N'ER door-to-doctor'),
    (N'icon.bed', N'Bed Occupancy Icon', N'Icon', N'MetricIcon', N'mockup/icon/bed', N'Bed occupancy'),
    (N'icon.recovery_cross', N'Recovery Rate Icon', N'Icon', N'MetricIcon', N'mockup/icon/recovery', N'Clinical recovery'),
    (N'icon.pressure_ulcer', N'Pressure Ulcer Icon', N'Icon', N'MetricIcon', N'mockup/icon/pressure_ulcer', NULL),
    (N'icon.falls', N'Falls Icon', N'Icon', N'MetricIcon', N'mockup/icon/falls', NULL),
    (N'icon.pill_bottle', N'Medication Icon', N'Icon', N'MetricIcon', N'mockup/icon/medication', NULL),
    (N'icon.infection', N'Infection Icon', N'Icon', N'MetricIcon', N'mockup/icon/virus', NULL),
    (N'icon.clock', N'Clock / Duration Icon', N'Icon', N'MetricIcon', N'mockup/icon/clock', NULL),
    (N'icon.cancel_x', N'Cancellation Icon', N'Icon', N'MetricIcon', N'mockup/icon/cancel', NULL),
    (N'icon.phone', N'Call Volume Icon', N'Icon', N'MetricIcon', N'mockup/icon/phone', NULL),
    (N'icon.agent', N'Service Level Agent Icon', N'Icon', N'MetricIcon', N'mockup/icon/agent', NULL),
    (N'icon.hourglass', N'Handle Time Icon', N'Icon', N'MetricIcon', N'mockup/icon/hourglass', NULL),
    (N'icon.abandoned_call', N'Abandoned Calls Icon', N'Icon', N'MetricIcon', N'mockup/icon/abandoned', NULL),
    (N'icon.referral', N'Referral Icon', N'Icon', N'MetricIcon', N'mockup/icon/referral', NULL),
    (N'icon.calendar', N'Lead Time Calendar Icon', N'Icon', N'MetricIcon', N'mockup/icon/calendar', NULL),
    (N'icon.clinic_chair', N'Clinic Utilization Icon', N'Icon', N'MetricIcon', N'mockup/icon/chair', NULL),
    (N'icon.physician', N'Visits per Physician Icon', N'Icon', N'MetricIcon', N'mockup/icon/doctor', NULL),
    (N'icon.house', N'Discharge Home Icon', N'Icon', N'MetricIcon', N'mockup/icon/house', NULL),
    (N'icon.transfer_hospital', N'Referral Out Icon', N'Icon', N'MetricIcon', N'mockup/icon/hospital', NULL),
    (N'icon.lwbs', N'LWBS Icon', N'Icon', N'MetricIcon', N'mockup/icon/walking_out', NULL),
    (N'icon.wheelchair', N'Readmission Icon', N'Icon', N'MetricIcon', N'mockup/icon/wheelchair', NULL),
    (N'icon.microscope', N'OR Utilization Icon', N'Icon', N'MetricIcon', N'mockup/icon/microscope', NULL),
    (N'icon.clipboard', N'Daily Surgeries Icon', N'Icon', N'MetricIcon', N'mockup/icon/clipboard', NULL),
    (N'icon.reoperation', N'Reoperation Icon', N'Icon', N'MetricIcon', N'mockup/icon/reoperation', NULL),

    -- Section headers (from list of UI items)
    (N'section.respiratory', N'Respiratory & Ventilation', N'SectionHeader', N'SectionTitle', N'ui-items/respiratory', NULL),
    (N'section.outcomes', N'Patient Outcomes', N'SectionHeader', N'SectionTitle', N'ui-items/outcomes', NULL),
    (N'section.medication', N'Medication', N'SectionHeader', N'SectionTitle', N'ui-items/medication', NULL),
    (N'section.infections', N'Infections', N'SectionHeader', N'SectionTitle', N'ui-items/infections', NULL)
) AS s (symbol_key, name, category, symbol_kind, asset_hint, description)
ON t.symbol_key = s.symbol_key
WHEN MATCHED THEN UPDATE SET
    name = s.name, category = s.category, symbol_kind = s.symbol_kind,
    asset_hint = s.asset_hint, description = s.description, is_active = 1
WHEN NOT MATCHED THEN INSERT (symbol_key, name, category, symbol_kind, asset_hint, description, is_active)
VALUES (s.symbol_key, s.name, s.category, s.symbol_kind, s.asset_hint, s.description, 1);

-- ========== Dashboards ==========
MERGE meta.Dashboard AS t
USING (VALUES
    (N'DASH-01', N'Hospital Overview', N'Overall hospital performance', 1, N'nav.hospital_overview'),
    (N'DASH-02', N'Clinical Performance', N'Clinical quality and outcomes', 2, N'nav.clinical'),
    (N'DASH-03', N'Operating Room Performance', N'Operating room operations', 3, N'nav.operating_room'),
    (N'DASH-04', N'Call Center Performance', N'Contact center', 4, N'nav.call_center'),
    (N'DASH-05', N'Outpatient Clinic Performance', N'OPD operations', 5, N'nav.outpatient'),
    (N'DASH-06', N'Emergency Performance', N'Emergency department', 6, N'nav.emergency'),
    (N'DASH-07', N'Inpatient Services Performance', N'Inpatient operations', 7, N'nav.inpatient')
) AS s (dashboard_id, name, business_area, sort_order, nav_symbol_key)
ON t.dashboard_id = s.dashboard_id
WHEN MATCHED THEN UPDATE SET
    name = s.name, business_area = s.business_area, sort_order = s.sort_order,
    nav_symbol_key = s.nav_symbol_key, is_active = 1
WHEN NOT MATCHED THEN INSERT (dashboard_id, name, business_area, sort_order, nav_symbol_key, is_active)
VALUES (s.dashboard_id, s.name, s.business_area, s.sort_order, s.nav_symbol_key, 1);

-- ========== Widgets (69) ==========
MERGE meta.Widget AS t
USING (VALUES
    -- DASH-01 Hospital Overview (mockup 1.png)
    (N'O-01', N'DASH-01', N'er.visits.total', N'Total ER Visits', N'Header', N'FlipCounter', N'count', N'chart.flip_counter', 1, N'Not-in-KPI-doc', N'Mockup placeholder 093'),
    (N'O-02', N'DASH-01', N'opd.visits.attended', N'Total OPD Visits', N'Header', N'FlipCounter', N'count', N'chart.flip_counter', 2, N'Mapped-full', N'Label ODP→OPD; mockup 093'),
    (N'O-03', N'DASH-01', N'application_request.outcome_split', N'Application Request', N'Left', N'CylinderBars', N'%', N'chart.cylinder_bars', 3, N'Mapped-full', N'Approved/Waiting/Rejected'),
    (N'O-04', N'DASH-01', N'or.utilization_rate', N'Operating Room Usage', N'Left', N'RadialGauge', N'%', N'chart.radial_gauge', 4, N'Workflow-not-implemented', N'OR utilization ring'),
    (N'O-05', N'DASH-01', N'opd.appointment_performance', N'Outpatient clinics', N'Right', N'IsometricBars', N'%', N'chart.isometric_bars', 5, N'Mapped-partial', N'On-Time/No-Show/Cancellation'),
    (N'O-06', N'DASH-01', N'callcenter.inbound_outbound_share', N'Call Center', N'Right', N'Donut', N'%', N'chart.donut', 6, N'Workflow-not-implemented', N'Inbound/Outbound'),
    (N'O-07', N'DASH-01', N'er.door_to_doctor_minutes', N'Emergency Door-to-Doctor', N'Bottom', N'MetricTile', N'min', N'icon.er_handshake', 7, N'Workflow-not-implemented', NULL),
    (N'O-08', N'DASH-01', N'inpatient.bed_occupancy_rate', N'Inpatient Bed Occupancy', N'Bottom', N'MetricTile', N'%', N'icon.bed', 8, N'Listed-no-query', NULL),
    (N'O-09', N'DASH-01', N'clinical.recovery_rate', N'Clinical Recovery Rate', N'Bottom', N'MetricTile', N'%', N'icon.recovery_cross', 9, N'Not-in-KPI-doc', NULL),

    -- DASH-02 Clinical (mockup 2.png)
    (N'C-01', N'DASH-02', N'clinical.pressure_ulcer_rate', N'Pressure Ulcer Rate', N'Top', N'MetricTile', N'per 1000', N'icon.pressure_ulcer', 1, N'Not-in-KPI-doc', NULL),
    (N'C-02', N'DASH-02', N'clinical.adverse_events_rate', N'Adverse Events Rate', N'Top', N'RadialGauge', N'%', N'chart.radial_gauge', 2, N'Not-in-KPI-doc', NULL),
    (N'C-03', N'DASH-02', N'clinical.missed_diagnosis_rate', N'Missed Diagnosis Rate', N'Top', N'RadialGauge', N'%', N'chart.radial_gauge', 3, N'Not-in-KPI-doc', NULL),
    (N'C-04', N'DASH-02', N'clinical.vte_compliance', N'VTE Compliance', N'Top', N'RadialGauge', N'%', N'chart.radial_gauge', 4, N'Not-in-KPI-doc', NULL),
    (N'C-05', N'DASH-02', N'clinical.falls_rate', N'Falls Rate', N'Top', N'MetricTile', N'per 1000', N'icon.falls', 5, N'Not-in-KPI-doc', NULL),
    (N'C-06', N'DASH-02', N'clinical.ventilator_utilization', N'Ventilator Utilization', N'Respiratory & Ventilation', N'ProgressBar', N'%', N'chart.progress_bar', 6, N'Not-in-KPI-doc', NULL),
    (N'C-07', N'DASH-02', N'clinical.ventilator_days', N'Ventilator Days', N'Respiratory & Ventilation', N'MetricTile', N'days', N'section.respiratory', 7, N'Not-in-KPI-doc', NULL),
    (N'C-08', N'DASH-02', N'clinical.extubation_failure', N'Extubation Failure', N'Respiratory & Ventilation', N'RadialGauge', N'%', N'chart.radial_gauge', 8, N'Not-in-KPI-doc', NULL),
    (N'C-09', N'DASH-02', N'clinical.reintubation_48h', N'Reintubation (48h)', N'Respiratory & Ventilation', N'RadialGauge', N'%', N'chart.radial_gauge', 9, N'Not-in-KPI-doc', NULL),
    (N'C-10', N'DASH-02', N'clinical.recovery_rate', N'Recovery Rate', N'Patient Outcomes', N'SparklineValue', N'%', N'chart.sparkline', 10, N'Not-in-KPI-doc', NULL),
    (N'C-11', N'DASH-02', N'clinical.complication_rate', N'Complication Rate', N'Patient Outcomes', N'SparklineValue', N'%', N'chart.sparkline', 11, N'Not-in-KPI-doc', NULL),
    (N'C-12', N'DASH-02', N'clinical.mortality_rate', N'Mortality Rate', N'Patient Outcomes', N'SparklineValue', N'%', N'chart.sparkline', 12, N'Not-in-KPI-doc', NULL),
    (N'C-13', N'DASH-02', N'clinical.med_turnaround_minutes', N'Medication Turnaround Time', N'Medication', N'MetricTile', N'min', N'icon.pill_bottle', 13, N'Not-in-KPI-doc', NULL),
    (N'C-14', N'DASH-02', N'clinical.near_miss', N'Near Miss', N'Medication', N'BarIndicator', N'%', N'section.medication', 14, N'Not-in-KPI-doc', NULL),
    (N'C-15', N'DASH-02', N'clinical.medication_error', N'Medication Error', N'Medication', N'BarIndicator', N'%', N'section.medication', 15, N'Not-in-KPI-doc', NULL),
    (N'C-16', N'DASH-02', N'or.ssi_rate', N'SSI Rate', N'Infections', N'MetricTile', N'%', N'icon.infection', 16, N'Workflow-not-implemented', NULL),
    (N'C-17', N'DASH-02', N'clinical.cauti_rate', N'CAUTI Rate', N'Infections', N'MetricTile', N'%', N'icon.infection', 17, N'Not-in-KPI-doc', NULL),
    (N'C-18', N'DASH-02', N'clinical.clabsi_rate', N'CLABSI Rate', N'Infections', N'MetricTile', N'%', N'icon.infection', 18, N'Not-in-KPI-doc', NULL),
    (N'C-19', N'DASH-02', N'clinical.vap_rate', N'VAP Rate', N'Infections', N'MetricTile', N'%', N'icon.infection', 19, N'Not-in-KPI-doc', NULL),

    -- DASH-03 OR (mockup 3.png)
    (N'R-01', N'DASH-03', N'or.utilization_rate', N'OR Utilization Rate', N'Top', N'MetricTile', N'%', N'icon.microscope', 1, N'Workflow-not-implemented', NULL),
    (N'R-02', N'DASH-03', N'or.first_case_ontime', N'First Case On-Time Start', N'Top', N'MetricTile', N'%', N'icon.clock', 2, N'Workflow-not-implemented', NULL),
    (N'R-03', N'DASH-03', N'or.turnover_minutes', N'Turnover Time', N'Top', N'MetricTile', N'min', N'icon.clock', 3, N'Workflow-not-implemented', NULL),
    (N'R-04', N'DASH-03', N'or.cancellation_rate', N'Cancellation Rate', N'Top', N'MetricTile', N'%', N'icon.cancel_x', 4, N'Workflow-not-implemented', NULL),
    (N'R-05', N'DASH-03', N'or.postop_complication_rate', N'Postoperative Complication Rate', N'Ring', N'RadialGauge', N'%', N'chart.radial_gauge', 5, N'Workflow-not-implemented', NULL),
    (N'R-06', N'DASH-03', N'or.ssi_rate', N'Surgical Site Infection Rate', N'Ring', N'RadialGauge', N'%', N'chart.radial_gauge', 6, N'Workflow-not-implemented', NULL),
    (N'R-07', N'DASH-03', N'or.daily_surgeries_cath', N'Daily No of surgeries & cath', N'Ring', N'MetricTile', N'count', N'icon.clipboard', 7, N'Workflow-not-implemented', NULL),
    (N'R-08', N'DASH-03', N'or.reoperation_rate', N'Reoperation Rate', N'Ring', N'MetricTile', N'%', N'icon.reoperation', 8, N'Workflow-not-implemented', NULL),
    (N'R-09', N'DASH-03', N'or.room_count', N'Total ORs', N'Center', N'MetricTile', N'count', N'hero.or_table', 9, N'Not-in-KPI-doc', NULL),
    (N'R-10', N'DASH-03', N'or.active_idle_status', N'Active / Idle ORs', N'Center', N'StatusDots', NULL, N'chart.status_dots', 10, N'Not-in-KPI-doc', N'Live status dots'),

    -- DASH-04 Call Center (mockup 4.png)
    (N'CC-01', N'DASH-04', N'callcenter.volume_total', N'Total Call Volume', N'Main', N'MetricTile', N'count', N'icon.phone', 1, N'Workflow-not-implemented', N'Inbound & Outbound'),
    (N'CC-02', N'DASH-04', N'callcenter.service_level_20s', N'Service Level', N'Main', N'MetricTile', N'%', N'icon.agent', 2, N'Workflow-not-implemented', N'Answered within 20 Sec'),
    (N'CC-03', N'DASH-04', N'callcenter.aht', N'Average Handle Time', N'Main', N'MetricTile', N'mm:ss', N'icon.hourglass', 3, N'Workflow-not-implemented', NULL),
    (N'CC-04', N'DASH-04', N'callcenter.abandoned_rate', N'Abandoned Calls', N'Main', N'MetricTile', N'%', N'icon.abandoned_call', 4, N'Workflow-not-implemented', N'Mockup label Abundant'),
    (N'CC-05', N'DASH-04', N'callcenter.volume_by_day', N'Call Volume Overview', N'Charts', N'StackedBars', N'count', N'chart.stacked_bars_week', 5, N'Workflow-not-implemented', N'Sun–Sat inbound/outbound'),
    (N'CC-06', N'DASH-04', N'callcenter.abandon_trend', N'Abandon Rate trend', N'Charts', N'LineTrend', N'%', N'chart.line_trend', 6, N'Workflow-not-implemented', NULL),

    -- DASH-05 OPD (mockup 5.png)
    (N'P-01', N'DASH-05', N'opd.visits.attended', N'Total OPD Visits', N'Header', N'FlipCounter', N'count', N'chart.flip_counter', 1, N'Mapped-full', NULL),
    (N'P-02', N'DASH-05', N'opd.referral_rate', N'Referral', N'Left', N'MetricTile', N'%', N'icon.referral', 2, N'Listed-no-query', NULL),
    (N'P-03', N'DASH-05', N'opd.appointment_lead_days', N'Appointment Lead Time', N'Left', N'MetricTile', N'days', N'icon.calendar', 3, N'Mapped-full', NULL),
    (N'P-04', N'DASH-05', N'opd.clinic_utilization', N'Clinic Utilization', N'Left', N'MetricTile', N'%', N'icon.clinic_chair', 4, N'Listed-no-query', NULL),
    (N'P-05', N'DASH-05', N'opd.visits_per_physician', N'Visits per Physician', N'Left', N'MetricTile', N'count', N'icon.physician', 5, N'Mapped-full', NULL),
    (N'P-06', N'DASH-05', N'opd.waiting_minutes', N'Waiting Time', N'Right', N'Speedometer', N'min', N'chart.speedometer', 6, N'Workflow-not-implemented', N'0–60 gauge'),
    (N'P-07', N'DASH-05', N'opd.followup_compliance', N'Follow-up Compliance', N'Right', N'RadialGauge', N'%', N'chart.radial_gauge', 7, N'Listed-no-query', NULL),
    (N'P-08', N'DASH-05', N'opd.consultation_minutes', N'Consultation Time', N'Right', N'Radar', N'min', N'chart.radar', 8, N'Listed-no-query', N'Weekday radar; Avg label'),
    (N'P-09', N'DASH-05', N'opd.appointment_performance', N'Appointment Performance', N'Right', N'Donut', N'%', N'chart.donut', 9, N'Mapped-partial', N'On-Time/No-Show/Cancellation'),

    -- DASH-06 ER (mockup 6.png)
    (N'E-01', N'DASH-06', N'er.visits.total', N'Total ER Visits', N'Header', N'FlipCounter', N'count', N'chart.flip_counter', 1, N'Not-in-KPI-doc', NULL),
    (N'E-02', N'DASH-06', N'er.admitted_count', N'Patients Admitted', N'Top', N'FlipCounter', N'count', N'icon.bed', 2, N'Workflow-not-implemented', NULL),
    (N'E-03', N'DASH-06', N'er.discharged_home_count', N'Patients Discharged to Home', N'Top', N'FlipCounter', N'count', N'icon.house', 3, N'Workflow-not-implemented', NULL),
    (N'E-04', N'DASH-06', N'er.referred_out_count', N'Patients Referred to Another Hospital', N'Top', N'FlipCounter', N'count', N'icon.transfer_hospital', 4, N'Workflow-not-implemented', NULL),
    (N'E-05', N'DASH-06', N'er.lwbs_count', N'Left Without Being Seen', N'Top', N'FlipCounter', N'count', N'icon.lwbs', 5, N'Workflow-not-implemented', NULL),
    (N'E-06', N'DASH-06', N'er.door_to_doctor_minutes', N'Door to Doctor Time', N'Bottom', N'MetricTile', N'min', N'icon.er_handshake', 6, N'Workflow-not-implemented', NULL),
    (N'E-07', N'DASH-06', N'er.length_of_stay', N'Length of Stay in ER', N'Bottom', N'MetricTile', N'hours', N'icon.clock', 7, N'Workflow-not-implemented', N'Mockup shows days; unit should be hours'),

    -- DASH-07 Inpatient (mockup 7.png)
    (N'I-01', N'DASH-07', N'inpatient.bed_occupancy_rate', N'Bed Occupancy', N'Top', N'MetricTile', N'%', N'icon.bed', 1, N'Listed-no-query', NULL),
    (N'I-02', N'DASH-07', N'inpatient.alos_days', N'Average Length of Stay', N'Top', N'MetricTile', N'days', N'icon.clock', 2, N'Mapped-full', NULL),
    (N'I-03', N'DASH-07', N'inpatient.bed_turnover', N'Bed Turnover', N'Top', N'MetricTile', N'patients/bed', N'icon.bed', 3, N'Listed-no-query', NULL),
    (N'I-04', N'DASH-07', N'inpatient.admission_cancellation', N'Cancellation Rate', N'Top', N'MetricTile', N'%', N'icon.cancel_x', 4, N'Mapped-partial', N'Admission cancellation'),
    (N'I-05', N'DASH-07', N'inpatient.bed_capacity', N'Bed Capacity', N'Center', N'Thermometer', N'count', N'chart.thermometer', 5, N'Not-in-KPI-doc', N'Used vs available'),
    (N'I-06', N'DASH-07', N'inpatient.readmission_rate', N'Readmission Rate', N'Bottom', N'MetricTile', N'%', N'icon.wheelchair', 6, N'Listed-no-query', NULL),
    (N'I-07', N'DASH-07', N'inpatient.satisfaction', N'Patient Satisfaction Score', N'Bottom', N'StarRating', N'stars', N'chart.star_rating', 7, N'Listed-no-query', NULL),
    (N'I-08', N'DASH-07', N'inpatient.complaint_rate', N'Complaint Rate', N'Bottom', N'RadialGauge', N'%', N'chart.radial_gauge', 8, N'Workflow-not-implemented', NULL),
    (N'I-09', N'DASH-07', N'inpatient.violation_rate', N'Patient Violation Rate', N'Bottom', N'RadialGauge', N'%', N'chart.radial_gauge', 9, N'Workflow-not-implemented', NULL)
) AS s (widget_id, dashboard_id, canonical_kpi_id, display_name, section_name, widget_type, unit_hint, primary_symbol_key, sort_order, mapping_status, mockup_notes)
ON t.widget_id = s.widget_id
WHEN MATCHED THEN UPDATE SET
    dashboard_id = s.dashboard_id, canonical_kpi_id = s.canonical_kpi_id, display_name = s.display_name,
    section_name = s.section_name, widget_type = s.widget_type, unit_hint = s.unit_hint,
    primary_symbol_key = s.primary_symbol_key, sort_order = s.sort_order,
    mapping_status = s.mapping_status, mockup_notes = s.mockup_notes
WHEN NOT MATCHED THEN INSERT
    (widget_id, dashboard_id, canonical_kpi_id, display_name, section_name, widget_type, unit_hint, primary_symbol_key, sort_order, mapping_status, mockup_notes)
VALUES
    (s.widget_id, s.dashboard_id, s.canonical_kpi_id, s.display_name, s.section_name, s.widget_type, s.unit_hint, s.primary_symbol_key, s.sort_order, s.mapping_status, s.mockup_notes);

-- Link each widget to its primary symbol
MERGE meta.WidgetSymbol AS t
USING (
    SELECT widget_id, primary_symbol_key AS symbol_key, N'primary' AS role
    FROM meta.Widget
    WHERE primary_symbol_key IS NOT NULL
) AS s
ON t.widget_id = s.widget_id AND t.symbol_key = s.symbol_key AND t.role = s.role
WHEN NOT MATCHED THEN INSERT (widget_id, symbol_key, role)
VALUES (s.widget_id, s.symbol_key, s.role);

-- Attach hero symbols to each dashboard's first widget as context (optional composition)
MERGE meta.WidgetSymbol AS t
USING (VALUES
    (N'O-01', N'hero.hospital_building', N'hero'),
    (N'C-01', N'hero.anatomy_wireframe', N'hero'),
    (N'R-09', N'hero.or_table', N'hero'),
    (N'CC-01', N'hero.call_globe', N'hero'),
    (N'P-01', N'hero.clinic_waiting', N'hero'),
    (N'E-01', N'hero.ambulance', N'hero'),
    (N'I-05', N'hero.inpatient_bed', N'hero')
) AS s (widget_id, symbol_key, role)
ON t.widget_id = s.widget_id AND t.symbol_key = s.symbol_key AND t.role = s.role
WHEN NOT MATCHED THEN INSERT (widget_id, symbol_key, role)
VALUES (s.widget_id, s.symbol_key, s.role);
