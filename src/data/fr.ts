// Texte français. Même forme que en.ts, et chaque phrase est soutenue par FACTS.md ou par un README publié :
// aucune phrase ne dit plus que son équivalent anglais.
// Les champs marqués CONFIRM reposent sur la parole de Guilhem ou sur une hypothèse : les garder courts.
//
// Écrit en français d’ingénieur : première personne, phrases courtes, pas de vouvoiement (les consignes
// d’interface sont à l’infinitif). Les termes techniques établis restent en anglais (3D Gaussian Splatting,
// pipeline, rig, ROS 2, floaters), glosés une fois quand c’est utile. Le reste est traduit : essai (run), graine (seed),
// pas de temps (tick), banc d’essai (benchmark), critères d’acceptation (quality gates), poursuite pure (pure pursuit). Décimales à la virgule.
// La typographie (espaces insécables avant : ; ? ! %, guillemets, séparateur de milliers) est appliquée
// à la fin par frenchTypography : ici, des espaces ordinaires suffisent.

import { frenchTypography } from '../i18n/typography';
import type { SiteContent } from './types';

const fr: SiteContent = {
  lang: 'fr',
  locale: 'fr-FR',

  meta: {
    homeTitle: 'Guilhem Carmouze | Robotique et 3D Gaussian Splatting',
    homeDescription:
      'Étudiant ingénieur en robotique en dernière année à Toulouse, stagiaire à l’AIST (Japon) en 2026 : 3D Gaussian Splatting, navigation de robots, Usine 4.0.',
    labTitle: 'Labo : projets personnels | Guilhem Carmouze',
    labDescription:
      'Quatre projets personnels : géométrie d’images 360°, 3D Gaussian Splatting, erreur de projection, et trafic de robots dans une usine connectée (Usine 4.0).',
    ogAlt: 'Le nom Guilhem Carmouze sur un bâtiment fait de splats gaussiens, dessiné comme un plan technique (blueprint), avec un chemin rouge planifié qui traverse une porte',
  },

  ui: {
    skipToContent: 'Aller au contenu',
    nav: {
      label: 'Principale',
      home: 'Guilhem Carmouze, accueil',
      work: 'Projets',
      lab: 'Labo',
      cv: 'CV',
      github: 'GitHub',
      switchTo: 'EN',
      switchLabel: 'English version',
    },
    readCase: 'Lire l’étude de cas',
    caseSoon: 'Étude de cas',
    backToRun: 'Retour au parcours',
    code: 'Code',
    report: 'Rapport (PDF)',
    video: 'Vidéo',
    repository: 'Dépôt',
    repositoryLabel: 'Dépôt :',
    external: 'ouvre un autre site',
    caseLabels: {
      role: 'Rôle',
      team: 'Équipe',
      period: 'Période',
      organisation: 'Organisation',
      stack: 'Technologies',
      summary: 'En trois lignes',
      problem: 'Problème',
      built: 'Ce que j’ai réalisé',
      result: 'Résultat',
      context: 'Contexte',
      builtTitle: 'Ce que j’ai réalisé',
      results: 'Résultats',
      failed: 'Ce qui a échoué ou reste inachevé',
      credits: 'Crédits',
      links: 'Liens',
      next: 'Projet suivant',
      nextLab: 'Labo : projets personnels',
    },
    footer: {
      rights: 'Guilhem Carmouze, Toulouse, France.',
      built: 'Le monde de la page d’accueil est généré dans le navigateur : des gaussiennes 3D procédurales, une grille d’occupation découpée dedans, un chemin A*.',
      contact: 'Me contacter',
    },
  },

  person: {
    line: 'Étudiant ingénieur en robotique, en dernière année à l’UPSSITECH, à Toulouse. Stagiaire de recherche à l’AIST, au Japon, en 2026. Je travaille sur le 3D Gaussian Splatting, la vision 360° et la navigation de robots.',
    school: 'UPSSITECH, école d’ingénieurs de l’Université de Toulouse. Cursus Systèmes Robotiques et Interactifs (SRI). Diplôme prévu en juin 2027.',
    city: 'Toulouse, France',
    languages: 'Français (langue maternelle), anglais (professionnel), espagnol (notions)',
  },

  // CONFIRM dates
  seeking: {
    tag: 'Je recherche',
    short: 'un stage de fin d’études de 6 mois, à partir de mars 2027',
    long: 'Je recherche un stage de fin d’études de 6 mois, à partir de mars 2027.',
    fields: 'Robotique, vision 3D, navigation autonome, perception robotique, IA.',
  },

  home: {
    heroLinks: { cv: 'CV', github: 'GitHub', linkedin: 'LinkedIn', email: 'E-mail', skip: 'Passer le parcours : index des projets' },
    cue: { scroll: 'Faire défiler pour avancer', swipe: 'Glisser vers le haut pour avancer', start: 'Commencer le parcours' },
    posterAlt: 'Un bâtiment fait de splats gaussiens, dessiné comme un plan technique (blueprint), avec un chemin rouge planifié qui traverse une porte',
    start3d: 'Lancer le parcours 3D',

    run: {
      intro: {
        building: 'Construction de la scène',
        training: 'Entraînement',
        slicing: 'Découpe de la grille d’occupation',
        planning: 'Planification avec A*',
        iterations: '/ 30 000 itérations',
        gaussians: 'Gaussiennes',
        residual: 'Résidu',
        grid: 'Grille d’occupation',
        path: 'Chemin A*',
        pending: 'en attente',
        cells: 'cellules de 10 cm',
        skip: 'Passer l’intro : défiler, cliquer ou appuyer sur une touche',
      },
      hud: {
        label: 'Instruments du parcours',
        waypoint: 'Étape',
        pose: 'Pose',
        run: 'Parcours',
        gaussians: 'Gaussiennes',
        mapAlt: 'Grille d’occupation du bâtiment avec le chemin planifié et la position actuelle',
        jump: 'Aller à une étape',
        planView: 'Vue en plan',
      },
      zones: { lobby: 'Hall', vestibule: 'Vestibule', aist: 'Salle AIST', track: 'Piste de cônes', factory: 'Halle d’usine', pen: 'Enclos Fil Rouge' },
      view: { prefix: 'Vue :', colour: 'couleur', depth: 'profondeur', ellipsoids: 'ellipsoïdes' },
      lens: { depth: 'Loupe : profondeur (L)', ellipsoids: 'Loupe : ellipsoïdes bruts (L)' },
      bearing: 'Direction de la balle',
      perf: {
        title: 'Performances',
        frame: 'Image',
        gpu: 'Temps GPU',
        scale: 'Échelle de rendu',
        level: 'niveau',
        splats: 'Gaussiennes dessinées',
        sort: 'Tri en profondeur',
        long: 'Dernière image longue',
        device: 'GPU',
        none: 'aucune',
        auto: 'Auto',
        script: 'script',
        browser: 'navigateur',
      },
    },

    waypoints: {
      hero: 'Départ',
      aist: 'AIST, données 360°',
      tlse: 'TLSe Racing',
      usine: 'Usine 4.0',
      pfr: 'Projet Fil Rouge',
      lab: 'Labo',
      work: 'Index des projets',
      contact: 'Contact',
    },

    aist: {
      kicker: 'Stage de recherche, AIST, Tsukuba, Japon. D’avril à août 2026.',
      title: 'Création d’un jeu de données de navigation à 360° avec le 3D Gaussian Splatting',
      host: 'Computer Vision Research Team (équipe de vision par ordinateur), Artificial Intelligence Research Center, AIST (National Institute of Advanced Industrial Science and Technology).',
      giant: '360°',
      stageTitle: 'La caméra source ne voit qu’environ 12 % de la sphère par pose.',
      text: [
        'Un modèle de navigation visuelle a besoin d’observations à 360°. Une scène reconstruite à partir d’une simple vidéo ne contient que ce que la caméra a vu : rendu en panorama complet, le reste ressort en floaters (artefacts flottants) et en aiguilles.',
        'ArtiFixer-360, mon extension de l’ArtiFixer de NVIDIA, répare les vues ensemble avec un modèle de diffusion vidéo, puis les distille dans la scène 3D.',
        'L’essai complet de 154 images a échoué à mes propres critères d’acceptation, ce qui a mené à une refonte qui part de la géométrie.',
      ],
      rawLabel: 'Rendu 3DGRUT brut',
      fixedLabel: 'Après ArtiFixer3D+',
      caption: 'Sortie réelle d’un premier essai sur un clip de 154 images. Aucun verdict d’acceptation n’est enregistré pour lui.',
      stillAlt: 'Panorama à 360° d’un salon. À gauche du séparateur : rendu 3DGRUT brut plein de floaters et d’aiguilles. À droite : la sortie réparée.',
      slider: 'Position du séparateur entre le panorama brut et le panorama réparé',
      roomNote: 'La salle autour de vous est construite à partir de ce panorama.',
      figures: {
        rig: {
          value: '14',
          meaning: 'vues de 110° qui se recouvrent, par pose, dans un rig qui suit la trajectoire réelle de la caméra, réparées ensemble par le modèle de diffusion vidéo 14B de NVIDIA.',
        },
        depth: {
          value: '−27 %',
          meaning: 'd’erreur de profondeur entre vues, sur les vues réparées (MAE de 0,0340 à 0,0247), avec la synchronisation tenant compte de la profondeur, avant la distillation. Le gain n’a pas clairement survécu à la distillation.',
        },
      },
    },

    // CONFIRM : repose sur la parole de Guilhem seule. Une entrée courte, formulée en équipe. Aucune mesure.
    svlr: {
      title: 'SVLR, avec Alec Bossard',
      text: 'À l’AIST, j’ai aussi participé, avec mon camarade de promotion Alec Bossard, à l’extension de SVLR (Scalable, Training-Free Visual Language Robotics ; Samson, Muraccioli, Kanehiro, CNRS-AIST JRL) vers la manipulation qui dépend de la mémoire.',
      link: 'Les résultats sont dans le rapport technique d’Alec',
    },

    tlse: {
      kicker: 'TLSe Racing, équipe driverless de Formula Student. 2025-2026.',
      title: 'La couche de simulation d’une voiture de course driverless',
      marquee: 'Formula Student driverless',
      mine: 'Ma part est la couche de simulation et d’outillage : un simulateur Pygame 2D avec une caméra qui s’ajuste à la piste, un chargeur de pistes de cônes en CSV typé, une voiture à l’échelle Formula Student et un modèle de capteur à champ de vision configurable qui sélectionne les cônes visibles.',
      team: 'Les planificateurs sont le travail de mes coéquipiers : Alec Bossard (ligne centrale par milieux, B-spline, premier contrôleur réactif) et TJeanm (RRT*, lissage).',
      also: 'J’ai aussi travaillé sur des modèles de détection de cônes en PyTorch et sur des modules de traitement d’image et de commande avec ROS, Python et C++.',
      demo: 'Essayer le modèle de capteur : régler la portée et l’ouverture, les cônes sélectionnés s’allument.',
      range: 'Portée',
      opening: 'Ouverture',
      selected: 'cônes sélectionnés',
    },

    // CONFIRM : rien d’autre n’est connu. Ne pas ajouter de partenaire, de plateforme, de robot ni de résultat.
    usine: {
      kicker: 'Projet d’équipe de dernière année. 2026-2027.',
      title: 'Usine 4.0',
      status: 'En cours',
      text: 'Cette année, ma promotion mène un projet d’équipe sur l’Usine 4.0 (Industrie 4.0, usine connectée), l’un des secteurs que vise la formation SRI. Il est en cours : il n’y a encore rien à montrer.',
      note: 'Le hall, ses postes de travail et ses robots mobiles sont une illustration générée dans le navigateur, pas des images du projet.',
    },

    pfr: {
      kicker: 'Projet Fil Rouge. Première année du cycle ingénieur, 2024-2025.',
      title: 'Un vrai robot, piloté depuis une page web',
      mine: 'En équipe de six, nous avons construit un robot mobile : pilotage des moteurs par Arduino, caméra Raspberry Pi, cartographie LiDAR, commandes vocales, suivi de balle. Ma part était l’interface web : une application monopage qui pilote le robot par l’API Web Bluetooth (un rechargement de page couperait la liaison), le flux caméra MJPEG en direct, et l’algorithme qui transforme les coordonnées image de la balle en commandes de conduite pour la garder centrée.',
      team: 'La cartographie, la reconnaissance vocale, le pilotage des moteurs et le traitement d’image ont été faits par mes coéquipiers Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard et Fairouz Ijerdaoun.',
      before: 'Le semestre d’avant, avec Alec Bossard : un détecteur de balles de couleur en C11 pur, sans OpenCV.',
      feedWall: 'Sur le mur :',
      feed: 'Flux caméra du vrai robot, avec les balles suivies. Enregistrement de démonstration de l’équipe.',
      hmi: 'L’interface web sur un téléphone, qui pilote le vrai robot. Enregistrement de démonstration de l’équipe.',
      demo: 'Déplacer le pointeur sur l’enclos : la balle le suit et le robot la garde centrée.',
      robotAlt: 'Le robot à quatre roues de l’équipe dans son arène de test, à côté de son scan LiDAR en direct et de la carte construite à partir de ce scan',
    },

    lab: {
      title: 'Labo : projets personnels',
      text: 'Quatre projets personnels qui prolongent des thèmes du travail ci-dessus. Réalisés en octobre 2026 avec l’aide d’une IA ; chaque chiffre est reproduit par un script de son dépôt.',
      more: 'Ouvrir le labo',
    },

    index: {
      title: 'Index des projets',
      text: 'Le parcours, sans le trajet.',
      room: 'Voir dans le parcours',
      rows: {
        'aist-360-navigation': {
          when: '2026',
          name: 'Stage de recherche à l’AIST',
          line: 'Des données de navigation à 360° à partir du 3D Gaussian Splatting : A* et panoramas en simulation, puis un pipeline de réparation par diffusion vidéo, présenté avec l’essai qui a échoué.',
        },
        'tlse-racing-driverless': {
          when: '2025-2026',
          name: 'TLSe Racing driverless',
          line: 'La couche de simulation et d’outillage d’une équipe Formula Student driverless : simulateur 2D, chargeur de pistes de cônes, modèle de capteur à champ de vision.',
        },
        'projet-fil-rouge': {
          when: '2024-2025',
          name: 'Projet Fil Rouge',
          line: 'Un vrai robot mobile construit par une équipe de six. Ma part : l’interface Web Bluetooth, le flux caméra et la commande de centrage de la balle.',
        },
        'usine-4-0': {
          when: '2026-2027',
          name: 'Usine 4.0',
          line: 'Projet d’équipe de dernière année sur l’Usine 4.0 (Industrie 4.0, usine connectée). En cours.',
        },
      },
    },

    contact: { title: 'Fin du parcours.' },
  },

  // ------------------------------------------------------------------ études de cas
  work: {
    'aist-360-navigation': {
      metaTitle: 'Navigation 360° et 3D Gaussian Splatting | Guilhem Carmouze',
      metaDescription:
        'Stage de recherche à l’AIST (Japon) : observations à 360° pour la navigation de robots, à partir de scènes en 3D Gaussian Splatting, avec ses résultats négatifs.',
      kicker: 'Stage de recherche, AIST, Tsukuba, Japon. D’avril à août 2026.',
      title: 'Création d’un jeu de données de navigation à 360° avec le 3D Gaussian Splatting',
      outcome:
        'Quatre mois de recherche, d’un planificateur A* et de panoramas à six vues en simulation jusqu’à ArtiFixer-360, un pipeline qui transforme une simple vidéo pinhole en vidéo 360°, présenté avec l’essai qui a satisfait ses critères d’acceptation et celui qui ne les a pas satisfaits.',
      window: { word: '360°', media: 'panoRepaired' },
      meta: {
        role: 'Stagiaire de recherche, en quatrième année. Auteur de nav_3dgs_pano et de KachakaNavigation, et de l’extension 360° d’artifixer-360-pipeline, un dérivé de l’ArtiFixer de NVIDIA.',
        team: 'Computer Vision Research Team, Artificial Intelligence Research Center (AIRC)',
        period: 'Du 15 avril au 21 août 2026',
        organisation: 'AIST, National Institute of Advanced Industrial Science and Technology, Tsukuba, Japon',
        stack: 'Python, PyTorch, 3DGRUT, Splatfacto, COLMAP, DISCOVERSE, MuJoCo, ArtiFixer (diffusion vidéo), ROS 2 Humble, PBS et Singularity sur le cluster ABCI, pytest',
      },
      lead: {
        kind: 'compare',
        before: 'panoRaw',
        after: 'panoRepaired',
        beforeLabel: 'Rendu 3DGRUT brut',
        afterLabel: 'Après le premier passage d’ArtiFixer3D+',
        alt: 'Panorama équirectangulaire à 360° d’un salon, montré deux fois. Rendu brut : floaters, aiguilles et trous partout où la caméra n’a jamais regardé. Réparé : la même vue, dont la plupart ont disparu.',
        caption:
          'Une image du rendu 3DGRUT brut de la scène reconstruite, projeté en panorama équirectangulaire, et la même image après le premier passage d’ArtiFixer3D+ sur ce clip de 154 images. La plupart des trous et du bruit de splatting disparaissent ; des déformations résiduelles et des structures dupliquées restent, et les zones que la caméra n’a jamais vues sont générées, pas observées. Ce premier essai n’est ni l’essai de référence de 117 images, qui a satisfait les critères d’acceptation, ni l’essai ultérieur, qui ne les a pas satisfaits.',
        slider: 'Position du séparateur entre le panorama brut et le panorama réparé',
      },
      summary: {
        problem:
          'Un modèle de navigation visuelle a besoin d’observations à 360° avec poses et commandes. Une scène reconstruite à partir d’une simple vidéo ne contient que ce que la caméra a vu : environ 12 % de la sphère par pose.',
        built:
          'Une simulation qui planifie, conduit et rend des panoramas de 4096 × 2048 dans une scène de gaussiennes 3D ; une interface ROS 2 préparée pour le robot Kachaka ; et ArtiFixer-360, qui répare conjointement 14 vues qui se recouvrent avec un modèle de diffusion vidéo, puis les redistille dans la scène 3D.',
        result:
          'La synchronisation tenant compte de la profondeur a réduit l’erreur de profondeur entre vues de 27 % avant la distillation, et un essai de référence de 117 images a satisfait ses critères d’acceptation. L’essai complet de 154 images, lui, ne les a pas satisfaits, ce qui a mené à une refonte qui part de la géométrie.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'D’avril à août 2026, en quatrième année, j’étais stagiaire de recherche dans la Computer Vision Research Team de l’Artificial Intelligence Research Center (AIRC) de l’AIST, à Tsukuba, au Japon. Le stage s’est déroulé en anglais et se termine par un rapport de 29 pages.',
            'L’objectif : produire des observations équirectangulaires (ERP) à 360°, avec poses et commandes, pour la navigation visuelle de robots, à partir de scènes représentées en 3D Gaussian Splatting (3DGS).',
            'La difficulté, c’est la couverture. ArtiFixer, le modèle de réparation, a été entraîné sur de la vidéo pinhole. Un panorama demande la sphère entière, alors que la caméra source utilisée pendant le développement n’en voit que 12,06 % à une pose (un champ de vision de 93,72° × 60,93°). Tout le reste doit être rendu à partir de gaussiennes qui n’ont jamais été observées depuis cet endroit.',
          ],
        },
        {
          kind: 'media',
          media: 'aistOutput',
          alt: 'Un panorama équirectangulaire de l’intérieur d’une maison : couloir, miroir, portes et parquet, déformés par la projection.',
          caption: 'Sortie : une image de la vidéo équirectangulaire à 360°. L’entrée est une simple vidéo pinhole ; elle vient d’un tiers et n’est pas montrée ici.',
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'Phase 1, mai',
              title: 'Navigation et rendu panoramique dans une scène 3DGS fournie',
              body: 'Une simulation DISCOVERSE et MuJoCo : une grille d’occupation à 5 cm, de la planification A* et du suivi de points de passage. À chaque point de passage, six vues pinhole co-localisées sont reprojetées en un panorama équirectangulaire de 4096 × 2048, avec une cubemap personnalisée à faces qui se recouvrent (faces de 96°) et un fondu progressif (feathering). Chaque panorama est enregistré avec sa position et son cap ; les commandes de vitesse sont enregistrées par le script de navigation, qui ne rend aucun panorama.',
              note: 'Simulation uniquement : la pose est la vérité terrain du simulateur, la base est déplacée de façon cinématique et la scène était fournie sous forme de fichier .ply. Aucun entraînement 3DGS n’a lieu dans ce dépôt.',
              repo: 'nav_3dgs_pano',
              repoNote: 'environ 4 000 lignes de Python, seul auteur',
            },
            {
              tag: 'Phase 2, mai',
              title: 'Construire la scène à partir d’une simple vidéo',
              body: 'Une base de référence COLMAP et Splatfacto, mesurée sur une répartition 70/30 à un PSNR de 26,08 dB et un SSIM de 0,91 après 30 000 itérations, puis 28,69 dB et 0,94 après 60 000.',
            },
            {
              tag: 'Phase 3, juin',
              title: 'Reconstruction contre génération de monde, et une interface robot',
              body: 'J’ai comparé Matrix-3D, HY-World 2.0 et ExploreGS avec des critères orientés navigation : couverture à 360°, rayon utile et MEt3R p90. En parallèle, j’ai préparé une interface de déploiement ROS 2 Humble pour un modèle de navigation visuelle (NoMaD) sur le robot mobile Kachaka : quatre nœuds (relais d’image, modèle, émetteur de commandes, exécuteur robot), rejet des images périmées à 0,5 s, une limitation de vitesse à 0,2 m/s et 0,5 rad/s, une surveillance « homme mort » à 20 Hz (dead-man timer), un mode à blanc (dry-run) et une surcouche typée (wrapper) autour de kachaka-api (gRPC).',
              note: 'Sur main, l’inférence de NoMaD n’est pas branchée, et aucun essai de navigation complet sur le vrai Kachaka n’est revendiqué.',
              repo: 'KachakaNavigation',
              repoNote: 'environ 3 600 lignes plus les tests',
            },
            {
              tag: 'Phase 4, juillet',
              title: 'Réparer des rendus incomplets',
              body: 'J’ai appliqué NVIDIA ArtiFixer, un modèle de diffusion vidéo, à des panoramas et diagnostiqué pourquoi ils se cassent : la caméra source voit environ 12 % de la sphère par pose, et réparer les faces du cube indépendamment a fait passer le taux d’échec des coutures de 0,34 à 0,83.',
            },
            {
              tag: 'Phase 5, août',
              title: 'Le pipeline ArtiFixer-360',
              body: 'Vidéo pinhole, COLMAP, une scène de gaussiennes 3DGRUT, puis un rig ancré dans le monde de 14 vues de 110° qui se recouvrent et suit la trajectoire réelle de la caméra. Les 14 flux sont réparés ensemble par le modèle de diffusion vidéo 14B, synchronisés pendant le débruitage par un graphe de reprojection qui tient compte de la profondeur et des occlusions, redistillés dans la scène 3D avec la géométrie verrouillée, puis rendus en vidéo équirectangulaire à 360°.',
              note: 'Un dérivé de nv-tlabs/ArtiFixer de NVIDIA, sous licence Apache-2.0.',
              repo: 'artifixer-360-pipeline',
              repoNote: 'mon delta par rapport à l’amont : +23 602 / −630 lignes, 121 nouveaux fichiers',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'ArtiFixer-360, d’une simple vidéo à une vidéo 360°',
          legend: { mine: 'Ajouté ou étendu dans mon dépôt', upstream: 'Entrée, sortie et composants amont' },
          loopLabel: 'Rendre, réparer, distiller : les vues réparées retournent dans la scène partagée',
          caption:
            'La préparation COLMAP et la scène 3DGRUT viennent de l’ArtiFixer amont, et le modèle de diffusion 14B est celui de NVIDIA. Le rig, la boucle conjointe à 14 flux, le graphe de reprojection, les réglages de distillation, l’assembleur panoramique et les critères d’acceptation ont été ajoutés ou étendus pendant le stage.',
          nodes: [
            { label: 'Vidéo pinhole', mine: false },
            { label: 'Poses COLMAP', mine: false },
            { label: 'Scène de gaussiennes 3D partagée', detail: '3DGRUT', mine: false },
            { label: 'Rig ancré dans le monde', detail: '14 vues, champ de vision de 110°, centres de caméra réels', mine: true, loop: true },
            { label: 'Réparation conjointe', detail: '14 flux, fenêtres de 77 images, synchronisés par un graphe de reprojection qui tient compte de la profondeur et des occlusions', mine: true, loop: true },
            { label: 'Distillation à géométrie verrouillée', detail: 'de retour dans la scène 3D', mine: true, loop: true },
            { label: 'Assemblage frustum vers ERP', detail: 'des rendus finaux', mine: true },
            { label: 'Vidéo ERP à 360°', mine: false },
            { label: 'Critères d’acceptation sans référence', detail: 'décident si un essai est publié', mine: true },
          ],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '14',
              meaning: 'vues de 110° qui se recouvrent par pose : six sur l’horizon, quatre inclinées de 45° vers le haut et quatre vers le bas. Elles partagent le centre de la caméra réelle, donc deux vues diffèrent d’une rotation pure.',
            },
          ],
        },
        {
          kind: 'media',
          media: 'aistRigCoverage',
          wide: true,
          alt: 'Deux cartes équirectangulaires. À gauche : le nombre de vues du rig qui couvrent chaque direction, de 2 à 5, avec le petit champ de vision de la caméra source cerné en jaune au centre. À droite : laquelle des 14 vues possède chaque direction lors de l’assemblage.',
          caption:
            'Couverture de la sphère par le rig de 14 vues, recalculée par un script du dépôt : chaque direction est vue par au moins 2 et au plus 5 vues, 3,27 en moyenne. Le contour jaune est ce que voit la caméra source à une pose : 12,06 % de la sphère.',
        },
        {
          kind: 'text',
          title: 'Ce qu’il y a autour du modèle',
          body: [
            'Mon delta par rapport au code NVIDIA amont est de +23 602 / −630 lignes sur 145 fichiers (121 nouveaux, 24 modifiés), dont 32 nouveaux modules de test (119 tests). Il couvre les générateurs de trajectoire et de rig, la boucle d’inférence multi-vues conjointe, les réglages de distillation, l’assembleur frustum vers panorama, et des tâches PBS et Singularity pour les nœuds à 4 GPU du cluster ABCI. Un patch complémentaire pour 3DGRUT-ArtiFixer de NVIDIA ajoute +506 / −74 lignes.',
            'Comme il n’existe pas de panorama de vérité terrain, un essai est jugé par des critères d’acceptation sans référence : recouvrement de profondeur entre vues, recalage temporel par flot optique (temporal warp), rapport de couture au bouclage du panorama (wrap-seam), conservation des contours, et un audit bit à bit qui vérifie que la géométrie verrouillée n’a pas bougé.',
          ],
        },
      ],

      results: [
        {
          kind: 'figures',
          items: [
            {
              value: '−27 %',
              meaning: 'MAE de recouvrement de profondeur entre vues, sur les vues réparées, sans puis avec la synchronisation tenant compte de la profondeur : 0,0340 à 0,0247. Mesuré avant la distillation, sur les pseudo-vues réparées.',
            },
            {
              from: '0,037',
              value: '0,020',
              meaning: 'MAE de recalage temporel par flot optique, rendus bruts contre sortie, sur l’essai de référence de 117 images : 14 vues, 1 638 rendus, environ 20 minutes de temps d’exécution sur un nœud à 4 GPU.',
            },
          ],
        },
        {
          kind: 'table',
          caption: 'Les valeurs viennent d’essais sur GPU faits pendant le stage et sont retranscrites dans le dépôt à partir de ses enregistrements datés. Plus la valeur est basse, mieux c’est, sauf pour le PSNR, le SSIM et l’intensité des contours.',
          head: ['Ce qui a été mesuré', 'Valeur', 'Comment le lire'],
          rows: [
            ['MAE de recouvrement de profondeur entre vues des vues réparées, avant distillation, sans puis avec la synchronisation tenant compte de la profondeur', '0,0340 → 0,0247', 'Positif, de portée limitée : mesuré sur les vues réparées, pas sur le panorama final.'],
            ['Le même changement après distillation, sur le panorama final : MAE de recalage temporel, premier essai contre la variante profondeur et boucle', '0,0233 contre 0,0258', 'Négatif : le gain n’a pas clairement survécu à la distillation.'],
            ['Essai de référence de 117 images : MAE de recalage temporel, rendus bruts vers sortie', '0,037 → 0,020', 'Positif, avec une réserve : tout lissage fait baisser cette métrique, elle se lit donc avec la conservation des contours.'],
            ['Même essai : intensité des contours conservée dans les zones à forte confiance (1 = entièrement conservée)', '0,49 en médiane', 'Une partie de la stabilité vient avec des détails plus flous.'],
            ['Base de référence avant le pipeline : vidéo, COLMAP, Splatfacto, répartition 70/30', '26,08 dB / 0,91 à 30k, 28,69 dB / 0,94 à 60k', 'Contexte pour l’étape de reconstruction (PSNR / SSIM).'],
          ],
        },
        {
          kind: 'media',
          media: 'aistDistill',
          alt: 'Deux rendus du même couloir côte à côte : le premier passage d’ArtiFixer3D+ et la variante distillée avec des contraintes de profondeur et de boucle. La structure locale diffère, les deux montrent encore des distorsions.',
          caption:
            'À gauche : premier passage d’ArtiFixer3D+. À droite : distillation avec profondeur et boucle. La branche profondeur et boucle change la structure locale et l’apparence, mais des distorsions restent : un diagnostic qualitatif, pas l’affirmation d’une géométrie correcte.',
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '154',
              meaning: 'images dans l’essai complet à 14 directions. Il a atteint une couverture complète et échoué à mes propres critères d’acceptation visuels et temporels. Ce résultat a mené à une refonte qui part de la géométrie.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'Réparer les faces du cube une par une a aggravé les coutures.', text: 'Le taux d’échec des coutures est passé de 0,34 à 0,83. L’approche a été rejetée après mesure ; le pipeline final répare les 14 vues ensemble.' },
            { title: 'Le gain de profondeur n’a pas survécu à la distillation.', text: 'La synchronisation tenant compte de la profondeur améliore l’accord entre les vues réparées, mais la distillation actuelle ne conserve pas ce gain dans le panorama final.' },
            { title: 'Aucun essai de navigation sur le vrai robot.', text: 'Sur main, l’inférence de NoMaD n’est pas branchée dans l’interface ROS 2, et aucun essai en boucle fermée sur le Kachaka n’est revendiqué.' },
            { title: 'La phase 1 reste en simulation.', text: 'La pose est la vérité terrain du simulateur, la base se déplace de façon cinématique et la scène 3DGS était fournie, pas entraînée là.' },
            { title: 'Le code d’assemblage de mai inversait les panoramas.', text: 'Ils sortaient inversés de gauche à droite, comme dans un miroir. Je l’ai trouvé et corrigé en octobre 2026, avec des tests synthétiques et l’aide d’une IA ; la correction est vérifiée contre le moteur de rendu de MuJoCo et des pièces synthétiques, pas confirmée sur un rendu de la scène du laboratoire.' },
            { title: 'Pas un problème résolu.', text: 'La méthode ne garantit ni des panoramas sans coutures visibles ni une géométrie correcte. Les preuves se limitent à deux clips d’intérieur et à des métriques sans référence.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'ArtiFixer-360 est un dérivé de l’ArtiFixer de NVIDIA (nv-tlabs/ArtiFixer, Apache-2.0). Le modèle de diffusion, le code d’inférence de base et 3DGRUT sont le travail de NVIDIA ; mes modifications sont détaillées fichier par fichier dans le dépôt.' },
            { text: 'La scène 3DGS de la phase 1 a été fournie par le laboratoire. La simulation tourne sur DISCOVERSE et MuJoCo.' },
            { text: 'Les deux clips d’intérieur derrière les résultats sont des vidéos de tiers que je n’ai pas filmées. Les vidéos elles-mêmes ne sont pas montrées : chaque image de ces pièces sur cette page est un rendu de gaussiennes 3D ou une sortie de modèle qui en dérive. Le dépôt n’indique ni la source ni la licence de ces clips.' },
            { text: 'Les essais sur GPU ont été faits sur des nœuds à 4 GPU du cluster ABCI.' },
            { text: 'Assistance par IA : comme déclaré dans l’annexe de mon rapport, des outils d’IA ont servi à la recherche, à l’écriture de code et à la relecture orthographique, pas à lancer les expériences ni à produire les résultats.' },
          ],
        },
      ],

      links: [
        { label: 'artifixer-360-pipeline : le pipeline de réparation', href: 'https://github.com/guilhem0908/artifixer-360-pipeline' },
        { label: 'nav_3dgs_pano : navigation et panoramas en simulation', href: 'https://github.com/guilhem0908/nav_3dgs_pano' },
        { label: 'KachakaNavigation : interface ROS 2 pour le robot Kachaka', href: 'https://github.com/guilhem0908/KachakaNavigation' },
        { label: 'Rapport de stage, 29 pages (PDF, en anglais)', href: 'https://github.com/guilhem0908/artifixer-360-pipeline/blob/main/docs/assets/readme/Rapport_de_stage_2026_CARMOUZE_Guilhem.pdf' },
        { label: 'Vidéo de comparaison, rendu brut contre sortie réparée (10 s, dans le dépôt)', href: 'https://github.com/guilhem0908/artifixer-360-pipeline#final-report-and-qualitative-comparison' },
      ],
    },

    // ---------------------------------------------------------------- TLSe Racing
    // Sa part : la couche de simulation et d’outillage (nov. 2025), puis la boucle fermée et les bancs d’essai (oct. 2026).
    // Les planificateurs sont ceux d’Alec Bossard et de TJeanm : toujours crédités. Simulation 2D uniquement.
    'tlse-racing-driverless': {
      metaTitle: 'Simulateur driverless TLSe Racing | Guilhem Carmouze',
      metaDescription:
        'Simulation pour une équipe Formula Student driverless : simulateur 2D, capteur à champ de vision, boucle fermée. Rien n’a roulé sur une voiture.',
      kicker: 'TLSe Racing, équipe driverless de Formula Student. 2025-2026, avec un prolongement en octobre 2026.',
      title: 'La couche de simulation d’une voiture de course driverless',
      outcome:
        'J’ai écrit le simulateur 2D, avec son modèle de capteur à champ de vision, dans lequel on peut essayer une logique de conduite avant tout essai sur une vraie voiture. En octobre 2026, j’ai fermé la boucle : un contrôleur qui enchaîne des tours en ne voyant que ce que ce capteur lui laisse voir. Tout cela est de la simulation 2D.',
      meta: {
        role: 'Membre de l’équipe driverless. Auteur de la couche de simulation et d’outillage (novembre 2025), puis de la boucle fermée, des bancs d’essai, des tests et de l’intégration continue (octobre 2026).',
        team: 'Alec Bossard (premier contrôleur réactif, planificateur par milieux) et TJeanm (planificateurs RRT*, lissage).',
        period: 'Novembre et décembre 2025, puis octobre 2026',
        organisation: 'TLSe Racing, équipe driverless de Formula Student. Les deux dépôts sont des prototypes d’équipe hébergés sur mon compte GitHub, pas le logiciel officiel de l’équipe.',
        stack: 'Python, Pygame (pygame-ce), NumPy, SciPy, pytest, intégration continue, ffmpeg pour les clips',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'tlseClosedLoop',
        alt: 'Deux vues d’une voiture simulée qui fait un tour d’une piste de cônes. À gauche : toute la piste, avec des cônes bleus et jaunes, la plupart estompés parce que la voiture ne les connaît pas encore. À droite : une vue de suivi où un secteur de capteur gris balaie l’avant de la voiture et où les cônes à l’intérieur portent un anneau blanc.',
        caption:
          'Un tour de la piste belgium conduit par la boucle fermée avec le capteur par défaut (portée de 4 m, champ de vision de 100°), joué à deux fois la vitesse simulée. À gauche : toute la piste. À droite : une vue de suivi. Les cônes estompés sont inconnus de la voiture, les cônes en pleine couleur sont dans sa mémoire, les cônes avec un anneau blanc sont dans le secteur du capteur à cet instant. La ligne rouge est la ligne centrale construite à partir des paires bleu-jaune. Simulation 2D, enregistrée hors écran par un script du dépôt.',
      },
      summary: {
        problem:
          'L’équipe driverless avait besoin d’un endroit où essayer une logique de conduite avant tout essai sur une vraie voiture, avec un capteur qui ne montre que les cônes devant la voiture.',
        built:
          'Un simulateur Pygame 2D avec une caméra qui s’ajuste à la piste, un chargeur de pistes CSV typé et un modèle de capteur à champ de vision configurable (2025), puis une boucle fermée avec mémoire des cônes, poursuite pure (pure pursuit) et un arbitre, et un banc d’essai des planificateurs de mes coéquipiers (octobre 2026).',
        result:
          'Avec le capteur par défaut, la voiture réalise trois tours valides sur chacune des quatre pistes fournies et ne touche aucun cône sur trois d’entre elles ; sur la piste à épingles, elle en touche 11 par tour. Simulation 2D : aucun temps au tour ici ne prédit une voiture.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'Pendant la saison 2025-2026, j’étais membre de l’équipe driverless de TLSe Racing, une équipe de Formula Student. En novembre 2025, deux de ses membres ont commencé un petit simulateur en Python et Pygame pour essayer une logique de conduite avant tout essai sur une vraie voiture : j’ai écrit la couche de simulation, Alec Bossard le premier contrôleur réactif.',
            'Deux dépôts en sont sortis, tous deux des prototypes d’équipe hébergés sur mon compte. TLSe_Racing_Driverless est le simulateur. PathPlanning (novembre et décembre 2025) contient trois planificateurs hors ligne qui construisent une ligne de référence fermée autour d’une piste de cônes, et un visualiseur qui y conduit une voiture. Le code de planification est le travail de mes coéquipiers. Le simulateur, le visualiseur, la caméra et le chargeur de pistes sont les miens.',
            'En octobre 2026, je suis revenu sur les deux avec ce qui leur manquait : des mesures. Dans le simulateur, un contrôleur qui enchaîne des tours à partir de ce que voit le capteur. Dans PathPlanning, une ligne de commande, des mesures des lignes planifiées, un banc d’essai avec des résultats versionnés, des tests et de l’intégration continue. Le code de mes coéquipiers est laissé tel qu’ils l’ont écrit.',
          ],
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'Novembre 2025',
              title: 'La couche de simulation',
              body: 'Un simulateur Pygame 2D pour pistes de cônes de Formula Student : un chargeur CSV typé avec vérification du schéma, une caméra qui s’ajuste à la piste et zoome autour du curseur, une voiture dessinée à l’échelle Formula Student, et un modèle de capteur à champ de vision configurable, une portée et un angle d’ouverture, qui sélectionne les cônes que la voiture peut voir. Le modèle de capteur est purement géométrique : pas d’occlusion, pas de traitement d’image.',
              note: 'Alec Bossard a écrit, au-dessus de cette couche, le premier contrôleur réactif : il vise le milieu des cônes bleu et jaune visibles les plus proches.',
              repo: 'TLSe_Racing_Driverless',
              repoNote: 'le simulateur',
            },
            {
              tag: 'Novembre et décembre 2025',
              title: 'Un visualiseur pour les planificateurs',
              body: 'Dans PathPlanning, trois planificateurs construisent une ligne de référence fermée autour d’une piste de cônes à partir de la carte complète des cônes : une ligne centrale par milieux ajustée par une B-spline (Alec Bossard), et deux variantes de RRT* avec lissage (TJeanm). Ma part est le visualiseur Pygame qui déplace une voiture le long de la ligne, sa caméra 2D, et le chargeur CSV des 26 cartes de cônes fournies.',
              note: 'Les planificateurs voient tous les cônes : il n’y a pas de perception dans ce dépôt. Par git blame fin 2025 : 634 lignes de TJeanm, 355 de moi, 146 d’Alec Bossard.',
              repo: 'PathPlanning',
              repoNote: 'planificateurs hors ligne et visualiseur',
            },
            {
              tag: 'Octobre 2026',
              title: 'La boucle fermée',
              body: 'Un contrôleur qui ne lit jamais la carte. Toutes les 20 ms, il détecte les cônes dans le secteur du capteur, les mémorise, apparie les cônes bleus et jaunes en portes, enchaîne les portes devant la voiture en une ligne centrale locale et suit cette ligne par poursuite pure (pure pursuit) avec une consigne de vitesse. Un modèle bicyclette cinématique déplace la voiture, et un arbitre chronomètre les tours et compte les contacts avec les cônes sur la vraie carte.',
              note: 'Écrit avec l’aide d’un assistant de code IA : les commits portent la mention Co-Authored-By. Il vit dans son propre paquet Python, séparé des fichiers de 2025.',
              repo: 'TLSe_Racing_Driverless',
              repoNote: 'closed_loop/, scripts/, tests/',
            },
            {
              tag: 'Octobre 2026',
              title: 'Mesurer les planificateurs',
              body: 'Une ligne de commande pour lancer n’importe quel planificateur sur n’importe laquelle des 26 pistes, des mesures des lignes planifiées (approche minimale d’un cône, part de la ligne qui reste entre les deux rangées), un banc d’essai de 78 exécutions avec ses résultats versionnés, des tests et de l’intégration continue. Les planificateurs eux-mêmes n’ont pas été modifiés.',
              note: 'Même assistance IA, même mention.',
              repo: 'PathPlanning',
              repoNote: 'registre de planificateurs, métriques, banc d’essai',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'La boucle fermée : ce que calcule la voiture',
          legend: { mine: 'Mon code', upstream: 'Données d’entrée' },
          loopLabel: 'Toutes les 20 ms : détecter, mémoriser, apparier, ordonner, braquer, avancer. La nouvelle pose retourne au capteur.',
          caption:
            'Le modèle de capteur est le fichier de 2025 ; le reste de la boucle date d’octobre 2026. Le simulateur donne à la voiture sa pose exacte, donc il n’y a pas d’erreur d’odométrie, et la perception est un test de visibilité sur la vraie carte : il n’y a ni modèle de caméra ni modèle de LiDAR. Un cône sans partenaire prolonge quand même la ligne, décalé d’une demi-largeur de piste vers l’intérieur, ce qui compte avec une courte portée de capteur.',
          nodes: [
            { label: 'CSV de la piste', detail: 'la carte complète des cônes : seuls le capteur et l’arbitre la lisent', mine: false },
            { label: 'Capteur à champ de vision', detail: 'portée et angle d’ouverture (2025)', mine: true, loop: true },
            { label: 'Mémoire des cônes', detail: 'fusion à moins de 0,5 m, utilisés après trois observations, oubliés 6 s après la dernière', mine: true, loop: true },
            { label: 'Portes et ligne centrale locale', detail: 'paires bleu et jaune de 2 m à 6,5 m de large qui passent le test de Gabriel, enchaînées devant la voiture', mine: true, loop: true },
            { label: 'Poursuite pure et consigne de vitesse', detail: 'distance d’anticipation de 2 m à 5 m, vitesse limitée par l’accélération latérale', mine: true, loop: true },
            { label: 'Modèle bicyclette cinématique', detail: 'limites de braquage et d’accélération', mine: true, loop: true },
            { label: 'Arbitre', detail: 'chronomètre de tour, compteur de cônes touchés, contrôle de sortie de piste, sur l’état réel', mine: true },
          ],
        },
        {
          kind: 'media',
          media: 'tlsePlanners',
          wide: true,
          alt: 'Trois panneaux, chacun une voiture qui roule autour de la même petite piste de cônes le long d’une ligne rouge : midpoint (104 m, cône le plus proche à 1,92 m), rrt (102 m, cône le plus proche à 1,14 m) et rrt-lsq (100 m, cône le plus proche à 0,58 m).',
          caption:
            'Les trois planificateurs de PathPlanning sur small_track, avec la même graine aléatoire que le banc d’essai. La voiture avance à la même vitesse constante sur chaque ligne, donc la ligne la plus courte finit la première. C’est une animation du visualiseur, pas un modèle de véhicule.',
        },
      ],

      results: [
        {
          kind: 'figures',
          items: [
            {
              value: '4 / 4',
              meaning:
                'pistes fournies conduites pour trois tours valides avec le capteur par défaut, portée de 4 m et champ de vision de 100°. Aucun cône touché sur trois d’entre elles. Un tour est valide quand la voiture est passée par au moins 95 % des portes de référence de la piste.',
            },
            {
              from: '25,3',
              value: '19,5',
              unit: 's',
              meaning:
                'Meilleur tour simulé sur belgium quand la portée du capteur passe de 4 m à 12 m (et le champ de vision de 100° à 120°). La règle de vitesse ne laisse la voiture aller qu’aussi vite qu’elle peut ralentir sur la ligne qu’elle connaît. La voiture est une bicyclette cinématique sans pneus : cela compare des réglages du simulateur et ne prédit pas une voiture.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Boucle fermée, 32 essais de trois tours sur les quatre pistes fournies, 3 387 s de conduite simulée. La simulation est déterministe ; les seuls nombres aléatoires sont le bruit de détection de deux ablations, avec une graine fixe. Les nombres sont écrits par scripts/benchmark.py et versionnés avec le dépôt. Les temps au tour découlent des limites choisies et d’un modèle sans pneus.',
          head: ['Ce qui a été mesuré', 'Valeur', 'Comment le lire'],
          rows: [
            ['Capteur par défaut, 4 m de portée et 100° : tours valides sur belgium, la piste à épingles, peanut et small_track', '3 / 3 sur chacune', 'Cônes touchés par tour : 0 sur belgium, peanut et small_track, 11 sur la piste à épingles.'],
            ['Meilleur tour sur belgium avec un capteur de 4 m / 100°, de 8 m / 120° et de 12 m / 120°', '25,28 s, 20,32 s, 19,54 s', 'Les temps au tour baissent quand la portée augmente. La portée ne change pas les contacts avec les cônes.'],
            ['Sans mémoire des cônes, 4 m / 100°, sur la piste à épingles', 'sortie de piste à 77 s', 'Sans mémoire, la voiture touche aussi des cônes sur deux autres pistes (3,0 par tour sur peanut, 2,0 sur small_track).'],
            ['Sans repli sur un seul côté, 4 m / 100°, sur les quatre pistes', 'sortie sur les quatre', 'À 29 s, 28 s, 8 s et 32 s : le repli est ce qui maintient la ligne quand le bord lointain de la piste est hors de vue.'],
            ['Bruit de détection de 0,1 m, puis 0,2 m par axe, 4 m / 100°', 'aucun changement, puis 2 pistes perdues', 'À 0,2 m, la voiture sort de belgium et de la piste à épingles. Le bruit est indépendant d’un cycle à l’autre, ce que la moyenne glissante de la mémoire efface ; une erreur biaisée ou qui dérive serait plus difficile.'],
          ],
        },
        {
          kind: 'media',
          media: 'tlseLaps',
          wide: true,
          alt: 'Quatre cartes de pistes de cônes avec la trajectoire parcourue en magenta : belgium, peanut, small_track et la longue piste à épingles. Des cônes bleus d’un côté, jaunes de l’autre. Sur la piste à épingles, quelques cônes près des dernières épingles sont entourés en blanc.',
          caption:
            'Trois tours par piste avec le capteur par défaut, dessinés par scripts/render_laps.py. Les cônes que la voiture a touchés sont entourés en blanc : tous sont sur les cinq dernières épingles de la piste à épingles.',
        },
        {
          kind: 'table',
          caption:
            'Planificateurs de PathPlanning, 78 exécutions (trois planificateurs sur 26 pistes), graine 0, planification hors ligne sur la carte complète des cônes : pas de perception, pas de modèle de véhicule. Les temps de planification ont été pris pendant que les exécutions partageaient la machine, ils sont donc indicatifs. Il n’existe pas de meilleure ligne de référence : une plus grande marge ne fait pas un tour plus rapide.',
          head: ['Ce qui a été mesuré', 'Valeur', 'Comment le lire'],
          rows: [
            ['Temps de planification médian sur les 26 pistes : midpoint, rrt, rrt-lsq', '63 ms, 27,7 s, 34,1 s', 'Le planificateur midpoint met 0,2 s au plus. Les planificateurs RRT* mettent jusqu’à 58,8 s et 73,1 s sur une piste.'],
            ['Approche minimale médiane d’un centre de cône : midpoint, rrt, rrt-lsq', '0,94 m, 0,15 m, 0,04 m', 'Pistes où la ligne passe à moins de 0,7 m d’un cône, la moitié de la largeur d’une voiture de 1,4 m (une hypothèse) : 6 sur 26, 23 sur 26 et 25 sur 26.'],
            ['Recherches RRT* qui ont retourné un chemin', '585 / 11 998', 'Toutes sur les trois pistes du menu d’origine (31 sur 31, 489 sur 491 et 65 sur 65). Aucune des 11 411 recherches sur les 23 autres cartes.'],
            ['small_track, approche minimale d’un cône : midpoint contre rrt-lsq', '1,92 m → 0,58 m', 'La ligne RRT* est plus courte (100,1 m contre 104,1 m) mais passe plus près des cônes.'],
          ],
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '11',
              meaning:
                'cônes touchés par tour sur la piste à épingles, avec le capteur par défaut. Les tours sont terminés, mais les contacts sont tous sur les cinq dernières épingles.',
            },
            {
              value: '3 / 26',
              meaning:
                'pistes sur lesquelles les planificateurs RRT* trouvent un chemin entre les points de passage : 585 recherches sur 11 998 en ont retourné un, toutes sur les trois pistes du menu d’origine.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'La piste à épingles n’est pas conduite proprement.', text: 'Là, la ligne centrale se resserre jusqu’à un rayon de 2,13 m, sous le rayon de braquage minimal de 2,65 m de la voiture simulée, dont l’empreinte balaie alors les cônes. La poursuite pure ne fait que suivre la ligne centrale : éviter les contacts demanderait un planificateur qui exploite la largeur de la piste, ce que le dépôt n’a pas.' },
            { title: 'Les planificateurs RRT* ne résolvent que trois pistes sur 26.', text: 'Chaque cône est un disque de 1,2 m dans la recherche, donc le milieu d’une porte plus étroite que 2,4 m se trouve dans les disques de ses propres deux cônes. Sur les 23 autres cartes, la porte médiane fait 2,20 m à 2,22 m de large. Leurs lignes sont alors des segments droits entre les points de passage des milieux, lissés sans aucune connaissance des cônes : une approche minimale médiane de 0,14 m pour rrt et de 0,03 m pour rrt-lsq sur ces cartes, contre 0,94 m pour midpoint sur les 26 pistes.' },
            { title: 'Le premier prototype réactif dérive.', text: 'Le contrôleur de novembre 2025 vise le milieu des cônes bleu et jaune visibles les plus proches à vitesse constante, ne garde aucune mémoire et n’a rien à faire quand aucun cône n’est en vue. Rejoué hors écran, la voiture s’écarte de plus de 4 m du milieu de la piste sur les quatre pistes fournies en moins de 40 secondes simulées. La boucle fermée ajoute la mémoire et l’appariement qui lui manquent.' },
            { title: 'Le premier réglage du capteur était trop étroit.', text: 'Le secteur de 7 m et 60° du modèle de capteur, tel que je l’ai d’abord versionné en novembre 2025, suffit sur trois pistes. Sur la piste à épingles, la voiture sort de la piste après 52 s : le secteur étroit ne montre pas assez d’un virage serré.' },
            { title: 'Simulation uniquement.', text: 'La voiture connaît sa pose exacte, et la perception est un test de visibilité sur la vraie carte : pas de modèle de caméra ni de LiDAR, pas d’occlusion, pas de détection manquée ou fausse. La mémoire des cônes aurait besoin d’une vraie estimation de la position de la voiture pour fonctionner sur un véhicule. La détection de cônes par caméra, la localisation et la cartographie, un modèle de pneus, une trajectoire de course et une interface ROS ne sont pas dans ces dépôts, et rien ici n’a roulé sur une voiture.' },
          ],
        },
        {
          kind: 'media',
          media: 'tlsePlannerFigure',
          wide: true,
          alt: 'Neuf petites cartes, trois planificateurs sur trois pistes. Ligne du haut small_track et ligne du milieu peanut : une ligne rouge entre les cônes bleus et jaunes pour midpoint, rrt et rrt-lsq. Ligne du bas Zandvoort_cones : la ligne suit de très près les rangées de cônes pour les trois planificateurs, avec 0 recherche RRT* résolue sur 476.',
          caption:
            'Midpoint, rrt et rrt-lsq sur small_track, peanut et Zandvoort_cones, dessinés par scripts/render_planners.py. Ligne du bas : sur une carte en forme de circuit, aucune recherche RRT* ne retourne de chemin, et la ligne lissée passe alors à quelques centimètres des cônes.',
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'Alec Bossard a écrit le premier contrôleur réactif et le prototype hors ligne de ligne centrale du dépôt du simulateur, ainsi que le planificateur midpoint de PathPlanning. TJeanm a écrit les deux planificateurs RRT* et leur lissage, ainsi que la note française d’origine de PathPlanning (TJeanm est un nom d’utilisateur GitHub).' },
            { text: 'J’ai écrit le chargeur de pistes, la caméra, le visualiseur et le modèle de capteur à champ de vision en novembre 2025, puis le paquet de boucle fermée, l’arbitre, les bancs d’essai, les figures, les tests et l’intégration continue en octobre 2026.' },
            { text: 'Le travail d’octobre 2026 a été écrit avec l’aide d’un assistant de code IA, et ces commits portent la mention Co-Authored-By. Chaque nombre et chaque image de cette page est réécrit par un script du dépôt.' },
            { text: 'L’origine des quatre pistes du dépôt du simulateur et des 26 cartes de PathPlanning n’est pas documentée dans les dépôts.' },
            { text: 'En dehors de ces dépôts, j’ai aussi travaillé sur des modèles de détection de cônes en PyTorch et sur des modules de traitement d’image et de commande avec ROS, Python et C++. Ce travail n’y figure pas, et cette page n’en montre rien.' },
            { text: 'La poursuite pure suit R. C. Coulter (1992), le test d’appariement est le graphe de Gabriel (Gabriel et Sokal, 1969), RRT* est de Karaman et Frazzoli (2011). Les GIF sont enregistrés avec ffmpeg.' },
          ],
        },
      ],

      links: [
        { label: 'TLSe_Racing_Driverless : le simulateur et la boucle fermée', href: 'https://github.com/guilhem0908/TLSe_Racing_Driverless' },
        { label: 'PathPlanning : planificateurs hors ligne, visualiseur et banc d’essai', href: 'https://github.com/guilhem0908/PathPlanning' },
      ],
    },

    // ------------------------------------------------------------- Projet Fil Rouge
    // La partie 2 (vrai robot, équipe de six) passe en premier : sa part est l’IHM web, le flux MJPEG, la règle de centrage
    // et le cadencement des commandes. Cartographie, reconnaissance vocale, moteurs et traitement d’image sont le travail de ses coéquipiers.
    'projet-fil-rouge': {
      metaTitle: 'Projet Fil Rouge, robot piloté par le web | Guilhem Carmouze',
      metaDescription:
        'Un robot mobile construit à six à l’UPSSITECH et piloté depuis une application monopage Web Bluetooth, avec flux caméra en direct et centrage de la balle.',
      kicker: 'Projet Fil Rouge. Première année du cycle ingénieur, 2024-2025.',
      title: 'Un vrai robot, piloté depuis une page web',
      outcome:
        'Au printemps 2025, une équipe de six a construit un vrai robot mobile. Ma part était ce que touche l’opérateur : une page web qui le pilote en Bluetooth, montre ce que voit sa caméra et transforme la position d’une balle en commandes qui la gardent centrée. Le semestre d’avant, avec Alec Bossard, j’avais écrit un détecteur de balles de couleur en C pur.',
      meta: {
        role: 'Partie 2, le vrai robot : l’interface web (application monopage Web Bluetooth, flux caméra, règle de centrage de la balle, cadencement des commandes vocales). Partie 1 : analyse des images, entrées et sorties de fichiers, seuils de couleur et structures de clusters du détecteur en C.',
        team: 'Partie 2 : une équipe de six, avec Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard et Fairouz Ijerdaoun. Partie 1 : avec Alec Bossard.',
        period: 'Partie 1 : janvier 2025. Partie 2 : printemps 2025.',
        organisation: 'UPSSITECH, Université de Toulouse. Cursus Systèmes Robotiques et Interactifs (SRI), première année du cycle ingénieur.',
        stack: 'JavaScript, API Web Bluetooth, Bootstrap 5, MJPEG sur HTTP. Partie 1 : C11, GNU Make, CMake. Sur le robot, écrit par mes coéquipiers : Arduino, Raspberry Pi, RPLiDAR, Python et OpenCV.',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'pfrBall',
        alt: 'Images de la caméra du robot, à ras du sol : une balle bleue et une balle rose, chacune entourée d’un cercle et étiquetée avec ses coordonnées, avec une courte traînée derrière elle.',
        caption:
          'Ce que voit la caméra du robot, tel que la page web le montre : chaque balle est entourée avec sa position et une traînée. Enregistrement de démonstration de l’équipe. La détection tourne sur le Raspberry Pi et c’est le travail de mes coéquipiers. Afficher le flux dans la page, et transformer les positions en commandes de conduite, c’est le mien.',
      },
      summary: {
        problem:
          'Un vrai robot devait se piloter depuis un téléphone ou un ordinateur, à la main, à la voix et en suivant une balle, sur une liaison Bluetooth qu’un simple rechargement de page coupait à chaque fois.',
        built:
          'Une application monopage à trois vues qui pilote le robot par l’API Web Bluetooth, le flux caméra du Raspberry Pi dans la vue vocale, une règle qui transforme la position image de la balle en commandes de conduite, et le cadencement des commandes vocales découpées : 2 s par mètre, 4 s par quart de tour.',
        result:
          'Un robot que l’équipe a montré en train de rouler depuis la page, à la voix et en suivant une balle, et en cartographiant son environnement. Le détecteur en C de la première moitié trouve 28 balles sur 28 sur ses 20 photos, sans fausse détection, un score réglé sur ces photos qui ne mesure pas la généralisation.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'Le Projet Fil Rouge est le projet transversal de la première année du cycle ingénieur à l’UPSSITECH, sur deux semestres. La première moitié (semestre 5, janvier 2025) était du logiciel en C. Dans la seconde (semestre 6, printemps 2025), chaque équipe devait passer d’un monde simulé à un vrai robot qui se déplace dans une pièce, réagit à des commandes vocales et détecte des objets avec ses capteurs.',
            'Notre robot combine pilotage des moteurs par Arduino, caméra Raspberry Pi, cartographie RPLiDAR avec ICP, commandes vocales, suivi de balle et une interface web. Nous étions six : Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard, Fairouz Ijerdaoun et moi. Le code, le rapport, les diapositives et les enregistrements de démonstration sont dans le dépôt d’équipe waliwassim/PFR2.',
          ],
        },
        {
          kind: 'media',
          media: 'pfrRobot',
          wide: true,
          alt: 'Le robot à quatre roues à côté d’une caisse grise dans une arène de test. À droite, deux graphiques d’un écran : le scan LiDAR en direct en rouge et la carte construite à partir de scans successifs en bleu.',
          caption:
            'Le robot de l’équipe dans son arène, à côté du scan LiDAR en direct (graphique de gauche) et de la carte construite à partir de scans successifs (graphique de droite). La cartographie, avec l’appariement de scans par ICP, est le travail de mes coéquipiers. Les titres des graphiques sont en français.',
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'Partie 2, la page',
              title: 'Une application monopage qui ne coupe jamais la liaison',
              body: 'Le robot se pilote en Bluetooth avec l’API Web Bluetooth, et un rechargement normal de la page coupait cette liaison à chaque fois. L’interface est donc une application monopage : un menu d’accueil, un pavé de pilotage manuel et une vue vocale s’échangent sur place, sans rechargement. Un point vert ou rouge permanent indique si la liaison est active, et le bouton de connexion disparaît dès qu’elle l’est. Le pavé a quatre flèches et trois grands boutons colorés (plus vite, moins vite, mode automatique), dimensionnés et colorés pour un usage immédiat. L’interface est construite avec Bootstrap 5.',
              note: 'Web Bluetooth fonctionne dans Chrome et Edge sur ordinateur. Sur iOS, le rapport recommande une application de navigateur tierce (Blueify).',
              repo: 'PFR2',
              repoNote: 'dépôt d’équipe, Code/IHM',
            },
            {
              tag: 'Partie 2, la caméra',
              title: 'La vue du robot dans la page',
              body: 'Le Raspberry Pi traite la vidéo de la webcam et la sert en flux MJPEG, avec la position de la balle détectée, sur le Wi-Fi local. Dans la vue vocale, dès qu’une commande de suivi de balle est détectée, ma page affiche le flux en direct.',
              note: 'Le côté Raspberry Pi, la détection OpenCV et son serveur vidéo, est le travail de mes coéquipiers.',
            },
            {
              tag: 'Partie 2, la balle',
              title: 'Garder la balle centrée',
              body: 'La page reçoit la position (x, y) de la balle et convertit sa coordonnée horizontale en commandes de conduite pour l’Arduino. Quand la balle est hors de l’axe central de l’image, le robot tourne vers elle ; quand elle est sur l’axe, le robot avance. Sans balle en vue, il tourne pour en chercher une, et si la caméra est injoignable, il s’arrête. Les commandes partent par la même liaison Bluetooth que le pavé.',
              note: 'La règle est dans le code de l’interface du dépôt d’équipe.',
            },
            {
              tag: 'Partie 2, la voix',
              title: 'Cadencer les séquences parlées',
              body: 'Le code d’un coéquipier transforme une phrase française parlée en une liste de commandes, et un algorithme d’un collègue la découpe en étapes (avancer de deux mètres, puis un quart de tour à droite). J’ai intégré ce découpage, puis calculé et appliqué les délais entre les commandes : 2 s par mètre et 4 s par quart de tour.',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'Suivre une balle depuis la page web',
          legend: { mine: 'Ma part', upstream: 'Le travail de mes coéquipiers' },
          loopLabel: 'Tant qu’une balle est suivie : le robot bouge, et la caméra voit la balle ailleurs',
          caption:
            'La page parle à deux machines différentes : le Raspberry Pi par Wi-Fi pour l’image et la position de la balle, et l’Arduino par Bluetooth pour les moteurs.',
          nodes: [
            { label: 'Webcam et OpenCV sur le Raspberry Pi', detail: 'détection des balles par couleur', mine: false },
            { label: 'Flux MJPEG et position de la balle', detail: 'servis sur le Wi-Fi local', mine: false, loop: true },
            { label: 'Vue caméra dans la page web', detail: 'vue vocale, affichée quand une commande de suivi de balle est détectée', mine: true, loop: true },
            { label: 'Règle de centrage de la balle', detail: 'la position horizontale de la balle sur l’image : tourner à gauche, tourner à droite ou avancer', mine: true, loop: true },
            { label: 'Écriture Web Bluetooth', detail: 'une seule liaison pour le pavé, la vue vocale et la règle', mine: true, loop: true },
            { label: 'Pilotage des moteurs par Arduino', detail: 'quatre moteurs à courant continu', mine: false, loop: true },
          ],
        },
        {
          kind: 'strip',
          items: [
            { media: 'pfrHmi', alt: 'Un téléphone tenu dans un couloir affiche l’interface web, tandis qu’un petit robot à quatre roues se tient plus loin dans le couloir.', caption: 'La page sur un téléphone, en mode manuel, qui pilote le robot dans un couloir. Enregistrement de démonstration de l’équipe.' },
            { media: 'pfrPad', alt: 'Une main tient un téléphone qui affiche le pavé de flèches et de boutons colorés, pendant que le robot traverse un hall.', caption: 'Le pavé : quatre flèches et trois boutons colorés, et le robot qui traverse un hall. Enregistrement de démonstration de l’équipe.' },
            { media: 'pfrVoice', alt: 'Un téléphone affiche la vue vocale avec un seul bouton rond, et le robot roule dans un hall avec des panneaux d’affichage sur le mur derrière lui.', caption: 'La vue vocale sur un téléphone, puis le robot qui roule dans un hall. Enregistrement de démonstration de l’équipe.' },
          ],
        },
        {
          kind: 'text',
          title: 'Partie 1, janvier 2025 : un détecteur de balles de couleur en C pur',
          body: [
            'Avec Alec Bossard, j’ai écrit la partie traitement d’image de la première moitié du projet : un programme C11 qui trouve des balles orange, bleues et jaunes dans une image RGB de 300 × 300 et rapporte le centre et le rayon de chacune, sans bibliothèque de vision. Il lit l’image sous forme d’export texte, segmente chaque couleur avec des seuils RGB fixes, garde la plus grande tache 4-connexe de chaque couleur et la mesure par sa boîte englobante.',
            'Par git blame, ma part est l’analyseur d’image et sa structure, la lecture et l’écriture de fichiers, les seuils de couleur et la construction des masques, et la liste de clusters avec leur boîte englobante, leur centre et leur rayon. Alec Bossard a écrit la quantification RGB et le filtre de la plus grande composante.',
            'En octobre 2026, j’ai nettoyé le dépôt, avec un assistant de code IA : la version réglée utilisée à la fin du projet a été reprise, les bugs restants ont été corrigés (un débordement de pile dans le remplissage par diffusion (flood fill) récursif, des fuites mémoire, un plantage à la suppression d’une petite tache), et des tests, une évaluation étiquetée et les figures ont été ajoutés.',
          ],
        },
        {
          kind: 'media',
          media: 'pfrPipeline',
          wide: true,
          alt: 'Deux rangées de trois panneaux. À gauche : une photo de 300 par 300 de balles colorées sur un sol. Au milieu : les masques de couleur, une silhouette atténuée de tout ce qui est dans les seuils et une plus grande composante lumineuse avec sa boîte englobante. À droite : la photo à nouveau, avec un cercle, une croix et une étiquette sur chaque balle, par exemple orange en (158, 204) de rayon 42.',
          caption:
            'D’une image texte à une position de balle, sur deux des 20 photos : les masques, puis le cercle dérivé de la boîte englobante. Les seuils n’attrapent qu’une partie d’une balle orange ou jaune, ce qui explique que la boîte soit décentrée et que trois corrections empiriques de la fin du projet aient été conservées.',
        },
      ],

      results: [
        {
          kind: 'text',
          title: 'La partie 2 est une démonstration, pas une mesure',
          body: [
            'Le robot a été montré en train de rouler depuis la page en mode manuel, à partir d’une phrase parlée et en suivant une balle, et en cartographiant avec son LiDAR : les enregistrements sont dans le dépôt d’équipe. Je n’ai aucune mesure à moi à citer pour cette partie. Les seuls nombres de ma part sont la règle de cadencement : 2 s par mètre et 4 s par quart de tour.',
          ],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '28 / 28',
              meaning:
                'balles trouvées avec la bonne couleur, centre à l’intérieur de la balle étiquetée, sur les 20 photos de test de la partie 1, sans fausse détection et avec les 3 scènes vides laissées vides. Les seuils et les corrections ont été réglés sur ces mêmes photos : cela montre de la cohérence, pas de la généralisation.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Partie 1, le détecteur en C sur ses 20 photos. Les 28 balles ont été étiquetées à l’œil en octobre 2026, à environ 2 px près, et chaque nombre est écrit par un script du dépôt qui lance le programme compilé. Pour les erreurs, plus bas est mieux.',
          head: ['Ce qui a été mesuré', 'Valeur', 'Comment le lire'],
          rows: [
            ['Erreur de centre du cercle rapporté, médiane (maximum), sur les 28 balles', '4,1 px (18,0 px)', 'Le pire cas est une balle vue de très près. Les masques orange et jaune ratent environ la moitié de la balle, toujours du même côté.'],
            ['Balles orange, erreur de centre médiane avant et après les trois corrections empiriques', '11,0 px → 6,1 px', 'Les corrections aident sur cet ensemble, qui est vraisemblablement celui sur lequel elles ont été ajustées.'],
            ['Recouvrement du cercle rapporté avec le cercle étiqueté (IoU), médiane (minimum)', '0,85 (0,59)', 'Les balles bleues sont localisées à quelques pixels près, les orange et jaunes moins bien.'],
            ['Temps d’exécution par image, dans un conteneur Linux et sous Windows', '7 ms, 40 ms', 'Démarrage et analyse du fichier texte de 1 Mo inclus, sur un CPU de portable, sans GPU.'],
            ['Vérifications de la suite de tests', '101 + 58', '101 vérifications unitaires sur les modules et 58 sur le programme compilé : les 20 photos contre des sorties enregistrées, des scènes synthétiques et des entrées mal formées.'],
          ],
        },
        {
          kind: 'media',
          media: 'pfrContact',
          wide: true,
          alt: 'Une grille des 20 photos de test, des balles de trois couleurs sur des sols gris, chaque balle entourée par le détecteur. Les trois dernières photos, des sols vides, portent la mention « empty scene, nothing detected ».',
          caption:
            'Les 20 photos de test avec le cercle que le détecteur rapporte pour chaque balle, dessinés par un script du dépôt. L’origine des photos n’y est pas documentée.',
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 7',
              meaning:
                'balles jaunes trouvées quand chaque pixel des 20 photos est assombri à 70 % (un changement d’exposition simulé). Les seuils RGB fixes sont liés à l’exposition de ces photos : un changement de 10 % dans un sens ou dans l’autre fait déjà perdre une balle.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'Une balle par couleur, et aucune vérification de forme.', text: 'Seule la plus grande tache de chaque couleur est rapportée, et toute tache assez grande d’une couleur connue compte comme une balle. La position est approximative.' },
            { title: 'Le détecteur en C n’a jamais tourné sur le robot.', text: 'Sur le robot, le suivi de balle est un programme Python distinct sur le Raspberry Pi, écrit par mes coéquipiers avec OpenCV d’après l’idée du détecteur de la partie 1. Il suit deux ou trois couleurs au plus : le rapport note qu’avec davantage il devient instable, et que la webcam réagit à l’éclairage et prend un objet brillant pour une balle.' },
            { title: 'Le cadencement vocal est en boucle ouverte.', text: 'Les délais sont des durées, pas des distances mesurées : le robot n’avait pas d’odométrie, donc un mètre, ce sont deux secondes de conduite et un quart de tour, quatre.' },
            { title: 'Web Bluetooth n’est pas disponible partout.', text: 'Il fonctionne dans Chrome et Edge sur ordinateur. Sur un iPhone, le rapport recommande une application de navigateur tierce.' },
            { title: 'Je n’ai pas écrit le traitement d’image de la partie 2.', text: 'Contrairement à la partie 1, la détection qui alimente la règle de centrage est le travail de mes coéquipiers. Ma part commence aux coordonnées de la balle.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'Les autres parties du robot sont le travail de mes coéquipiers, comme le disent les sections individuelles du rapport d’équipe : reconnaissance vocale et filtre de commandes (Alexandre Perrin, qui a aussi contribué au code Arduino et à l’interface utilisateur), suivi de balle sur le Raspberry Pi et son serveur vidéo (Wassim Wali et Fairouz Ijerdaoun), cartographie LiDAR avec ICP (Abdelbasset Houdass), code Arduino et câblage des capteurs (Alec Bossard).' },
            { text: 'Le robot, les enregistrements de démonstration, le rapport et les diapositives appartiennent à l’équipe. Les enregistrements de cette page viennent du dépôt d’équipe waliwassim/PFR2, hébergé par un coéquipier.' },
            { text: 'La partie 1 a été écrite avec Alec Bossard. Le nettoyage et l’évaluation d’octobre 2026 sont les miens, faits avec un assistant de code IA : ces commits portent la mention Co-Authored-By.' },
          ],
        },
      ],

      links: [
        { label: 'PFR2 : le dépôt d’équipe (code, rapport, diapositives, enregistrements de démonstration)', href: 'https://github.com/waliwassim/PFR2' },
        { label: 'PFR : le détecteur de balles de couleur en C, avec son évaluation', href: 'https://github.com/guilhem0908/PFR' },
      ],
    },

    // ------------------------------------------------------------------ Usine 4.0
    // CONFIRM : le projet de promotion est en cours et rien d’autre n’est connu. Écrire exactement cela : pas de partenaire,
    // de plateforme, de robot ni de résultat. La seule preuve de cette page est l’étude personnelle amr-traffic-lab.
    'usine-4-0': {
      metaTitle: 'Usine 4.0, projet d’usine connectée | Guilhem Carmouze',
      metaDescription:
        'Usine 4.0, mon projet d’équipe de dernière année sur l’usine connectée (Industrie 4.0), est en cours. Avec lui : une étude personnelle du trafic de robots.',
      kicker: 'Projet d’équipe de dernière année. 2026-2027. En cours.',
      title: 'Usine 4.0, en cours, et une étude personnelle du trafic de robots',
      outcome:
        'Cette année, ma promotion mène un projet d’équipe sur l’Usine 4.0 (Industrie 4.0, usine connectée). Il est en cours : cette page n’en montre donc rien. Elle montre ce que j’ai étudié de mon côté sur le même thème : combien de robots mobiles une allée d’usine peut accueillir avant de se bloquer.',
      meta: {
        role: 'Membre du projet de la promotion. En cours : rien de plus n’est précisé pour l’instant.',
        team: 'Ma promotion de dernière année. Rien de plus n’est précisé ici pour l’instant.',
        period: '2026-2027, en cours',
        organisation: 'UPSSITECH, Université de Toulouse. Cursus Systèmes Robotiques et Interactifs (SRI).',
        stack: 'Projet de promotion : non précisé. Étude personnelle : Python, pytest, Matplotlib et Pillow.',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'labAmr',
        alt: 'Le même plan d’usine rejoué deux fois, deux halls reliés par un couloir à voie unique, avec les mêmes 12 robots. À gauche : avec le gestionnaire naïf, les robots se rencontrent de face dans le couloir et s’arrêtent pour de bon. À droite : avec le gestionnaire à réservation, ils passent chacun à leur tour et le compteur de commandes livrées continue de monter.',
        caption:
          'Pas le projet de promotion : ma propre étude par simulation, amr-traffic-lab. Même plan, mêmes 12 robots, mêmes commandes tirées avec la même graine aléatoire (graine 0), les 200 premières secondes. Avec 12 robots, le gestionnaire naïf se bloque sur ce plan pour 20 graines sur 20 ; ici, plus rien ne bouge à gauche après t = 32 s.',
      },
      summary: {
        problem:
          'Le projet de promotion sur l’Usine 4.0 (Industrie 4.0, usine connectée) est en cours, donc il n’y a encore rien à en montrer. Sur le même thème, j’ai pu étudier seul une question : combien de robots mobiles autonomes une allée d’usine peut-elle accueillir avant de se bloquer ?',
        built:
          'De mon côté, pas pour le projet de promotion : amr-traffic-lab, une étude par simulation à graine aléatoire fixée, avec un nouvel A* sur grille, un axe temporel, une table de réservations et du Conflict-Based Search, sur trois plans d’usine dessinés à la main, avec un contrôle de sécurité qui recompte les conflits à chaque pas de temps.',
        result:
          'De l’étude personnelle, pas du projet de promotion : le gestionnaire à réservation ne s’est jamais bloqué (0 simulation d’une heure sur 600). Dans l’atelier ouvert, il livre 24 % de commandes de plus par heure que le gestionnaire naïf avec 16 robots, et aucune collision n’est survenue sur 3 473 858 pas de temps simulés.',
      },

      context: [
        {
          kind: 'text',
          title: 'Le projet de promotion',
          body: [
            'Cette année, 2026-2027, ma promotion mène un projet d’équipe de dernière année sur l’Usine 4.0 (Industrie 4.0, usine connectée), l’un des principaux secteurs visés par la formation SRI. Il est en cours.',
            'C’est tout ce que cette page en dit. Aucun partenaire, aucune plateforme, aucun robot ni résultat n’est revendiqué.',
          ],
        },
        {
          kind: 'text',
          title: 'Ce que j’ai étudié seul',
          body: [
            'Le thème a soulevé une question que mon travail à l’AIST avait laissée ouverte. J’y ai écrit un planificateur A* pour un seul robot sur une grille d’occupation, et préparé une interface ROS 2 pour Kachaka, un robot mobile qui s’arrime sous une étagère et la transporte. Un seul robot sur une carte vide ne rencontre jamais la première question que l’usine connectée (Usine 4.0) pose à une flotte : que se passe-t-il quand une douzaine de robots partagent une seule allée ?',
            'amr-traffic-lab est ma réponse, un projet personnel réalisé en octobre 2026 avec l’aide d’une IA, indépendant du projet de promotion. C’est la seule chose de cette page que je peux montrer et mesurer.',
          ],
        },
      ],

      built: [
        {
          kind: 'text',
          title: 'Ce que contient l’étude',
          body: [
            'Le plan est une carte texte transformée en grille 4-connexe d’allées, de stations de prise, de stations de dépose et de chargeurs. Une cellule fait 1 m et un pas de temps dure 1 s. J’ai écrit pour elle un nouvel A* sur grille (pas le planificateur de l’AIST), puis lui ai ajouté un axe temporel, une table de réservations et du Conflict-Based Search.',
            'Deux gestionnaires de trafic traitent les mêmes commandes, tirées avec la même graine aléatoire. Le naïf suit son propre plus court chemin, cède la place quand la cellule devant est prise et replanifie après une attente aléatoire. Le gestionnaire à réservation planifie chaque trajet contre une table de tous les chemins engagés, de sorte que les conflits de sommet et d’échange sont exclus dès la planification, et le plus ancien trajet inachevé n’attend jamais : sur un plan bien formé, la flotte ne peut pas se bloquer.',
            'Le Conflict-Based Search, pour un ensemble fixe de paires départ-arrivée, minimise la somme des coûts des chemins. Ses réponses sont comparées à une recherche exhaustive en espace d’états joint qui ne partage aucun code avec lui.',
          ],
        },
        {
          kind: 'pipeline',
          title: 'Un pas de temps simulé',
          legend: { mine: 'Code de simulation', upstream: 'Contrôle qui ne partage aucun code avec les planificateurs' },
          loopLabel: 'À chaque pas de temps, jusqu’à la fin de l’heure ou l’interblocage de la flotte',
          caption:
            'Après chaque pas de temps, un contrôle de sécurité recompte les conflits de sommet et d’échange à partir des seules positions, parce qu’un gestionnaire ne peut pas se porter garant de lui-même. Un conflit lève une erreur au lieu d’être compté.',
          nodes: [
            { label: 'Commandes à graine fixée', detail: 'de la prise à la dépose, une file qui ne se vide jamais', mine: true },
            { label: 'Répartiteur (dispatcher)', detail: 'robot libre le plus proche, verrous de stations', mine: true, loop: true },
            { label: 'Gestionnaire de trafic', detail: 'naïf : son propre itinéraire A*, attente, replanification locale. Réservation : A* espace-temps contre la table de réservations', mine: true, loop: true },
            { label: 'Déplacement joint du pas de temps', detail: 'un pas de temps dure 1 s, une cellule fait 1 m', mine: true, loop: true },
            { label: 'Contrôle de sécurité', detail: 'conflits de sommet et d’échange, recomptés à partir des positions', mine: false, loop: true },
            { label: 'Positions au pas de temps suivant', detail: 'livraisons et test d’interblocage', mine: true, loop: true },
          ],
        },
      ],

      results: [
        {
          kind: 'text',
          title: 'Résultats de l’étude personnelle',
          body: ['Tout ce qui suit vient d’amr-traffic-lab, ma propre étude par simulation. Rien de cela n’est un résultat du projet de promotion.'],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 600',
              meaning:
                'simulations d’une heure bloquées avec le gestionnaire à réservation, sur trois plans et dix tailles de flotte jusqu’à 16 robots, 20 graines par cellule.',
            },
            {
              from: '427,2',
              value: '528,9',
              unit: 'commandes/h',
              meaning:
                'Atelier ouvert, 16 robots : commandes livrées par heure avec le gestionnaire naïf, puis avec le gestionnaire à réservation (24 % de plus). Chacune est la moyenne de 20 simulations d’une heure à graine fixée.',
            },
            {
              value: '0',
              meaning:
                'conflit de sommet ou d’échange sur 3 473 858 pas de temps simulés (1 200 simulations, les deux gestionnaires), comptés par un contrôle qui ne partage aucun code avec les planificateurs.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Chaque cellule de l’étude en flux continu (lifelong) est faite de 20 simulations d’une heure à graine fixée ; les nombres sont réécrits par scripts/reproduce.py et vérifiés contre le README par scripts/check_readme.py. Simulation sur grille, avec une demande saturée : elle mesure la capacité.',
          head: ['Ce qui a été mesuré', 'Valeur', 'Comment le lire'],
          rows: [
            ['Atelier ouvert, 16 robots : commandes par heure, naïf puis réservation', '427,2 → 528,9', 'Le gestionnaire naïf se bloque rarement dans l’atelier ouvert (3 simulations sur 200), c’est donc la comparaison juste. Dans les allées étroites, il se bloque dans 95 simulations sur 200.'],
            ['Allées étroites, 16 robots : simulations bloquées avec le gestionnaire naïf', '19 / 20', 'Commandes par heure : 117,7 (plage de 2 à 445) contre 776,1 avec la réservation.'],
            ['Couloir unique, 2 robots ou plus : simulations bloquées avec le gestionnaire naïf', '180 / 180', 'Structurel, pas une surprise : une voie unique sans zone de croisement bloque tout gestionnaire qui laisse les robots entrer par les deux bouts et ne recule jamais. Un verrou qui n’admet qu’un sens à la fois serait une référence plus juste, et l’étude n’en mesure pas.'],
            ['Couloir unique, gestionnaire à réservation : commandes par heure avec 10 robots, puis 16', '299,7 → 303,4', 'Le seul vrai palier : l’allée est la limite, avec 27,7 % du temps de trajet passé à attendre la voie à 16 robots. Sur les deux autres plans, la courbe monte encore à 16 robots.'],
            ['Allées étroites, 8 agents, planification en une passe : instances résolues par CBS, puis par planification par priorités', '5 / 25 → 17 / 25', 'Le CBS retourne la somme des coûts optimale mais épuise son budget de 2 000 nœuds. La planification par priorités répond en millisecondes (médiane de 2,38 ms contre 944 ms).'],
            ['CBS contre une recherche exhaustive sur 400 petites instances aléatoires', '334 / 334', 'Le coût égale l’optimum en espace d’états joint sur chaque instance que le CBS a terminée. Sur les 336 instances résolubles, 2 ont épuisé le budget.'],
          ],
        },
        {
          kind: 'media',
          media: 'usineThroughput',
          wide: true,
          alt: 'Six petits graphiques, trois plans côte à côte. Ligne du haut : commandes livrées par heure en fonction du nombre de robots, le gestionnaire à réservation en bleu au-dessus du gestionnaire naïf en orange. Ligne du bas : simulations bloquées sur 20. Le gestionnaire à réservation ne se bloque jamais ; dans les allées étroites et le couloir unique, le gestionnaire naïf se bloque de plus en plus souvent.',
          caption:
            'Commandes livrées par heure (haut) et simulations bloquées sur 20 (bas) en fonction de la taille de la flotte, pour l’atelier ouvert, les allées étroites et le couloir unique. Ligne : moyenne de 20 simulations d’une heure à graine fixée. Bande : minimum à maximum. Dessiné par scripts/reproduce.py. Les légendes du graphique sont en anglais : open floor, narrow aisles, single corridor.',
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 25',
              meaning:
                'instances en une passe des allées étroites à 12 agents que le Conflict-Based Search a résolues dans son budget de 2 000 nœuds. La planification par priorités en a résolu 3 sur 25.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'Le projet de promotion n’est pas terminé.', text: 'Il est en cours, donc rien n’en est montré, mesuré ni revendiqué sur cette page.' },
            { title: 'Le résultat du couloir est structurel.', text: 'Le gestionnaire naïf ne recule jamais, et une voie unique n’a pas de zone de croisement : son résultat sur le couloir surestime donc ce que les réservations apportent par rapport à un verrou qui n’admet qu’un sens à la fois. L’atelier ouvert et les allées étroites sont les comparaisons les plus justes.' },
            { title: 'Le CBS ne passe pas à l’échelle ici.', text: 'C’est du Conflict-Based Search simple, avec un budget de nœuds et sans aucune des améliorations qui rendent les solveurs modernes rapides, et il ne peut pas prouver qu’une instance est insoluble. C’est une référence pour de petites instances seulement.' },
            { title: 'Un monde de grille.', text: 'Les déplacements prennent un pas de temps sur une grille 4-connexe : pas d’accélération, de temps de rotation, d’empreinte de robot ni d’erreur de localisation. Les chemins réservés sont exécutés parfaitement, alors qu’une vraie flotte a besoin de marges ou de replanification quand un robot est en retard.' },
            { title: 'Une demande sans fin, ni batteries, ni machines.', text: 'Les chargeurs sont des places de stationnement, les stations sont toujours prêtes et la file de commandes ne se vide jamais. L’étude mesure la capacité, pas le temps d’attente d’une commande dans une file.' },
            { title: 'Trois plans dessinés à la main, des flottes jusqu’à 16.', text: 'Dans l’atelier ouvert et les allées étroites, la meilleure flotte est une borne inférieure, puisque la courbe monte encore à 16 robots, le maximum que les chargeurs peuvent garer. Les allées à sens unique, la solution d’ingénierie habituelle, ne sont pas étudiées.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'amr-traffic-lab est un projet personnel écrit en octobre 2026 avec l’aide d’une IA : ses commits portent la mention Co-Authored-By. Chaque nombre de cette page est régénéré par un script versionné, et un second script vérifie le README contre les résultats.' },
            { text: 'L’A* sur grille de l’étude est du code nouveau, pas le planificateur du stage à l’AIST.' },
            { text: 'Les méthodes viennent de la littérature : A* espace-temps avec table de réservations (Silver, 2005), Conflict-Based Search (Sharon, Stern, Felner et Sturtevant, 2015), et le cadre en flux continu (lifelong) bien formé (Ma, Li, Kumar et Koenig, 2017 ; Čáp, Vokřínek et Kleiner, 2015).' },
          ],
        },
      ],

      links: [
        { label: 'amr-traffic-lab : l’étude par simulation (dépôt)', href: 'https://github.com/guilhem0908/amr-traffic-lab' },
        { label: 'La même étude sur la page du labo, avec sa vidéo', href: '/fr/labo/#amr-traffic-lab' },
        { label: 'nav_3dgs_pano : le planificateur A* à un seul robot du stage à l’AIST', href: 'https://github.com/guilhem0908/nav_3dgs_pano' },
        { label: 'KachakaNavigation : l’interface ROS 2 préparée pour le robot Kachaka', href: 'https://github.com/guilhem0908/KachakaNavigation' },
      ],
    },
  },

  // -------------------------------------------------------------------------- labo
  lab: {
    kicker: 'Labo',
    title: 'Projets personnels',
    intro: 'De petites études qui reprennent une question laissée ouverte par mon travail et y répondent par une mesure.',
    disclosure:
      'Ce sont des projets personnels, réalisés en octobre 2026 avec l’aide d’une IA : leurs commits portent la mention Co-Authored-By. Chaque nombre ci-dessous est reproduit par un script versionné dans le dépôt.',
    labels: { shows: 'Ce que montre la vidéo', result: 'Un résultat', stack: 'Technologies', extends: 'Origine' },
    projects: {
      erpkit: {
        what: 'Une boîte à outils NumPy testée pour la géométrie d’images 360° (équirectangulaire, cubemap, pinhole, rigs multi-vues), qui mesure ce que coûte vraiment l’assemblage de vues en panorama.',
        shows: 'Une caméra pinhole de 90° balaie un panorama équirectangulaire d’une pièce procédurale, son empreinte dessinée sur le panorama à côté de la vue extraite. En dessous, un rig de 14 vues est assemblé vue par vue sur une carte du nombre de vues qui voient chaque direction.',
        result: {
          from: '5,6',
          value: '1,06',
          meaning: 'Rapport de saut à la couture avec un écart d’exposition de ±5 % entre les vues, cube strict contre faces de 96° avec feathering (moyenne sur 3 graines aléatoires, 1 = invisible). Le feathering masque l’écart plutôt qu’il ne le corrige : le WS-PSNR reste à 35,5 dB.',
        },
        extends: 'Le stage assemblait six vues pinhole en panoramas avec une cubemap à recouvrement. La taille des faces, le recouvrement et la largeur du fondu (feathering) sont des réglages dont ce projet quantifie le coût, avec son propre code et ses propres images.',
      },
      microsplat: {
        what: 'Du 3D Gaussian Splatting assez court pour se lire d’une traite : un rasteriseur de référence en NumPy, son jumeau différentiable en PyTorch, et des tests qui verrouillent chaque équation.',
        shows: 'Quatre panneaux dans une optimisation qui part de gaussiennes aléatoires, puis une orbite de vues mises de côté : la cible en lancer de rayons, le rendu, l’erreur absolue et les contours des gaussiennes projetées.',
        result: {
          value: '33,6',
          unit: 'dB',
          meaning: 'PSNR sur des vues mises de côté de la scène de formes en lancer de rayons après 3 000 itérations à partir de gaussiennes aléatoires, avec contrôle adaptatif de la densité (moyenne de 3 graines aléatoires).',
        },
        extends: 'Pendant le stage, tout passait par des moteurs de rendu existants : 3DGRUT, Splatfacto et DISCOVERSE. Ce projet ouvre le moteur de rendu : la passe avant réécrite d’après les articles, rendue différentiable, un test par équation.',
      },
      'gaussian-projection-bench': {
        what: 'Une étude numérique des deux façons de transformer une gaussienne 3D en gaussienne 2D, la linéarisation EWA et la transformée unscented, à travers des caméras pinhole, fisheye et équirectangulaires, contre une référence Monte-Carlo dont le plancher de bruit est lui-même rapporté.',
        shows: 'Une gaussienne 3D isotrope glisse vers le bord d’une image fisheye à 180°, puis vers le pôle d’une image équirectangulaire. Gris : la densité Monte-Carlo de sa projection. Orange : l’ellipse EWA. Bleu : l’ellipse de la transformée unscented et ses sept points sigma.',
        result: {
          from: '18',
          value: '44',
          unit: 'px',
          meaning: 'Écart type du splat à partir duquel l’erreur de projection dépasse un demi-pixel (2-Wasserstein) à 45° hors axe dans une caméra pinhole : EWA avec le jacobien exact, puis la transformée unscented avec les points sigma de 3DGUT.',
        },
        extends: 'La plupart des moteurs de rendu gaussiens supposent une caméra en perspective, c’est pourquoi le stage rendait six vues pinhole et les assemblait. Ce projet mesure ce que coûte chaque approximation, en pixels, y compris près des pôles d’un panorama.',
      },
      'amr-traffic-lab': {
        what: 'Une étude par simulation (graines aléatoires fixées) de l’intralogistique de l’usine connectée (Usine 4.0, Industrie 4.0) : combien de robots mobiles autonomes une allée d’usine peut accueillir avant de se bloquer, avec l’invariant « zéro collision » vérifié à chaque pas de temps.',
        shows: 'Le même plan d’usine rejoué deux fois, deux halls reliés par un couloir à voie unique, avec les mêmes 12 robots. À gauche : avec le gestionnaire naïf, les robots se rencontrent de face dans le couloir et s’arrêtent pour de bon. À droite : avec le gestionnaire à réservation, ils passent chacun à leur tour et le compteur de commandes livrées continue de monter.',
        result: {
          value: '0 / 600',
          meaning: 'simulations d’une heure bloquées avec le gestionnaire à réservation, sur trois plans. Dans l’atelier ouvert, il livre aussi 24 % de commandes de plus par heure que le gestionnaire naïf avec 16 robots (528,9 contre 427,2).',
        },
        extends: 'Le planificateur du stage déplaçait un robot sur une carte vide. Ce projet ajoute le temps, une table de réservations et du Conflict-Based Search, et mesure la flotte. Il est indépendant du projet de promotion de dernière année sur l’Usine 4.0.',
      },
    },
    outro: 'Une question sur l’un d’eux ? Mon e-mail est en bas de la page.',
  },
};

export default frenchTypography(fr);
