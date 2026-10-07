// CV en français. Chaque phrase est soutenue par ../../../../FACTS.md ou par un README publié, et ne dit
// pas plus que le CV anglais. Les entrées marquées CONFIRM reposent sur la parole de Guilhem : les garder courtes.
// Le CV doit tenir sur une page A4 (python tools/cv_pdf.py échoue sinon) : quand une ligne est ajoutée, une autre doit partir.
// La typographie française (espaces insécables, guillemets, milliers) est appliquée à la fin par frenchTypography.

import { repos } from '../site';
import { frenchTypography } from '../../i18n/typography';
import type { CvContent } from './types';

const fr: CvContent = {
  lang: 'fr',

  meta: {
    title: 'CV : étudiant ingénieur en robotique | Guilhem Carmouze',
    description:
      'CV d’une page de Guilhem Carmouze, étudiant ingénieur en robotique à Toulouse : recherche à l’AIST (Japon), 3D Gaussian Splatting, navigation de robots. PDF.',
  },

  ui: {
    sheetLabel: 'Curriculum vitae de Guilhem Carmouze',
    download: 'Télécharger le PDF',
    print: 'Imprimer',
    pageNote: 'Une page A4.',
    pdfWord: 'PDF',
    sizeUnit: 'Ko',
    code: 'Code',
  },

  header: {
    title: 'Étudiant ingénieur en robotique, vision 3D et navigation',
    location: 'Toulouse, France',
    // CONFIRM dates
    seeking: {
      tag: 'Recherche',
      text: 'Stage de fin d’études de 6 mois, à partir de mars 2027.',
      fields: 'Robotique, vision 3D, navigation autonome, perception robotique, IA.',
    },
  },

  headings: {
    education: 'Formation',
    research: 'Expérience de recherche',
    projects: 'Projets',
    side: 'Projets personnels',
    skills: 'Compétences',
    languages: 'Langues',
    other: 'Autre expérience',
  },

  education: [
    {
      title: 'Diplôme d’ingénieur, Systèmes Robotiques et Interactifs (SRI)',
      when: '2024 à juin 2027',
      org: 'UPSSITECH, école d’ingénieurs de l’Université de Toulouse. Niveau Master. Cinquième et dernière année en 2026-2027.',
    },
    {
      title: 'Cycle préparatoire (CUPGE)',
      when: '2022 à 2024',
      org: 'UPSSITECH, Université de Toulouse',
    },
  ],

  research: [
    {
      title: 'Stagiaire de recherche, Computer Vision Research Team',
      when: 'Avril à août 2026',
      org: 'Artificial Intelligence Research Center (AIRC), AIST, Tsukuba, Japon. Rapport de 29 pages en anglais : « Creation of a 360° Navigation Dataset Using 3D Gaussian Splatting ».',
      bullets: [
        'Développement d’ArtiFixer-360, un pipeline d’une vidéo pinhole à une vidéo 360° : COLMAP, scène de gaussiennes 3DGRUT, rig ancré dans le monde de 14 vues de 110° qui se recouvrent, réparées ensemble par un modèle de diffusion vidéo 14B puis redistillées dans la scène, critères d’acceptation sans référence. +23 602 lignes et 119 tests sur l’ArtiFixer amont de NVIDIA ; nœuds à 4 GPU du cluster ABCI.',
        'Synchronisation tenant compte de la profondeur : −27 % d’erreur de recouvrement de profondeur inter-vues sur les vues réparées (0,0340 à 0,0247), avant distillation. Essai de référence de 117 images : erreur de recalage temporel (MAE, rendus bruts contre sortie) de 0,037 à 0,020. L’essai complet de 154 images a échoué à mes propres critères d’acceptation, d’où une refonte qui part de la géométrie.',
        'Phases précédentes : A* sur grille d’occupation à 5 cm et panoramas de 4096 × 2048 rendus depuis six vues pinhole (simulation DISCOVERSE et MuJoCo) ; interface ROS 2 Humble préparée pour un modèle de navigation visuelle sur le robot Kachaka (sur main, modèle non branché ; aucun essai sur le vrai robot revendiqué).',
        // CONFIRM : repose sur la parole de Guilhem seule. Une ligne courte, formulée en équipe, sans mesure.
        'Participation, avec Alec Bossard, à l’extension de SVLR (training-free visual language robotics, CNRS-AIST JRL) vers la manipulation qui dépend de la mémoire.',
      ],
      note: 'Outils d’IA utilisés pour la recherche, le code et la relecture, comme déclaré dans le rapport ; pas pour lancer les expériences ni produire les résultats.',
      links: [
        { label: 'artifixer-360-pipeline', href: repos['artifixer-360-pipeline'] },
        { label: 'nav_3dgs_pano', href: repos.nav_3dgs_pano },
        { label: 'KachakaNavigation', href: repos.KachakaNavigation },
      ],
    },
  ],

  projects: [
    {
      title: 'Usine 4.0, projet d’équipe de dernière année',
      when: '2026-2027',
      tag: 'En cours',
      org: 'Usine 4.0 (Industrie 4.0, usine connectée), avec ma promotion à l’UPSSITECH.',
    },
    {
      title: 'TLSe Racing, équipe driverless de Formula Student',
      when: '2025-2026',
      bullets: [
        'Ma part : la couche de simulation et d’outillage. Simulateur Pygame 2D avec caméra qui s’ajuste à la piste, chargeur de pistes de cônes CSV typé et modèle de capteur à champ de vision configurable qui sélectionne les cônes visibles.',
        'Aussi : détection de cônes (PyTorch), traitement d’image et commande (ROS, Python, C++). Planificateurs : travail de mes coéquipiers Alec Bossard et TJeanm.',
      ],
      links: [
        { label: 'TLSe_Racing_Driverless', href: repos.TLSe_Racing_Driverless },
        { label: 'PathPlanning', href: repos.PathPlanning },
      ],
    },
    {
      title: 'Projet Fil Rouge, un vrai robot mobile',
      when: '2024-2025',
      org: 'Équipe de six : pilotage des moteurs par Arduino, caméra Raspberry Pi, cartographie LiDAR avec ICP, commandes vocales, suivi de balle.',
      bullets: [
        'Ma part : l’interface web, une application monopage qui pilote le robot par l’API Web Bluetooth ; le flux caméra MJPEG du Raspberry Pi ; l’algorithme qui transforme les coordonnées image de la balle en commandes pour la garder centrée ; le cadencement des commandes vocales découpées.',
        'Le semestre d’avant, avec Alec Bossard : un détecteur de balles de couleur en C11 pur, sans OpenCV.',
      ],
      links: [
        { label: 'PFR2 (dépôt d’équipe)', href: repos.PFR2 },
        { label: 'PFR', href: repos.PFR },
      ],
    },
  ],

  side: {
    note: 'Projets personnels réalisés en octobre 2026 avec l’aide d’une IA ; chaque nombre est reproduit par un script du dépôt.',
    items: [
      { name: 'erpkit', text: 'Boîte à outils NumPy qui mesure ce que coûte l’assemblage de vues en panorama 360°.', href: repos.erpkit },
      { name: 'microsplat', text: '3D Gaussian Splatting en NumPy et PyTorch, un test par équation.', href: repos.microsplat },
      { name: 'gaussian-projection-bench', text: 'Erreur de projection EWA contre unscented, du pinhole à l’équirectangulaire.', href: repos['gaussian-projection-bench'] },
      { name: 'amr-traffic-lab', text: 'Trafic de robots dans une allée d’usine connectée (Usine 4.0, Industrie 4.0).', href: repos['amr-traffic-lab'] },
    ],
  },

  skills: [
    { group: 'Langages', items: 'Python, C, C++, Java (cours), JavaScript et TypeScript' },
    { group: 'Bibliothèques', items: 'PyTorch, NumPy, SciPy, OpenCV' },
    { group: 'Vision 3D', items: '3D Gaussian Splatting (3DGRUT et 3DGUT, Splatfacto, DISCOVERSE), COLMAP, pipelines de diffusion vidéo (ArtiFixer), géométrie panoramique et équirectangulaire' },
    { group: 'Robotique', items: 'ROS 2 Humble, MuJoCo, planification de chemin (A*, grilles d’occupation), API Kachaka (gRPC), cours de cinématique des robots (modèle DH et jacobiennes d’un UR3 à 6 DDL)' },
    { group: 'Outils', items: 'Docker, Singularity, PBS sur un cluster HPC (ABCI), Git, Linux, pytest' },
  ],

  languages: [
    { name: 'Français', level: 'langue maternelle' },
    { name: 'Anglais', level: 'professionnel ; stage de recherche de 4 mois au Japon, en anglais' },
    { name: 'Espagnol', level: 'notions' },
  ],

  other: [
    {
      title: 'Assistant administratif',
      when: '2022 à 2024',
      org: 'ALTINET, Tarbes',
    },
  ],
};

export default frenchTypography(fr);
