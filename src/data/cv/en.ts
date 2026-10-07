// English CV. Every sentence is supported by ../../../../FACTS.md or by a published README.
// Entries tagged CONFIRM rest on Guilhem's word only: keep them short and edit them here.
// A French file (cv/fr.ts) with the same shape switches /fr/cv/ and the French PDF on.
// The CV has to fit one A4 page (python tools/cv_pdf.py fails when it does not): when a line
// is added, another has to go.

import { repos } from '../site';
import type { CvContent } from './types';

const en: CvContent = {
  lang: 'en',

  meta: {
    title: 'CV: robotics engineering student | Guilhem Carmouze',
    description:
      'One-page CV of Guilhem Carmouze, final-year robotics engineering student in Toulouse: research at AIST (Japan), 3D Gaussian Splatting, robot navigation. PDF.',
  },

  ui: {
    sheetLabel: 'Curriculum vitae of Guilhem Carmouze',
    download: 'Download PDF',
    print: 'Print',
    pageNote: 'One A4 page.',
    pdfWord: 'PDF',
    sizeUnit: 'KB',
    code: 'Code',
  },

  header: {
    title: 'Robotics engineering student, 3D vision and navigation',
    location: 'Toulouse, France',
    // CONFIRM dates
    seeking: {
      tag: 'Seeking',
      text: '6-month end-of-studies internship, from March 2027.',
      fields: 'Robotics, 3D vision, autonomous navigation, robot perception, AI.',
    },
  },

  headings: {
    education: 'Education',
    research: 'Research experience',
    projects: 'Projects',
    side: 'Side projects',
    skills: 'Skills',
    languages: 'Languages',
    other: 'Other experience',
  },

  education: [
    {
      title: 'Diplôme d’ingénieur, Robotic and Interactive Systems (SRI)',
      when: '2024 to June 2027',
      org: 'UPSSITECH, engineering school of the University of Toulouse. French engineering degree, Master’s level. Fifth and final year in 2026 to 2027.',
    },
    {
      title: 'Preparatory cycle (CUPGE)',
      when: '2022 to 2024',
      org: 'UPSSITECH, University of Toulouse',
    },
  ],

  research: [
    {
      title: 'Research intern, Computer Vision Research Team',
      when: 'April to August 2026',
      org: 'Artificial Intelligence Research Center (AIRC), AIST, Tsukuba, Japan. 29-page report in English: “Creation of a 360° Navigation Dataset Using 3D Gaussian Splatting”.',
      bullets: [
        'Built ArtiFixer-360, a pipeline from a plain pinhole video to a 360° video: COLMAP, a 3DGRUT Gaussian scene, a world-locked rig of 14 overlapping 110° views repaired jointly by a 14B video diffusion model, then distilled back into the scene, with reference-free quality gates. +23,602 lines and 119 tests over NVIDIA’s upstream ArtiFixer; runs on 4-GPU nodes of the ABCI cluster.',
        'Depth-aware synchronisation lowered the cross-view depth-overlap error of the repaired views by 27% (0.0340 to 0.0247) before distillation. On a 117-frame reference run the temporal warp error (MAE, raw renders against output) fell from 0.037 to 0.020. The full 154-frame run failed my own acceptance gates and led to a geometry-first redesign.',
        'Earlier phases: A* on a 5 cm occupancy grid and 4096 × 2048 panoramas rendered from six pinhole views, logged with position and heading, in a DISCOVERSE and MuJoCo simulation; a ROS 2 Humble interface prepared for a visual navigation model on the Kachaka robot (on main the model is not wired in; no run on the real robot is claimed).',
        // CONFIRM: rests on Guilhem's word only. One short, team-framed line, no metric.
        'Also took part, with Alec Bossard, in extending SVLR (training-free visual language robotics, CNRS-AIST JRL) towards memory-dependent manipulation.',
      ],
      note: 'AI tools were used for research, code and spell-checking, as declared in the report; not for running experiments or producing results.',
      links: [
        { label: 'artifixer-360-pipeline', href: repos['artifixer-360-pipeline'] },
        { label: 'nav_3dgs_pano', href: repos.nav_3dgs_pano },
        { label: 'KachakaNavigation', href: repos.KachakaNavigation },
      ],
    },
  ],

  projects: [
    {
      title: 'Usine 4.0, final-year team project',
      when: '2026 to 2027',
      tag: 'In progress',
      org: 'Industry 4.0 smart factory (Usine 4.0), with my class at UPSSITECH.',
    },
    {
      title: 'TLSe Racing, Formula Student driverless team',
      when: '2025 to 2026',
      bullets: [
        'My part: the simulation and tooling layer. A 2D Pygame simulator with a fit-to-track camera, a typed CSV cone-track loader and a configurable field-of-view sensor model that selects the visible cones.',
        'Also worked on cone-detection models (PyTorch) and on image-processing and control modules (ROS, Python, C++). The planners are my teammates’ work: Alec Bossard and TJeanm.',
      ],
      links: [
        { label: 'TLSe_Racing_Driverless', href: repos.TLSe_Racing_Driverless },
        { label: 'PathPlanning', href: repos.PathPlanning },
      ],
    },
    {
      title: 'Projet Fil Rouge, a real mobile robot',
      when: '2024 to 2025',
      org: 'Team of six: Arduino motor control, Raspberry Pi camera, LiDAR mapping with ICP, voice commands, ball tracking.',
      bullets: [
        'My part: the web interface, a single-page app that drives the robot over the Web Bluetooth API; the Raspberry Pi MJPEG camera stream; the algorithm that turns the ball’s image coordinates into drive commands to keep it centred; the timing of split voice commands.',
        'The semester before, with Alec Bossard: a colour-ball detector in pure C11, without OpenCV.',
      ],
      links: [
        { label: 'PFR2 (team repository)', href: repos.PFR2 },
        { label: 'PFR', href: repos.PFR },
      ],
    },
  ],

  side: {
    note: 'Personal projects built in October 2026 with AI assistance; every number is reproduced by a script in the repository.',
    items: [
      { name: 'erpkit', text: 'NumPy toolkit measuring what stitching views into a 360° panorama costs.', href: repos.erpkit },
      { name: 'microsplat', text: '3D Gaussian Splatting in NumPy and PyTorch, one test per equation.', href: repos.microsplat },
      { name: 'gaussian-projection-bench', text: 'EWA against unscented projection error, pinhole to equirectangular.', href: repos['gaussian-projection-bench'] },
      { name: 'amr-traffic-lab', text: 'Robot traffic in an Industry 4.0 smart-factory (Usine 4.0) aisle.', href: repos['amr-traffic-lab'] },
    ],
  },

  skills: [
    { group: 'Languages', items: 'Python, C, C++, Java (coursework), JavaScript and TypeScript' },
    { group: 'Libraries', items: 'PyTorch, NumPy, SciPy, OpenCV' },
    { group: '3D vision', items: '3D Gaussian Splatting (3DGRUT and 3DGUT, Splatfacto, DISCOVERSE), COLMAP, video diffusion pipelines (ArtiFixer), panoramic and equirectangular geometry' },
    { group: 'Robotics', items: 'ROS 2 Humble, MuJoCo, path planning (A*, occupancy grids), Kachaka API (gRPC), robot kinematics coursework (DH model and Jacobians of a 6-DOF UR3)' },
    { group: 'Tools', items: 'Docker, Singularity, PBS on an HPC cluster (ABCI), Git, Linux, pytest' },
  ],

  languages: [
    { name: 'French', level: 'native' },
    { name: 'English', level: 'professional; 4-month research internship in Japan, in English' },
    { name: 'Spanish', level: 'basic' },
  ],

  other: [
    {
      title: 'Administrative assistant',
      when: '2022 to 2024',
      org: 'ALTINET, Tarbes',
    },
  ],
};

export default en;
