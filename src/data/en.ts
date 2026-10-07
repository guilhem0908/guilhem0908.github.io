// English copy. Every sentence is supported by FACTS.md or by a published README.
// Fields marked CONFIRM rest on Guilhem's word or on an assumption: keep them short, edit them here.
// A French file (fr.ts) with the same shape switches the French routes on: see data/index.ts.

import type { SiteContent } from './types';

const en: SiteContent = {
  lang: 'en',
  locale: 'en-GB',

  meta: {
    homeTitle: 'Guilhem Carmouze | Robotics and 3D Gaussian Splatting',
    homeDescription:
      'Final-year robotics student in Toulouse, AIST research intern (Japan, 2026): 3D Gaussian Splatting, robot navigation, Industry 4.0 smart factory (Usine 4.0).',
    labTitle: 'Lab: side projects | Guilhem Carmouze',
    labDescription:
      'Eight side projects: 3D Gaussian Splatting, 360° geometry, navigation maps, cone SLAM, and robots, data and inspection in an Industry 4.0 smart factory (Usine 4.0).',
    ogAlt: 'The name Guilhem Carmouze over a building made of Gaussian splats, drawn like a blueprint, with a red planned path leading through a doorway',
  },

  ui: {
    skipToContent: 'Skip to content',
    nav: {
      label: 'Main',
      home: 'Guilhem Carmouze, home',
      work: 'Work',
      lab: 'Lab',
      cv: 'CV',
      github: 'GitHub',
      switchTo: 'FR',
      switchLabel: 'Version française',
    },
    readCase: 'Read the case study',
    caseSoon: 'Case study',
    backToRun: 'Back to the run',
    code: 'Code',
    report: 'Report (PDF)',
    video: 'Video',
    repository: 'Repository',
    repositoryLabel: 'Repository:',
    external: 'opens on another site',
    caseLabels: {
      role: 'Role',
      team: 'Team',
      period: 'Period',
      organisation: 'Organisation',
      stack: 'Stack',
      summary: 'In three lines',
      problem: 'Problem',
      built: 'What I built',
      result: 'Result',
      context: 'Context',
      builtTitle: 'What I built',
      results: 'Results',
      failed: 'What failed or is unfinished',
      credits: 'Credits',
      links: 'Links',
      next: 'Next project',
      nextLab: 'Lab: side projects',
    },
    footer: {
      rights: 'Guilhem Carmouze, Toulouse, France.',
      built: 'The world on the home page is generated in your browser: procedural 3D Gaussians, an occupancy grid sliced from them, an A* path.',
      contact: 'Write to me',
    },
  },

  person: {
    line: 'Final-year robotics engineering student at UPSSITECH, in Toulouse. Research intern at AIST, Japan, in 2026. I work on 3D Gaussian Splatting, 360° vision and robot navigation.',
    school: 'UPSSITECH, engineering school of the University of Toulouse. Robotic and Interactive Systems programme (SRI). Graduating June 2027.',
    city: 'Toulouse, France',
    languages: 'French (native), English (professional), Spanish (basic)',
  },

  // CONFIRM dates
  seeking: {
    tag: 'Open to',
    short: '6-month end-of-studies internship, from March 2027',
    long: 'Looking for a 6-month end-of-studies internship starting March 2027.',
    fields: 'Robotics, 3D vision, autonomous navigation, robot perception, AI.',
  },

  home: {
    heroLinks: { cv: 'CV', github: 'GitHub', linkedin: 'LinkedIn', email: 'Email', skip: 'Skip the run: project index' },
    cue: { scroll: 'Scroll to move forward', swipe: 'Swipe up to move forward', start: 'Start the run' },
    posterAlt: 'A building made of Gaussian splats, drawn like a blueprint, with a red planned path leading through a doorway',
    start3d: 'Start the 3D run',

    run: {
      intro: {
        building: 'Building the scene',
        training: 'Training',
        slicing: 'Slicing the occupancy grid',
        planning: 'Planning with A*',
        iterations: '/ 30,000 iterations',
        gaussians: 'Gaussians',
        residual: 'Residual',
        grid: 'Occupancy grid',
        path: 'A* path',
        pending: 'pending',
        cells: 'cells, 10 cm',
        skip: 'Skip the intro: scroll, click or press a key',
      },
      hud: {
        label: 'Run instruments',
        waypoint: 'Waypoint',
        pose: 'Pose',
        run: 'Run',
        gaussians: 'Gaussians',
        mapAlt: 'Occupancy grid of the building with the planned path and the current position',
        jump: 'Jump to a waypoint',
        planView: 'Plan view',
      },
      zones: { lobby: 'Lobby', vestibule: 'Vestibule', aist: 'AIST room', track: 'Cone track', factory: 'Factory hall', pen: 'Fil rouge pen' },
      view: { prefix: 'View:', colour: 'colour', depth: 'depth', ellipsoids: 'ellipsoids' },
      lens: { depth: 'Lens: depth (L)', ellipsoids: 'Lens: raw ellipsoids (L)' },
      bearing: 'Ball bearing',
      perf: {
        title: 'Performance',
        frame: 'Frame',
        gpu: 'GPU time',
        scale: 'Render scale',
        level: 'level',
        splats: 'Gaussians drawn',
        sort: 'Depth sort',
        long: 'Last long frame',
        device: 'GPU',
        none: 'none',
        auto: 'Auto',
        script: 'script',
        browser: 'browser',
      },
    },

    waypoints: {
      hero: 'Start',
      aist: 'AIST, 360° dataset',
      tlse: 'TLSe Racing',
      usine: 'Usine 4.0',
      pfr: 'Projet Fil Rouge',
      lab: 'Lab',
      work: 'Project index',
      contact: 'Contact',
    },

    aist: {
      kicker: 'Research internship, AIST, Tsukuba, Japan. April to August 2026.',
      title: 'Creation of a 360-degree navigation dataset using 3D Gaussian Splatting',
      host: 'Computer Vision Research Team, Artificial Intelligence Research Center, AIST (National Institute of Advanced Industrial Science and Technology).',
      giant: '360°',
      stageTitle: 'The source camera sees about 12% of the sphere per pose.',
      text: [
        'A visual navigation model needs 360° observations. A scene rebuilt from a plain video only holds what the camera saw: rendered as a full panorama, the rest comes out as floaters and needles.',
        'ArtiFixer-360, my extension of NVIDIA’s ArtiFixer, repairs the views jointly with a video diffusion model and distils them back into the 3D scene.',
        'The full 154-frame run failed my own acceptance gates, which led to a geometry-first redesign.',
      ],
      rawLabel: 'Raw 3DGRUT render',
      fixedLabel: 'After ArtiFixer3D+',
      caption: 'Real output of an early run on a 154-frame clip. No gate verdict is recorded for it.',
      stillAlt: '360-degree panorama of a living room. Left of the divider: raw 3DGRUT render full of floaters and needles. Right: the repaired output.',
      slider: 'Position of the divider between the raw and the repaired panorama',
      roomNote: 'The room around you is built from this panorama.',
      figures: {
        rig: {
          value: '14',
          meaning: 'overlapping 110° views per pose, in a rig that follows the real camera path, repaired jointly by NVIDIA’s 14B video diffusion model.',
        },
        depth: {
          value: '−27%',
          meaning: 'cross-view depth error of the repaired views (MAE 0.0340 to 0.0247) with depth-aware synchronisation, before distillation. The gain did not clearly survive distillation.',
        },
      },
    },

    // CONFIRM: rests on Guilhem's word only. One short, team-framed entry. No metric.
    svlr: {
      title: 'SVLR, with Alec Bossard',
      text: 'At AIST I also took part, with my classmate Alec Bossard, in extending SVLR (Scalable, Training-Free Visual Language Robotics; Samson, Muraccioli, Kanehiro, CNRS-AIST JRL) towards memory-dependent manipulation.',
      link: 'Results are in Alec’s technical report',
    },

    tlse: {
      kicker: 'TLSe Racing, Formula Student driverless team. 2025 to 2026.',
      title: 'The simulation layer of a driverless race car',
      marquee: 'Formula Student driverless',
      mine: 'My part is the simulation and tooling layer: a 2D Pygame simulator with a fit-to-track camera, a typed CSV cone-track loader, a car at Formula Student scale, and a configurable field-of-view sensor model that selects the visible cones.',
      team: 'The planners are my teammates’ work: Alec Bossard (midpoint centerline, B-spline, first reactive controller) and TJeanm (RRT*, smoothing).',
      also: 'I also worked on cone-detection models in PyTorch and on image-processing and control modules with ROS, Python and C++.',
      demo: 'Try the sensor model: set its range and opening angle, the cones it selects light up.',
      range: 'Range',
      opening: 'Opening',
      selected: 'cones selected',
    },

    // CONFIRM: nothing else is known. Do not add a partner, a platform, a robot or a result.
    usine: {
      kicker: 'Final-year team project. 2026 to 2027.',
      title: 'Usine 4.0',
      status: 'In progress',
      text: 'This year my class runs a team project on the Industry 4.0 smart factory (Usine 4.0), one of the sectors the SRI programme trains for. It is in progress: there is nothing to show yet.',
      note: 'The hall, its workstations and its mobile robots are an illustration generated in your browser, not project footage.',
    },

    pfr: {
      kicker: 'Projet Fil Rouge. First year of the engineering cycle, 2024 to 2025.',
      title: 'A real robot, driven from a web page',
      mine: 'In a team of six we built a mobile robot: Arduino motor control, Raspberry Pi camera, LiDAR mapping, voice commands, ball tracking. My part was the web interface: a single-page app that drives the robot over the Web Bluetooth API (a page reload would drop the link), the live MJPEG camera stream, and the algorithm that turns the ball’s image coordinates into drive commands to keep it centred.',
      team: 'Mapping, voice recognition, motor control and image processing were done by my teammates Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard and Fairouz Ijerdaoun.',
      before: 'The semester before, with Alec Bossard: a colour-ball detector in pure C11, no OpenCV.',
      feedWall: 'On the wall:',
      feed: 'Camera feed of the real robot with the tracked balls. Team demo recording.',
      hmi: 'The web interface on a phone, driving the real robot. Team demo recording.',
      demo: 'Move the pointer over the pen: the ball follows it and the robot keeps it centred.',
      robotAlt: 'The team’s four-wheeled robot in its test arena, next to its live LiDAR scan and the map built from it',
    },

    lab: {
      title: 'Lab: side projects',
      text: 'Eight personal side projects that extend themes of the work above. Built in October 2026 with AI assistance; every number is reproduced by a script in its repository.',
      more: 'Open the lab',
      others: 'Also in the lab',
    },

    index: {
      title: 'Project index',
      text: 'The run, without the run.',
      room: 'See it in the run',
      rows: {
        'aist-360-navigation': {
          when: '2026',
          name: 'AIST research internship',
          line: '360° navigation data from 3D Gaussian Splatting: A* and panoramas in simulation, then a video-diffusion repair pipeline, reported with the run that failed.',
        },
        'tlse-racing-driverless': {
          when: '2025 to 2026',
          name: 'TLSe Racing driverless',
          line: 'The simulation and tooling layer of a Formula Student driverless team: 2D simulator, cone-track loader, field-of-view sensor model.',
        },
        'projet-fil-rouge': {
          when: '2024 to 2025',
          name: 'Projet Fil Rouge',
          line: 'A real mobile robot built by a team of six. My part: the Web Bluetooth interface, the camera stream and the ball-centring command.',
        },
        'usine-4-0': {
          when: '2026 to 2027',
          name: 'Usine 4.0',
          line: 'Final-year team project on the Industry 4.0 smart factory (Usine 4.0). In progress.',
        },
      },
    },

    contact: { title: 'End of run.' },
  },

  // ------------------------------------------------------------------ case studies
  work: {
    'aist-360-navigation': {
      metaTitle: '3D Gaussian Splatting for 360° navigation | Guilhem Carmouze',
      metaDescription:
        'Research internship at AIST (Japan): 360° observations for robot navigation from 3D Gaussian Splatting scenes, a repair pipeline, and its negative results.',
      kicker: 'Research internship, AIST, Tsukuba, Japan. April to August 2026.',
      title: 'Creation of a 360-degree navigation dataset using 3D Gaussian Splatting',
      outcome:
        'Four months of research, from an A* planner and six-view panoramas in simulation to ArtiFixer-360, a pipeline that turns a plain pinhole video into a 360° video, reported with the run that passed its quality gates and the run that failed them.',
      window: { word: '360°', media: 'panoRepaired' },
      meta: {
        role: 'Research intern, in my fourth year. Author of nav_3dgs_pano and KachakaNavigation, and of the 360° extension in artifixer-360-pipeline, a derivative of NVIDIA ArtiFixer.',
        team: 'Computer Vision Research Team, Artificial Intelligence Research Center (AIRC)',
        period: '15 April to 21 August 2026',
        organisation: 'AIST, National Institute of Advanced Industrial Science and Technology, Tsukuba, Japan',
        stack: 'Python, PyTorch, 3DGRUT, Splatfacto, COLMAP, DISCOVERSE, MuJoCo, ArtiFixer (video diffusion), ROS 2 Humble, PBS and Singularity on the ABCI cluster, pytest',
      },
      lead: {
        kind: 'compare',
        before: 'panoRaw',
        after: 'panoRepaired',
        beforeLabel: 'Raw 3DGRUT render',
        afterLabel: 'After the first ArtiFixer3D+ run',
        alt: '360-degree equirectangular panorama of a living room, shown twice. Raw render: floaters, needles and holes wherever the camera never looked. Repaired: the same view with most of them gone.',
        caption:
          'One frame of the raw 3DGRUT render of the reconstructed scene, projected to an equirectangular panorama, and the same frame after the first ArtiFixer3D+ run on that 154-frame clip. Most holes and splatting noise are removed; residual warping and duplicated structures remain, and regions the camera never saw are generated, not observed. This early run is neither the 117-frame reference run that passed the gates nor the later run that failed them.',
        slider: 'Position of the divider between the raw and the repaired panorama',
      },
      summary: {
        problem:
          'A visual navigation model needs 360° observations with poses and commands. A scene rebuilt from a plain video only holds what the camera saw: about 12% of the sphere per pose.',
        built:
          'A simulation that plans, drives and renders 4096 × 2048 panoramas inside a 3D Gaussian scene; a ROS 2 interface prepared for the Kachaka robot; and ArtiFixer-360, which repairs 14 overlapping views jointly with a video diffusion model and distils them back into the 3D scene.',
        result:
          'Depth-aware synchronisation lowered cross-view depth error by 27% before distillation, and a 117-frame reference run passed its gates. The full 154-frame run failed them, which led to a geometry-first redesign.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'From April to August 2026, in my fourth year, I was a research intern in the Computer Vision Research Team of the Artificial Intelligence Research Center (AIRC) at AIST, in Tsukuba, Japan. The internship ran in English and ends in a 29-page report.',
            'The goal: produce 360° equirectangular observations, with poses and commands, for robot visual navigation, from scenes represented with 3D Gaussian Splatting (3DGS).',
            'The difficulty is coverage. ArtiFixer, the repair model, was trained on pinhole video. A panorama needs the whole sphere, while the source camera used during development sees 12.06% of it at one pose (a 93.72° × 60.93° field of view). Everything else has to be rendered from Gaussians that were never observed from there.',
          ],
        },
        {
          kind: 'media',
          media: 'aistOutput',
          alt: 'An equirectangular panorama of a house interior: hallway, mirror, doors and wooden floor, bent by the projection.',
          caption: 'Output: one frame of the equirectangular 360° video. The input is a plain pinhole video; it is third-party footage and is not shown here.',
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'Phase 1, May',
              title: 'Navigation and panoramic rendering in a supplied 3DGS scene',
              body: 'A DISCOVERSE and MuJoCo simulation: a 5 cm occupancy grid, A* planning and waypoint following. At each waypoint six co-located pinhole views are re-projected to a 4096 × 2048 equirectangular panorama with a custom overlapped cubemap (96° faces) and feather blending. Every panorama is logged with its position and heading; the velocity commands are recorded by the navigation script, which renders no panorama.',
              note: 'Simulation only: the pose is simulator ground truth, the base is moved kinematically and the scene was supplied as a .ply file. No 3DGS training happens in that repository.',
              repo: 'nav_3dgs_pano',
              repoNote: 'about 4,000 lines of Python, sole author',
            },
            {
              tag: 'Phase 2, May',
              title: 'Building the scene from a plain video',
              body: 'A COLMAP and Splatfacto baseline, measured on a 70/30 split at PSNR 26.08 dB and SSIM 0.91 after 30,000 iterations, then 28.69 dB and 0.94 after 60,000.',
            },
            {
              tag: 'Phase 3, June',
              title: 'Reconstruction against world generation, and a robot interface',
              body: 'I compared Matrix-3D, HY-World 2.0 and ExploreGS with navigation-oriented criteria: 360° coverage, useful radius and MEt3R p90. In parallel I prepared a ROS 2 Humble deployment interface for a visual navigation model (NoMaD) on the Kachaka mobile robot: four nodes (image relay, model, command sender, robot executor), stale-frame rejection at 0.5 s, a velocity clamp at 0.2 m/s and 0.5 rad/s, a 20 Hz dead-man timer, a dry-run mode and a typed wrapper over kachaka-api (gRPC).',
              note: 'On main, the NoMaD inference is not wired in, and no complete navigation run on the real Kachaka is claimed.',
              repo: 'KachakaNavigation',
              repoNote: 'about 3,600 lines plus tests',
            },
            {
              tag: 'Phase 4, July',
              title: 'Repairing incomplete renders',
              body: 'I applied NVIDIA ArtiFixer, a video diffusion model, to panoramas and diagnosed why they break: the source camera sees about 12% of the sphere per pose, and repairing the cube faces independently raised the seam-failure rate from 0.34 to 0.83.',
            },
            {
              tag: 'Phase 5, August',
              title: 'The ArtiFixer-360 pipeline',
              body: 'Pinhole video, COLMAP, a 3DGRUT Gaussian scene, then a world-locked rig of 14 overlapping 110° views that follows the real camera path. The 14 streams are repaired jointly by the 14B video diffusion model, synchronised during denoising through a depth and occlusion-aware reprojection graph, distilled back into the 3D scene with the geometry locked, and rendered as an equirectangular 360° video.',
              note: 'A derivative of NVIDIA nv-tlabs/ArtiFixer, under Apache-2.0.',
              repo: 'artifixer-360-pipeline',
              repoNote: 'my delta over upstream: +23,602 / −630 lines, 121 new files',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'ArtiFixer-360, from a plain video to a 360° video',
          legend: { mine: 'Added or extended in my repository', upstream: 'Input, output and upstream components' },
          loopLabel: 'Render, repair, distil: the repaired views go back into the shared scene',
          caption:
            'COLMAP preparation and the 3DGRUT scene come with upstream ArtiFixer, and the 14B diffusion model is NVIDIA’s. The rig, the joint 14-stream loop, the reprojection graph, the distillation controls, the stitcher and the quality gates were added or extended during the internship.',
          nodes: [
            { label: 'Pinhole video', mine: false },
            { label: 'COLMAP poses', mine: false },
            { label: 'Shared 3D Gaussian scene', detail: '3DGRUT', mine: false },
            { label: 'World-locked rig', detail: '14 views, 110° field of view, real camera centres', mine: true, loop: true },
            { label: 'Joint repair', detail: '14 streams, 77-frame windows, synchronised through a depth and occlusion-aware reprojection graph', mine: true, loop: true },
            { label: 'Geometry-locked distillation', detail: 'back into the 3D scene', mine: true, loop: true },
            { label: 'Frustum-to-ERP stitching', detail: 'of the final renders', mine: true },
            { label: '360° ERP video', mine: false },
            { label: 'Reference-free quality gates', detail: 'decide whether a run is published', mine: true },
          ],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '14',
              meaning: 'overlapping 110° views per pose: six on the horizon, four pitched up by 45° and four pitched down. They share the real camera centre, so two views differ by a pure rotation.',
            },
          ],
        },
        {
          kind: 'media',
          media: 'aistRigCoverage',
          wide: true,
          alt: 'Two equirectangular maps. Left: number of rig views covering each direction, from 2 to 5, with the small field of view of the source camera outlined in yellow at the centre. Right: which of the 14 views owns each direction when stitching.',
          caption:
            'Coverage of the sphere by the 14-view rig, recomputed by a script in the repository: every direction is seen by at least 2 and at most 5 views, 3.27 on average. The yellow outline is what the source camera sees at one pose: 12.06% of the sphere.',
        },
        {
          kind: 'text',
          title: 'What sits around the model',
          body: [
            'My delta over the upstream NVIDIA code is +23,602 / −630 lines across 145 files (121 new, 24 modified), including 32 new test modules (119 tests). It covers the trajectory and rig generators, the joint multi-view inference loop, the distillation controls, the frustum-to-panorama stitcher, and PBS and Singularity jobs for the 4-GPU nodes of the ABCI cluster. A companion patch to NVIDIA 3DGRUT-ArtiFixer adds +506 / −74 lines.',
            'Because no ground-truth panorama exists, a run is judged by reference-free quality gates: cross-view depth overlap, optical-flow temporal warp, wrap-seam ratio, edge retention and a bitwise audit that the locked geometry did not move.',
          ],
        },
      ],

      results: [
        {
          kind: 'figures',
          items: [
            {
              value: '−27%',
              meaning: 'Cross-view depth-overlap MAE of the repaired views, without and with depth-aware synchronisation: 0.0340 to 0.0247. Measured before distillation, on the repaired pseudo-views.',
            },
            {
              from: '0.037',
              value: '0.020',
              meaning: 'Optical-flow temporal warp MAE, raw renders against the output, on the 117-frame reference run: 14 views, 1,638 renders, about 20 minutes of wall-clock time on one 4-GPU node.',
            },
          ],
        },
        {
          kind: 'table',
          caption: 'Values come from GPU runs made during the internship and are transcribed in the repository from its dated records. Lower is better, except for PSNR, SSIM and edge strength.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['Cross-view depth-overlap MAE of the repaired views, before distillation, without and with depth-aware synchronisation', '0.0340 → 0.0247', 'Positive, limited scope: measured on the repaired views, not on the final panorama.'],
            ['The same change after distillation, on the final panorama: temporal warp MAE, first run against the depth and loop variant', '0.0233 against 0.0258', 'Negative: the gain did not clearly survive distillation.'],
            ['117-frame reference run: temporal warp MAE, raw renders to output', '0.037 → 0.020', 'Positive, with a caveat: any smoothing lowers this metric, so it is read together with edge retention.'],
            ['Same run: edge strength kept in high-confidence regions (1 = fully kept)', '0.49 median', 'Part of the stability comes with softer detail.'],
            ['Baseline before the pipeline: video, COLMAP, Splatfacto, 70/30 split', '26.08 dB / 0.91 at 30k, 28.69 dB / 0.94 at 60k', 'Context for the reconstruction stage (PSNR / SSIM).'],
          ],
        },
        {
          kind: 'media',
          media: 'aistDistill',
          alt: 'Two renders of the same hallway side by side: the first ArtiFixer3D+ run and the variant distilled with depth and loop constraints. Local structure differs, both still show distortions.',
          caption:
            'Left: first ArtiFixer3D+ run. Right: depth and loop distillation. The depth and loop branch changes local structure and appearance, but distortions remain: a qualitative diagnostic, not a claim of correct geometry.',
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '154',
              meaning: 'frames in the full 14-direction run. It reached complete coverage and failed my own visual and temporal acceptance gates. That result led to a geometry-first redesign.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'Repairing cube faces one by one made the seams worse.', text: 'The seam-failure rate went from 0.34 to 0.83. The approach was rejected after measurement; the final pipeline repairs the 14 views jointly.' },
            { title: 'The depth gain did not survive distillation.', text: 'Depth-aware synchronisation improves the agreement of the repaired views, but the current distillation does not preserve that gain in the final panorama.' },
            { title: 'No navigation run on the real robot.', text: 'On main, the NoMaD inference is not wired into the ROS 2 interface, and no closed-loop run on the Kachaka is claimed.' },
            { title: 'Phase 1 lives in simulation.', text: 'The pose is simulator ground truth, the base moves kinematically and the 3DGS scene was supplied, not trained there.' },
            { title: 'The May stitching code mirrored the panoramas.', text: 'They came out mirrored left to right. I found and fixed it in October 2026, with synthetic tests and AI assistance; the fix is checked against MuJoCo’s own renderer and synthetic rooms, not confirmed on a render of the lab scene.' },
            { title: 'Not a solved problem.', text: 'The method does not guarantee panoramas without visible seams or with correct geometry. The evidence is limited to two indoor clips and to reference-free metrics.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'ArtiFixer-360 is a derivative of NVIDIA’s ArtiFixer (nv-tlabs/ArtiFixer, Apache-2.0). The diffusion model, the base inference code and 3DGRUT are NVIDIA’s work; my modifications are itemised file by file in the repository.' },
            { text: 'The 3DGS scene of phase 1 was supplied by the lab. The simulation runs on DISCOVERSE and MuJoCo.' },
            { text: 'The two indoor clips behind the results are third-party video that I did not film. The footage itself is not shown: every picture of those rooms on this page is a 3D Gaussian render or a model output derived from it. The repository does not record the source or the licence of either clip.' },
            { text: 'The GPU runs were made on 4-GPU nodes of the ABCI cluster.' },
            { text: 'AI assistance: as declared in the appendix of my report, AI tools were used for research, for writing code and for spell-checking, not for running the experiments or producing the results.' },
          ],
        },
      ],

      links: [
        { label: 'artifixer-360-pipeline: the repair pipeline', href: 'https://github.com/guilhem0908/artifixer-360-pipeline' },
        { label: 'nav_3dgs_pano: navigation and panoramas in simulation', href: 'https://github.com/guilhem0908/nav_3dgs_pano' },
        { label: 'KachakaNavigation: ROS 2 interface for the Kachaka robot', href: 'https://github.com/guilhem0908/KachakaNavigation' },
        { label: 'Internship report, 29 pages (PDF)', href: 'https://github.com/guilhem0908/artifixer-360-pipeline/blob/main/docs/assets/readme/Rapport_de_stage_2026_CARMOUZE_Guilhem.pdf' },
        { label: 'Comparison video, raw render against repaired output (10 s, in the repository)', href: 'https://github.com/guilhem0908/artifixer-360-pipeline#final-report-and-qualitative-comparison' },
      ],
    },

    // ---------------------------------------------------------------- TLSe Racing
    // His part: the simulation and tooling layer (Nov 2025), then the closed loop and the benchmarks (Oct 2026).
    // The planners are Alec Bossard's and TJeanm's: always credited. 2D simulation only, never a car result.
    'tlse-racing-driverless': {
      metaTitle: 'TLSe Racing driverless simulator | Guilhem Carmouze',
      metaDescription:
        'The simulation layer of a Formula Student driverless team: a 2D cone-track simulator, a field-of-view sensor model and a closed loop. Nothing has run on a car.',
      kicker: 'TLSe Racing, Formula Student driverless team. 2025 to 2026, with a follow-up in October 2026.',
      title: 'The simulation layer of a driverless race car',
      outcome:
        'I wrote the 2D simulator, with its field-of-view sensor model, in which driving logic can be tried before anything runs on a car. In October 2026 I closed the loop: a controller that drives laps while seeing only what that sensor lets it see. All of it is 2D simulation.',
      meta: {
        role: 'Member of the driverless team. Author of the simulation and tooling layer (November 2025), then of the closed loop, the benchmarks, the tests and the CI (October 2026).',
        team: 'Alec Bossard (first reactive controller, midpoint planner) and TJeanm (RRT* planners, smoothing).',
        period: 'November and December 2025, then October 2026',
        organisation: 'TLSe Racing, Formula Student driverless team. The two repositories are team prototypes hosted on my GitHub account, not the team’s official software.',
        stack: 'Python, Pygame (pygame-ce), NumPy, SciPy, pytest, continuous integration, ffmpeg for the clips',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'tlseClosedLoop',
        alt: 'Two views of a simulated car driving one lap of a cone track. Left: the whole track, with blue and yellow cones, most of them dimmed because the car does not know them yet. Right: a follow view where a grey sensor sector sweeps in front of the car and the cones inside it carry a white ring.',
        caption:
          'One lap of the belgium track driven by the closed loop with the default sensor (4 m range, 100° field of view), played at twice the simulated speed. Left: the whole track. Right: a follow view. Dimmed cones are unknown to the car, cones in full colour are in its memory, cones with a white ring are inside the sensor sector right now. The red line is the centre line built from the blue and yellow pairs. 2D simulation, recorded off-screen by a script of the repository.',
      },
      summary: {
        problem:
          'The driverless team needed a place to try out driving logic before anything runs on a car, with a sensor that only shows the cones in front of the car.',
        built:
          'A 2D Pygame simulator with a fit-to-track camera, a typed CSV track loader and a configurable field-of-view sensor model (2025), then a closed loop with cone memory, pure pursuit and a referee, and a benchmark of my teammates’ planners (October 2026).',
        result:
          'With the default sensor the car completes three valid laps on each of the four bundled tracks and touches no cone on three of them; on the hairpin track it touches 11 per lap. 2D simulation: no lap time here predicts a car.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'In the 2025 to 2026 season I was a member of the driverless team of TLSe Racing, a Formula Student team. In November 2025 two of its members started a small simulator in Python and Pygame to try out driving logic before anything runs on a car: I wrote the simulation layer, Alec Bossard the first reactive controller.',
            'Two repositories came out of it, both team prototypes hosted on my account. TLSe_Racing_Driverless is the simulator. PathPlanning (November and December 2025) holds three offline planners that build a closed reference line around a cone track, and a viewer that drives a car along it. The planning code is my teammates’ work. The simulator, the viewer, the camera and the track loader are mine.',
            'In October 2026 I came back to both with what they lacked: measurements. In the simulator, a controller that completes laps from what the sensor sees. In PathPlanning, a command line, measures of the planned lines, a benchmark with committed results, tests and CI. My teammates’ code is left as they wrote it.',
          ],
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'November 2025',
              title: 'The simulation layer',
              body: 'A 2D Pygame simulator for Formula Student cone tracks: a typed CSV loader with a schema check, a camera that fits the track and zooms about the cursor, a car drawn at Formula Student scale, and a configurable field-of-view sensor model, a range and an opening angle, that selects the cones the car can see. The sensor model is purely geometric: no occlusion, no image processing.',
              note: 'Alec Bossard wrote the first reactive controller on top of it: it aims at the midpoint of the nearest visible blue and yellow cones.',
              repo: 'TLSe_Racing_Driverless',
              repoNote: 'the simulator',
            },
            {
              tag: 'November and December 2025',
              title: 'A viewer for the planners',
              body: 'In PathPlanning, three planners build a closed reference line around a cone track from the full cone map: a midpoint centre line fitted with a B-spline (Alec Bossard), and two RRT* variants with smoothing (TJeanm). My part is the Pygame viewer that moves a car along the line, its 2D camera, and the CSV loader for the 26 bundled cone maps.',
              note: 'The planners see every cone: there is no perception in this repository. By git blame at the end of 2025: 634 lines by TJeanm, 355 by me, 146 by Alec Bossard.',
              repo: 'PathPlanning',
              repoNote: 'offline planners and viewer',
            },
            {
              tag: 'October 2026',
              title: 'The closed loop',
              body: 'A controller that never reads the map. Every 20 ms it senses the cones inside the sensor sector, remembers them, pairs blue and yellow cones into gates, chains the gates ahead of the car into a local centre line and steers by pure pursuit with a speed target. A kinematic bicycle model moves the car, and a referee times the laps and counts cone contacts against the true map.',
              note: 'Written with AI coding assistance: the commits carry a Co-Authored-By trailer. It lives in its own package, separate from the 2025 files.',
              repo: 'TLSe_Racing_Driverless',
              repoNote: 'closed_loop/, scripts/, tests/',
            },
            {
              tag: 'October 2026',
              title: 'Measuring the planners',
              body: 'A command line to run any planner on any of the 26 tracks, measures of the planned lines (closest approach to a cone, share of the line that stays between the two rows), a benchmark of 78 runs with its results committed, tests and CI. The planners themselves were not changed.',
              note: 'Same AI assistance, same trailer.',
              repo: 'PathPlanning',
              repoNote: 'planner registry, metrics, benchmark',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'The closed loop: what the car computes',
          legend: { mine: 'My code', upstream: 'Input data' },
          loopLabel: 'Every 20 ms: sense, remember, pair, order, steer, move. The new pose goes back to the sensor.',
          caption:
            'The sensor model is the 2025 file; the rest of the loop is from October 2026. The simulator gives the car its exact pose, so there is no odometry error, and perception is a visibility test on the true map: there is no camera or LiDAR model. A cone with no partner still extends the line, offset by half a track width towards the inside, which matters with a short sensor range.',
          nodes: [
            { label: 'Track CSV', detail: 'the full cone map: only the sensor and the referee read it', mine: false },
            { label: 'Field-of-view sensor', detail: 'range and opening angle (2025)', mine: true, loop: true },
            { label: 'Cone memory', detail: 'merged within 0.5 m, used after three sightings, forgotten 6 s after the last one', mine: true, loop: true },
            { label: 'Gates and local centre line', detail: 'blue and yellow pairs 2 m to 6.5 m wide that pass the Gabriel test, chained ahead of the car', mine: true, loop: true },
            { label: 'Pure pursuit and speed target', detail: 'lookahead 2 m to 5 m, speed limited by lateral acceleration', mine: true, loop: true },
            { label: 'Kinematic bicycle model', detail: 'steering and acceleration limits', mine: true, loop: true },
            { label: 'Referee', detail: 'lap timer, cone-hit counter, off-course check, on the true state', mine: true },
          ],
        },
        {
          kind: 'media',
          media: 'tlsePlanners',
          wide: true,
          alt: 'Three panels, each a car driving around the same small cone track along a red line: midpoint (104 m, closest cone 1.92 m), rrt (102 m, closest cone 1.14 m) and rrt-lsq (100 m, closest cone 0.58 m).',
          caption:
            'The three planners of PathPlanning on small_track, same seed as the benchmark. The car moves at the same constant speed along each line, so the shortest line finishes first. It is an animation of the viewer, not a vehicle model.',
        },
      ],

      results: [
        {
          kind: 'figures',
          items: [
            {
              value: '4 / 4',
              meaning:
                'bundled tracks driven for three valid laps with the default sensor, 4 m range and 100° field of view. No cone was touched on three of them. A lap is valid when the car went through at least 95% of the track’s reference gates.',
            },
            {
              from: '25.3',
              value: '19.5',
              unit: 's',
              meaning:
                'Best simulated lap on belgium as the sensor range grows from 4 m to 12 m (and the field of view from 100° to 120°). The speed rule only lets the car go as fast as it can slow down within the line it knows. The car is a kinematic bicycle without tyres: this compares settings of the simulator and does not predict a car.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Closed loop, 32 runs of three laps on the four bundled tracks, 3,387 s of simulated driving. The simulation is deterministic; the only random numbers are the detection noise of two ablations, with a fixed seed. The numbers are written by scripts/benchmark.py and committed with the repository. Lap times follow from the limits chosen and from a model without tyres.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['Default sensor, 4 m range and 100°: valid laps on belgium, the hairpin track, peanut and small_track', '3 / 3 on each', 'Cones touched per lap: 0 on belgium, peanut and small_track, 11 on the hairpin track.'],
            ['Best lap on belgium with a 4 m / 100°, an 8 m / 120° and a 12 m / 120° sensor', '25.28 s, 20.32 s, 19.54 s', 'Lap times fall as the range grows. The range does not change the cone contacts.'],
            ['No cone memory, 4 m / 100°, on the hairpin track', 'left the track at 77 s', 'Without memory the car also touches cones on two other tracks (3.0 per lap on peanut, 2.0 on small_track).'],
            ['No one-sided fallback, 4 m / 100°, on the four tracks', 'left all four', 'At 29 s, 28 s, 8 s and 32 s: the fallback is what keeps the line going when the far edge of the track is out of sight.'],
            ['Detection noise of 0.1 m, then 0.2 m per axis, 4 m / 100°', 'no change, then 2 tracks lost', 'At 0.2 m the car leaves belgium and the hairpin track. The noise is independent from one cycle to the next, which the running mean of the memory averages away; a biased or drifting error would be harder.'],
          ],
        },
        {
          kind: 'media',
          media: 'tlseLaps',
          wide: true,
          alt: 'Four maps of cone tracks with the path driven in magenta: belgium, peanut, small_track and the long hairpin track. Blue cones on one side, yellow on the other. On the hairpin track a few cones near the last hairpins are circled in white.',
          caption:
            'Three laps per track with the default sensor, drawn by scripts/render_laps.py. The cones the car touched are circled in white: all of them on the last five hairpins of the hairpin track.',
        },
        {
          kind: 'table',
          caption:
            'Planners of PathPlanning, 78 runs (three planners on 26 tracks), seed 0, offline planning on the full cone map: no perception, no vehicle model. Planning times were taken while the runs shared the machine, so they are indicative. There is no ground-truth best line: a larger clearance is not a faster lap.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['Median planning time over the 26 tracks: midpoint, rrt, rrt-lsq', '63 ms, 27.7 s, 34.1 s', 'The midpoint planner takes 0.2 s at most. The RRT* planners take up to 58.8 s and 73.1 s on one track.'],
            ['Median closest approach to a cone centre: midpoint, rrt, rrt-lsq', '0.94 m, 0.15 m, 0.04 m', 'Tracks where the line passes closer than 0.7 m to a cone, half the width of a 1.4 m car (an assumption): 6 of 26, 23 of 26 and 25 of 26.'],
            ['RRT* searches that returned a path', '585 / 11,998', 'All of them on the three tracks of the original menu (31 of 31, 489 of 491 and 65 of 65). None of 11,411 on the 23 other maps.'],
            ['small_track, closest approach to a cone: midpoint against rrt-lsq', '1.92 m → 0.58 m', 'The RRT* line is shorter (100.1 m against 104.1 m) but passes closer to the cones.'],
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
                'cones touched per lap on the hairpin track, with the default sensor. The laps are completed, but the contacts are all on the last five hairpins.',
            },
            {
              value: '3 / 26',
              meaning:
                'tracks on which the RRT* planners find a path between waypoints: 585 of 11,998 searches returned one, all on the three tracks of the original menu.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'The hairpin track is not driven cleanly.', text: 'There the centre line tightens to a radius of 2.13 m, below the 2.65 m minimum turning radius of the simulated car, whose footprint then sweeps over the cones. Pure pursuit only follows the centre line: avoiding the contacts would need a planner that uses the width of the track, which the repository does not have.' },
            { title: 'The RRT* planners solve only three of the 26 tracks.', text: 'Every cone is a disc of 1.2 m in the search, so the middle of a gate narrower than 2.4 m lies inside the discs of its own two cones. On the 23 other maps the median gate is 2.20 m to 2.22 m wide. Their lines are then straight segments between the midpoint waypoints, smoothed without any knowledge of the cones: a median closest approach of 0.14 m for rrt and 0.03 m for rrt-lsq on those maps, against 0.94 m for midpoint over all 26 tracks.' },
            { title: 'The first reactive prototype strays.', text: 'The November 2025 controller aims at the midpoint of the nearest visible blue and yellow cones at a constant speed, keeps no memory and has nothing to do when no cone is in view. Replayed off-screen, the car strays more than 4 m from the middle of the track on all four bundled tracks within 40 simulated seconds. The closed loop adds the memory and the pairing that it lacks.' },
            { title: 'The first sensor setting was too narrow.', text: 'The 7 m, 60° sector of the sensor model, as I first committed it in November 2025, is enough on three tracks. On the hairpin track the car leaves the track after 52 s: the narrow sector does not show enough of a tight bend.' },
            { title: 'Simulation only.', text: 'The car knows its exact pose, and perception is a visibility test on the true map: no camera or LiDAR model, no occlusion, no missed or false detection. The cone memory would need a real estimate of the car’s position to work on a vehicle. Camera-based cone detection, localisation and mapping, a tyre model, a racing line and a ROS interface are not in these repositories, and nothing here has run on a car.' },
          ],
        },
        {
          kind: 'media',
          media: 'tlsePlannerFigure',
          wide: true,
          alt: 'Nine small maps, three planners on three tracks. Top row small_track and middle row peanut: a red line running between the blue and yellow cones for midpoint, rrt and rrt-lsq. Bottom row Zandvoort_cones: the line follows the cone rows very closely for all three planners, with 0 of 476 RRT* searches solved.',
          caption:
            'Midpoint, rrt and rrt-lsq on small_track, peanut and Zandvoort_cones, drawn by scripts/render_planners.py. Bottom row: on a circuit-shaped map no RRT* search returns a path, and the smoothed line then passes a few centimetres from cones.',
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'Alec Bossard wrote the first reactive controller and the offline centre-line prototype of the simulator repository, and the midpoint planner of PathPlanning. TJeanm wrote the two RRT* planners and their smoothing, and the original French note of PathPlanning (TJeanm is a GitHub user name).' },
            { text: 'I wrote the track loader, the camera, the viewer and the field-of-view sensor model in November 2025, then the closed-loop package, the referee, the benchmarks, the figures, the tests and the CI in October 2026.' },
            { text: 'The October 2026 work was written with AI coding assistance, and those commits carry a Co-Authored-By trailer. Every number and every picture on this page is rewritten by a script of the repository.' },
            { text: 'The origin of the four tracks of the simulator repository and of the 26 maps of PathPlanning is not documented in the repositories.' },
            { text: 'Beyond these repositories, I also worked on cone-detection models in PyTorch and on image-processing and control modules with ROS, Python and C++. That work is not in them, and this page shows none of it.' },
            { text: 'Pure pursuit follows R. C. Coulter (1992), the pairing test is the Gabriel graph (Gabriel and Sokal, 1969), RRT* is Karaman and Frazzoli (2011). The GIFs are recorded with ffmpeg.' },
          ],
        },
      ],

      links: [
        { label: 'TLSe_Racing_Driverless: the simulator and the closed loop', href: 'https://github.com/guilhem0908/TLSe_Racing_Driverless' },
        { label: 'PathPlanning: offline planners, viewer and benchmark', href: 'https://github.com/guilhem0908/PathPlanning' },
      ],
    },

    // ------------------------------------------------------------- Projet Fil Rouge
    // Part 2 (real robot, team of six) leads: his part is the web HMI, the MJPEG stream, the ball-centring rule and
    // the command timing. Mapping, voice recognition, motor control and image processing are his teammates' work.
    'projet-fil-rouge': {
      metaTitle: 'Projet Fil Rouge: a web-driven robot | Guilhem Carmouze',
      metaDescription:
        'A mobile robot built by a team of six at UPSSITECH and driven from a Web Bluetooth single-page app, with a live camera stream and a ball-centring rule.',
      kicker: 'Projet Fil Rouge. First year of the engineering cycle, 2024 to 2025.',
      title: 'A real robot, driven from a web page',
      outcome:
        'In spring 2025 a team of six built a real mobile robot. My part was what the operator touches: a web page that drives it over Bluetooth, shows what its camera sees and turns the position of a ball into commands that keep it centred. The semester before, with Alec Bossard, I wrote a colour-ball detector in pure C.',
      meta: {
        role: 'Part 2, the real robot: the web interface (Web Bluetooth single-page app, camera stream, ball-centring rule, timing of the voice commands). Part 1: image parsing, file input and output, colour thresholds and cluster structures of the C detector.',
        team: 'Part 2: a team of six, with Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard and Fairouz Ijerdaoun. Part 1: with Alec Bossard.',
        period: 'Part 1: January 2025. Part 2: spring 2025.',
        organisation: 'UPSSITECH, University of Toulouse. Robotic and Interactive Systems programme (SRI), first year of the engineering cycle.',
        stack: 'JavaScript, Web Bluetooth API, Bootstrap 5, MJPEG over HTTP. Part 1: C11, GNU Make, CMake. On the robot, written by my teammates: Arduino, Raspberry Pi, RPLiDAR, Python and OpenCV.',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'pfrBall',
        alt: 'Footage from the robot’s camera, low over a floor: a blue ball and a pink ball, each circled and labelled with its coordinates, with a short trail behind it.',
        caption:
          'What the robot’s camera sees, as the web page shows it: each ball is circled with its position and a trail. Team demo recording. The detection runs on the Raspberry Pi and is my teammates’ work. Showing the stream in the page, and turning the positions into drive commands, is mine.',
      },
      summary: {
        problem:
          'A real robot had to be driven from a phone or a laptop, by hand, by voice and by following a ball, over a Bluetooth link that a normal page reload cut every time.',
        built:
          'A single-page web app with three views that drives the robot through the Web Bluetooth API, the Raspberry Pi’s camera stream inside the voice view, a rule that turns the ball’s image position into drive commands, and the timing of split voice commands: 2 s per metre, 4 s per quarter turn.',
        result:
          'A robot that the team showed driving from the page, by voice and following a ball, and mapping its surroundings. The C detector of the first half finds 28 of 28 balls on its 20 photos with no false detection, a score tuned on those photos that does not measure generalisation.',
      },

      context: [
        {
          kind: 'text',
          body: [
            'The Projet Fil Rouge is the cross-disciplinary project of the first year of the engineering cycle at UPSSITECH, run over two semesters. The first half (semester 5, January 2025) was software written in C. In the second half (semester 6, spring 2025) each team had to move from a simulated world to a real robot that moves in a room, reacts to voice commands and detects objects with its sensors.',
            'Our robot combines Arduino motor control, a Raspberry Pi camera, RPLiDAR mapping with ICP, voice commands, ball tracking and a web interface. We were six: Alexandre Perrin, Abdelbasset Houdass, Wassim Wali, Alec Bossard, Fairouz Ijerdaoun and me. The code, the report, the slides and the demo recordings are in the team repository waliwassim/PFR2.',
          ],
        },
        {
          kind: 'media',
          media: 'pfrRobot',
          wide: true,
          alt: 'The four-wheeled robot standing next to a grey crate in a test arena. On the right, two plots from a screen: the live LiDAR scan in red and the map built from successive scans in blue.',
          caption:
            'The team’s robot in its arena, next to the live LiDAR scan (left plot) and the map built from successive scans (right plot). The mapping, scan matching with ICP, is my teammates’ work. The plot titles are in French.',
        },
      ],

      built: [
        {
          kind: 'steps',
          items: [
            {
              tag: 'Part 2, the page',
              title: 'A single-page app that never drops the link',
              body: 'The robot is driven over Bluetooth with the Web Bluetooth API, and a normal page reload cut that link every time. So the interface is one single-page app: a hub, a manual pad and a voice view swap in place without reloading. A permanent green or red dot says whether the link is up, and the connect button disappears once it is. The pad has four arrows and three large coloured buttons (faster, slower, automatic mode), sized and coloured for immediate use. The interface is built with Bootstrap 5.',
              note: 'Web Bluetooth works in Chrome and Edge on a desktop. On iOS, the report recommends a third-party browser app (Blueify).',
              repo: 'PFR2',
              repoNote: 'team repository, Code/IHM',
            },
            {
              tag: 'Part 2, the camera',
              title: 'The robot’s view inside the page',
              body: 'The Raspberry Pi processes the webcam video and serves it as an MJPEG stream, with the position of the detected ball, over the local Wi-Fi. In the voice view, as soon as a ball-following command is detected, my page shows the live stream.',
              note: 'The Raspberry Pi side, the OpenCV detection and its video server, is my teammates’ work.',
            },
            {
              tag: 'Part 2, the ball',
              title: 'Keeping the ball centred',
              body: 'The page receives the ball’s (x, y) position and converts its horizontal coordinate into drive commands for the Arduino. When the ball is off the image centre line the robot turns towards it, when it is on the line the robot goes forward. With no ball in sight it turns to look for one, and if the camera cannot be reached it stops. The commands leave over the same Bluetooth link as the pad.',
              note: 'The rule is in the interface code of the team repository.',
            },
            {
              tag: 'Part 2, the voice',
              title: 'Timing the spoken sequences',
              body: 'A teammate’s code turns a spoken French sentence into a list of commands, and an algorithm from a colleague splits it into steps (forward two metres, then a quarter turn to the right). I integrated that splitting, then computed and applied the delays between the commands: 2 s per metre and 4 s per quarter turn.',
            },
          ],
        },
        {
          kind: 'pipeline',
          title: 'Following a ball from the web page',
          legend: { mine: 'My part', upstream: 'My teammates’ work' },
          loopLabel: 'While a ball is followed: the robot moves, and the camera sees the ball somewhere else',
          caption:
            'The page talks to two different machines: the Raspberry Pi over Wi-Fi for the picture and the ball position, and the Arduino over Bluetooth for the motors.',
          nodes: [
            { label: 'Webcam and OpenCV on the Raspberry Pi', detail: 'colour detection of the balls', mine: false },
            { label: 'MJPEG stream and ball position', detail: 'served over the local Wi-Fi', mine: false, loop: true },
            { label: 'Camera view in the web page', detail: 'voice view, shown when a ball-following command is detected', mine: true, loop: true },
            { label: 'Ball-centring rule', detail: 'the ball’s horizontal position on the image: turn left, turn right or go forward', mine: true, loop: true },
            { label: 'Web Bluetooth write', detail: 'one link for the pad, the voice view and the rule', mine: true, loop: true },
            { label: 'Arduino motor control', detail: 'four DC motors', mine: false, loop: true },
          ],
        },
        {
          kind: 'strip',
          items: [
            { media: 'pfrHmi', alt: 'A phone held up in a corridor shows the web interface while a small four-wheeled robot stands further down the corridor.', caption: 'The page on a phone, in manual mode, driving the robot down a corridor. Team demo recording.' },
            { media: 'pfrPad', alt: 'A hand holds a phone showing the pad of arrows and coloured buttons while the robot drives across a hall.', caption: 'The pad: four arrows and three coloured buttons, and the robot crossing a hall. Team demo recording.' },
            { media: 'pfrVoice', alt: 'A phone showing the voice view with a single round button, and the robot driving in a hall with notice boards on the wall behind it.', caption: 'The voice view on a phone, then the robot driving in a hall. Team demo recording.' },
          ],
        },
        {
          kind: 'text',
          title: 'Part 1, January 2025: a colour-ball detector in pure C',
          body: [
            'With Alec Bossard I wrote the image-processing part of the first half of the project: a C11 program that finds orange, blue and yellow balls in a 300 × 300 RGB image and reports the centre and radius of each one, without any vision library. It reads the image as a text dump, segments each colour with fixed RGB thresholds, keeps the largest 4-connected blob of each colour and measures it through its bounding box.',
            'By git blame, my part is the image parser and structure, the file reading and writing, the colour thresholds and mask construction, and the cluster list with its bounding box, centre and radius. Alec Bossard wrote the RGB quantisation and the largest-component filter.',
            'In October 2026 I cleaned the repository up, with an AI coding assistant: the tuned version used at the end of the project was brought in, the remaining bugs were fixed (a stack overflow in the recursive flood fill, memory leaks, a crash when removing a small blob), and tests, a labelled evaluation and the figures were added.',
          ],
        },
        {
          kind: 'media',
          media: 'pfrPipeline',
          wide: true,
          alt: 'Two rows of three panels. Left: a 300 by 300 photo of coloured balls on a floor. Middle: the colour masks, a dim silhouette of everything inside the thresholds and a bright largest component with its bounding box. Right: the photo again with a circle, a cross and a label on each ball, for example orange at (158, 204) with radius 42.',
          caption:
            'From a text image to a ball position, on two of the 20 photos: the masks, then the circle derived from the bounding box. The thresholds only catch part of an orange or yellow ball, which is why the box is off-centre and why three empirical corrections from the end of the project were kept.',
        },
      ],

      results: [
        {
          kind: 'text',
          title: 'Part 2 is a demonstration, not a benchmark',
          body: [
            'The robot was shown driving from the page in manual mode, from a spoken sentence and following a ball, and mapping with its LiDAR: the recordings are in the team repository. I have no measurement of my own to quote for it. The only numbers in my part are the timing rule: 2 s per metre and 4 s per quarter turn.',
          ],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '28 / 28',
              meaning:
                'balls found with the right colour, centre inside the labelled ball, on the 20 test photos of part 1, with no false detection and the 3 empty scenes left empty. The thresholds and the corrections were tuned on these same photos: this shows consistency, not generalisation.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Part 1, the C detector on its 20 photos. The 28 balls were labelled by eye in October 2026, accurate to about 2 px, and every number is written by a script of the repository that runs the compiled program. Lower is better for errors.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['Centre error of the reported circle, median (maximum), over the 28 balls', '4.1 px (18.0 px)', 'The worst case is a ball seen from very close. Orange and yellow masks miss about half of the ball, always on the same side.'],
            ['Orange balls, median centre error before and after the three empirical corrections', '11.0 px → 6.1 px', 'The corrections help on this set, which is presumably the one they were fitted on.'],
            ['Overlap of the reported circle with the labelled one (IoU), median (minimum)', '0.85 (0.59)', 'The blue balls are located within a few pixels, the orange and yellow ones less well.'],
            ['Run time per image, in a Linux container and on Windows', '7 ms, 40 ms', 'Start-up and parsing of the 1 MB text file included, on one laptop CPU, no GPU.'],
            ['Checks of the test suite', '101 + 58', '101 unit checks on the modules and 58 on the compiled program: the 20 photos against stored outputs, synthetic scenes and malformed inputs.'],
          ],
        },
        {
          kind: 'media',
          media: 'pfrContact',
          wide: true,
          alt: 'A grid of the 20 test photos, balls of three colours on grey floors, each ball circled by the detector. The last three photos, empty floors, carry the note empty scene, nothing detected.',
          caption:
            'The 20 test photos with the circle the detector reports for each ball, drawn by a script of the repository. The origin of the photos is not documented there.',
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 7',
              meaning:
                'yellow balls found when every pixel of the 20 photos is darkened to 70% (a simulated exposure change). The fixed RGB thresholds are tied to the exposure of those photos: a 10% change in either direction already loses a ball.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'One ball per colour, and no shape check.', text: 'Only the largest blob of each colour is reported, and any large enough blob of a known colour counts as a ball. The position is approximate.' },
            { title: 'The C detector never ran on the robot.', text: 'On the robot, ball tracking is a separate Python program on the Raspberry Pi, written by my teammates with OpenCV after the idea of the part 1 detector. It follows two or three colours at most: the report notes that more makes it unstable, and that the webcam reacts to the lighting and mistakes a bright object for a ball.' },
            { title: 'The voice timing is open loop.', text: 'The delays are durations, not measured distances: the robot had no odometry, so a metre is two seconds of driving and a quarter turn is four.' },
            { title: 'Web Bluetooth is not available everywhere.', text: 'It works in Chrome and Edge on a desktop. On an iPhone the report recommends a third-party browser app.' },
            { title: 'I did not write the image processing of part 2.', text: 'Unlike in part 1, the detection that feeds the ball-centring rule is my teammates’ work. My part starts at the ball’s coordinates.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'The other parts of the robot are my teammates’ work, as the individual sections of the team report say: voice recognition and the command filter (Alexandre Perrin, who also contributed to the Arduino code and to the user interface), ball tracking on the Raspberry Pi and its video server (Wassim Wali and Fairouz Ijerdaoun), LiDAR mapping with ICP (Abdelbasset Houdass), Arduino code and sensor wiring (Alec Bossard).' },
            { text: 'The robot, the demo recordings, the report and the slides belong to the team. The recordings on this page come from the team repository waliwassim/PFR2, which is hosted by a teammate.' },
            { text: 'Part 1 was written with Alec Bossard. The October 2026 clean-up and the evaluation are mine, made with an AI coding assistant: those commits carry a Co-Authored-By trailer.' },
          ],
        },
      ],

      links: [
        { label: 'PFR2: the team repository (code, report, slides, demo recordings)', href: 'https://github.com/waliwassim/PFR2' },
        { label: 'PFR: the colour-ball detector in C, with its evaluation', href: 'https://github.com/guilhem0908/PFR' },
      ],
    },

    // ------------------------------------------------------------------ Usine 4.0
    // CONFIRM: the class project is in progress and nothing else is known. Write exactly that: no partner,
    // platform, robot or result. The only evidence on this page is the personal study amr-traffic-lab.
    'usine-4-0': {
      metaTitle: 'Usine 4.0, Industry 4.0 smart factory | Guilhem Carmouze',
      metaDescription:
        'Usine 4.0, my final-year Industry 4.0 smart factory team project, is in progress. With it: personal studies of robot traffic, factory data and visual inspection.',
      kicker: 'Final-year team project. 2026 to 2027. In progress.',
      title: 'Usine 4.0, in progress, and three personal studies',
      outcome:
        'This year my class runs a team project on the Industry 4.0 smart factory (Usine 4.0). It is in progress, so this page shows nothing from it. It shows what I studied on the same theme on my own: how many mobile robots a factory aisle can take before it jams, and, more briefly, how far to trust the numbers of a plant dashboard and of a visual inspection gate.',
      meta: {
        role: 'Member of the class project. In progress: nothing more is stated for now.',
        team: 'My final-year class. Nothing more is stated here for now.',
        period: '2026 to 2027, in progress',
        organisation: 'UPSSITECH, University of Toulouse. Robotic and Interactive Systems programme (SRI).',
        stack: 'Class project: not stated. Personal studies: Python, pytest, Matplotlib, Pillow, PyTorch, OPC UA, MQTT, PostgreSQL, Grafana and Docker.',
      },
      videoAnchor: 'lead',
      lead: {
        kind: 'media',
        media: 'labAmr',
        alt: 'Two replays of the same factory floor, two halls joined by a single-lane corridor, with the same 12 robots. Left: with the naive manager the robots meet head-on in the corridor and stop for good. Right: with the reservation manager they take turns and the delivered-orders counter keeps rising.',
        caption:
          'Not the class project: my own simulation study, amr-traffic-lab. Same layout, same 12 robots, same seeded orders, seed 0, first 200 s. With 12 robots the naive manager gridlocks on this layout in 20 of 20 seeds; here nothing moves on the left after t = 32 s.',
      },
      summary: {
        problem:
          'The class project on the Industry 4.0 smart factory (Usine 4.0) is in progress, so there is nothing to show from it yet. On the same theme I could study one question alone: how many autonomous mobile robots can a factory aisle take before it jams?',
        built:
          'On my own, not for the class project: amr-traffic-lab, a seeded simulation study with a new grid A*, a time axis, a reservation table and Conflict-Based Search, on three hand-drawn factory layouts, with a safety check that recounts conflicts at every tick.',
        result:
          'Of the personal study, not of the class project: the reservation manager never gridlocked (0 of 600 one-hour runs). On the open floor it delivers 24% more orders per hour than the naive manager with 16 robots, and no collision occurred in 3,473,858 simulated ticks.',
      },

      context: [
        {
          kind: 'text',
          title: 'The class project',
          body: [
            'This year, 2026 to 2027, my class runs a final-year team project on the Industry 4.0 smart factory (Usine 4.0), one of the key target sectors of the SRI programme. It is in progress.',
            'That is all this page states about it. No partner, platform, robot or result is claimed.',
          ],
        },
        {
          kind: 'text',
          title: 'What I studied on my own',
          body: [
            'The theme raised a question that my AIST work had left open. There I wrote a single-robot A* planner on an occupancy grid, and prepared a ROS 2 interface for Kachaka, a mobile robot that docks under a shelf and carries it. One robot on an empty map never meets the first question that an Industry 4.0 smart factory asks about a fleet: what happens when a dozen of them share one aisle?',
            'amr-traffic-lab is my answer, as a personal side project built in October 2026 with AI assistance, independent of the class project. Two shorter personal studies on the same theme sit next to it in the results below.',
          ],
        },
      ],

      built: [
        {
          kind: 'text',
          title: 'What the study contains',
          body: [
            'The floor is a text map turned into a 4-connected grid of aisles, pick stations, drop stations and chargers. One cell is 1 m and one tick is 1 s. I wrote a new grid A* for it (not the AIST planner), then gave it a time axis, a reservation table and Conflict-Based Search.',
            'Two traffic managers drive the same seeded orders. The naive one follows its own shortest path, yields when the cell ahead is taken and replans after a random back-off. The reservation manager plans each trip against a table of every committed path, so vertex and swap conflicts are excluded at planning time, and the oldest unfinished trip never waits: on a well-formed layout the fleet cannot gridlock.',
            'Conflict-Based Search, for a fixed set of start and goal pairs, minimises the sum of path costs. Its answers are compared with an exhaustive joint-state search that shares no code with it.',
          ],
        },
        {
          kind: 'pipeline',
          title: 'One simulated tick',
          legend: { mine: 'Simulation code', upstream: 'Check that shares no code with the planners' },
          loopLabel: 'Every tick, until the hour ends or the fleet gridlocks',
          caption:
            'After every tick, a safety check recounts vertex and swap conflicts from the positions alone, because a manager cannot vouch for itself. A conflict raises an error instead of being counted.',
          nodes: [
            { label: 'Seeded orders', detail: 'pick to drop, an endless backlog', mine: true },
            { label: 'Dispatcher', detail: 'nearest idle robot, station locks', mine: true, loop: true },
            { label: 'Traffic manager', detail: 'naive: own A* route, wait, local replan. Reservation: space-time A* against the reservation table', mine: true, loop: true },
            { label: 'Joint move of the tick', detail: 'one tick is 1 s, one cell is 1 m', mine: true, loop: true },
            { label: 'Safety check', detail: 'vertex and swap conflicts, recounted from the positions', mine: false, loop: true },
            { label: 'Positions at the next tick', detail: 'deliveries and the gridlock test', mine: true, loop: true },
          ],
        },
      ],

      results: [
        {
          kind: 'text',
          title: 'Results of the personal study',
          body: ['Everything below, down to the two shorter studies at the end, comes from amr-traffic-lab, my own simulation study. None of it is a result of the class project.'],
        },
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 600',
              meaning:
                'one-hour runs gridlocked with the reservation manager, over three layouts and ten fleet sizes of up to 16 robots, 20 seeds per cell.',
            },
            {
              from: '427.2',
              value: '528.9',
              unit: 'orders/h',
              meaning:
                'Open floor, 16 robots: orders delivered per hour with the naive manager, then with the reservation manager (24% more). Each is the mean of 20 seeded one-hour runs.',
            },
            {
              value: '0',
              meaning:
                'vertex or swap conflicts in 3,473,858 simulated ticks (1,200 runs, both managers), counted by a check that shares no code with the planners.',
            },
          ],
        },
        {
          kind: 'table',
          caption:
            'Every cell of the lifelong study is 20 seeded runs of one simulated hour; the numbers are rewritten by scripts/reproduce.py and checked against the README by scripts/check_readme.py. Simulation on a grid, with saturated demand: it measures capacity.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['Open floor, 16 robots: orders per hour, naive then reservation', '427.2 → 528.9', 'The naive manager rarely jams on the open floor (3 of 200 runs), so this is the fair comparison. In the narrow aisles it jams in 95 of 200 runs.'],
            ['Narrow aisles, 16 robots: gridlocked runs with the naive manager', '19 / 20', 'Orders per hour: 117.7 (range 2 to 445) against 776.1 with reservation.'],
            ['Single corridor, 2 robots or more: gridlocked runs with the naive manager', '180 / 180', 'Structural, not a surprise: a single lane with no passing place deadlocks any manager that lets robots enter from both ends and never backs up. A lock admitting one direction at a time would be a fairer baseline, and the study does not measure one.'],
            ['Single corridor, reservation manager: orders per hour with 10 robots, then 16', '299.7 → 303.4', 'The only real plateau: the aisle is the limit there, with 27.7% of trip time spent waiting for the lane at 16 robots. On the two other layouts the curve is still rising at 16 robots.'],
            ['Narrow aisles, 8 agents, one-shot planning: instances solved by CBS, then by prioritised planning', '5 / 25 → 17 / 25', 'CBS returns the optimal sum of costs but runs out of its 2,000-node budget. Prioritised planning answers in milliseconds (median 2.38 ms against 944 ms).'],
            ['CBS against an exhaustive search on 400 random tiny instances', '334 / 334', 'The cost equals the joint-state optimum on every instance CBS finished. Of the 336 solvable instances, 2 ran out of budget.'],
          ],
        },
        {
          kind: 'media',
          media: 'usineThroughput',
          wide: true,
          alt: 'Six small charts, three layouts side by side. Top row: orders delivered per hour against the number of robots, the reservation manager in blue above the naive manager in orange. Bottom row: gridlocked runs out of 20. The reservation manager never gridlocks; in the narrow aisles and the single corridor the naive manager gridlocks more and more often.',
          caption:
            'Orders delivered per hour (top) and gridlocked runs out of 20 (bottom) against fleet size, for the open floor, the narrow aisles and the single corridor. Line: mean of 20 seeded one-hour runs. Band: minimum to maximum. Drawn by scripts/reproduce.py.',
        },
        {
          kind: 'text',
          title: 'Two shorter studies on the same theme',
          body: [
            'usine40-cell-pipeline sends a simulated production cell through OPC UA, MQTT, PostgreSQL and Grafana and checks the OEE (overall equipment effectiveness) on the dashboard against the simulator’s own event log. visual-quality-gate re-implements PaDiM and PatchCore on five MVTec AD categories and asks what a visual quality gate costs once its threshold has to be chosen.',
            'Both are personal side projects of October 2026, independent of the class project. One result of each:',
          ],
        },
        {
          kind: 'table',
          caption:
            'A simulated cell and a public image benchmark, not factory data. The numbers are rewritten by a script of each repository and checked against its README.',
          head: ['What was measured', 'Value', 'How to read it'],
          rows: [
            ['usine40-cell-pipeline: largest gap between the OEE stored by the pipeline and the OEE of the event log, over 3,600 station-windows of 30 s', '0.000 pp', 'Nothing is lost or invented between the simulated PLC and the dashboard; it does not show that OEE is the right KPI. A 60 s broker outage at QoS 0 leaves 45 of 240 windows with a wrong OEE.'],
            ['visual-quality-gate: good parts refused by PatchCore WR50-10% when the threshold, set from held-out good parts, aims at 5%', '43 / 408 (10.5%)', 'Over 3 seeds, 2.1 times the target, while 85 of 1,353 defective parts (6.3%) still get through.'],
          ],
        },
      ],

      failed: [
        {
          kind: 'figures',
          items: [
            {
              value: '0 / 25',
              meaning:
                'one-shot instances of the narrow aisles with 12 agents that Conflict-Based Search solved within its 2,000-node budget. Prioritised planning solved 3 of 25.',
            },
          ],
        },
        {
          kind: 'list',
          items: [
            { title: 'The class project is not finished.', text: 'It is in progress, so nothing from it is shown, measured or claimed on this page.' },
            { title: 'The corridor result is structural.', text: 'The naive manager never reverses, and a single lane has no passing place, so its corridor result overstates what reservations add over a lock that admits one direction at a time. The open floor and the narrow aisles are the fairer comparisons.' },
            { title: 'CBS does not scale here.', text: 'It is plain Conflict-Based Search with a node budget and none of the improvements that make modern solvers fast, and it cannot prove that an instance is unsolvable. It is a reference for small instances only.' },
            { title: 'A grid world.', text: 'Moves take one tick on a 4-connected grid: no acceleration, turning time, robot footprint or localisation error. Reserved paths are executed perfectly, whereas a real fleet needs margins or replanning when a robot is late.' },
            { title: 'Endless demand, no batteries, no machines.', text: 'Chargers are parking bays, stations are always ready and orders are an endless backlog. The study measures capacity, not the waiting time of an order in a queue.' },
            { title: 'Three hand-drawn layouts, fleets up to 16.', text: 'On the open floor and the narrow aisles the best fleet is a lower bound, since the curve is still rising at 16 robots, the most the chargers can park. One-way aisles, the usual engineering fix, are not studied.' },
            { title: 'The two shorter studies are small.', text: 'usine40-cell-pipeline runs a simulated cell, and a zero OEE error shows that nothing is lost or invented on the way, not that OEE is the right KPI. visual-quality-gate covers five of the fifteen MVTec AD categories, and its PatchCore threshold refused good parts at about twice the target rate.' },
          ],
        },
      ],

      credits: [
        {
          kind: 'list',
          items: [
            { text: 'amr-traffic-lab is a personal side project written in October 2026 with AI assistance: its commits carry a Co-Authored-By trailer. Every number on this page is regenerated by a committed script, and a second script checks the README against the results.' },
            { text: 'usine40-cell-pipeline and visual-quality-gate are personal side projects of October 2026 too, written with AI assistance and committed with a Co-Authored-By trailer; their numbers are regenerated by committed scripts.' },
            { text: 'The grid A* of the study is new code, not the planner of the AIST internship.' },
            { text: 'The methods come from the literature: space-time A* with a reservation table (Silver, 2005), Conflict-Based Search (Sharon, Stern, Felner and Sturtevant, 2015), and the lifelong, well-formed setting (Ma, Li, Kumar and Koenig, 2017; Čáp, Vokřínek and Kleiner, 2015).' },
          ],
        },
      ],

      links: [
        { label: 'amr-traffic-lab: the simulation study (repository)', href: 'https://github.com/guilhem0908/amr-traffic-lab' },
        { label: 'The same study on the lab page, with its clip', href: '/lab/#amr-traffic-lab' },
        { label: 'usine40-cell-pipeline: the simulated cell, from OPC UA to Grafana (repository)', href: 'https://github.com/guilhem0908/usine40-cell-pipeline' },
        { label: 'visual-quality-gate: PaDiM and PatchCore as a quality gate (repository)', href: 'https://github.com/guilhem0908/visual-quality-gate' },
        { label: 'nav_3dgs_pano: the single-robot A* planner of the AIST internship', href: 'https://github.com/guilhem0908/nav_3dgs_pano' },
        { label: 'KachakaNavigation: the ROS 2 interface prepared for the Kachaka robot', href: 'https://github.com/guilhem0908/KachakaNavigation' },
      ],
    },
  },

  // -------------------------------------------------------------------------- lab
  lab: {
    kicker: 'Lab',
    title: 'Side projects',
    intro: 'Small studies that take one question left open by the real work and answer it with a measurement.',
    disclosure:
      'These are personal side projects, built in October 2026 with AI assistance: their commits carry a Co-Authored-By trailer. Every number below is reproduced by a script committed in the repository.',
    labels: { shows: 'What the clip shows', result: 'One result', stack: 'Stack', extends: 'Where it comes from' },
    projects: {
      erpkit: {
        what: 'A tested NumPy toolkit for 360-degree image geometry (equirectangular, cubemap, pinhole, multi-view rigs) that measures what stitching views into a panorama really costs.',
        shows: 'A 90° pinhole camera sweeps over an equirectangular panorama of a procedural room, its footprint drawn on the panorama next to the extracted view. Below, a 14-view rig is assembled view by view on a map of how many views see each direction.',
        result: {
          from: '5.6',
          value: '1.06',
          meaning: 'Seam step ratio under a ±5% exposure mismatch between views, strict cube against 96° faces with feathering (mean over 3 seeds, 1 = invisible). Feathering hides the mismatch rather than fixing it: WS-PSNR stays at 35.5 dB.',
        },
        extends: 'The internship stitched six pinhole views into panoramas with an overlapped cubemap. Face size, overlap and feather width are settings whose cost this project quantifies, with its own code and generated images.',
        short: '360° image geometry in NumPy: 96° feathered faces cut the seam step ratio from 5.6 to 1.06 under a ±5% exposure mismatch.',
      },
      microsplat: {
        what: '3D Gaussian Splatting small enough to read in one sitting: a NumPy reference rasteriser, a differentiable PyTorch twin, and tests that pin every equation.',
        shows: 'Four panels through an optimisation that starts from random Gaussians, then an orbit of held-out views: the ray-traced target, the render, the absolute error and the outlines of the projected Gaussians.',
        result: {
          value: '33.6',
          unit: 'dB',
          meaning: 'PSNR on held-out views of the ray-traced shapes scene after 3,000 iterations from random Gaussians, with adaptive density control (mean of 3 seeds).',
        },
        extends: 'During the internship everything went through existing renderers: 3DGRUT, Splatfacto and DISCOVERSE. This project opens the renderer: the forward pass rewritten from the papers, made differentiable, one test per equation.',
      },
      'gaussian-projection-bench': {
        what: 'A numerical study of the two ways a 3D Gaussian is turned into a 2D one, EWA linearisation and the unscented transform, through pinhole, fisheye and equirectangular cameras, against a Monte-Carlo reference whose own noise floor is reported.',
        shows: 'An isotropic 3D Gaussian slides to the edge of a 180° fisheye image, then to the pole of an equirectangular image. Grey: the Monte-Carlo density of its projection. Orange: the EWA ellipse. Blue: the unscented-transform ellipse and its seven sigma points.',
        result: {
          from: '18',
          value: '44',
          unit: 'px',
          meaning: 'Splat standard deviation at which the projection error passes half a pixel (2-Wasserstein) at 45° off-axis in a pinhole camera: EWA with the exact Jacobian, then the unscented transform with 3DGUT’s sigma points.',
        },
        extends: 'Most Gaussian renderers assume a perspective camera, which is why the internship rendered six pinhole views and stitched them. This project measures what each approximation costs, in pixels, including near the poles of a panorama.',
        short: 'Pinhole camera, 45° off-axis: the projection error passes half a pixel at a splat deviation of 18 px with EWA and 44 px with the unscented transform.',
      },
      'splat-navmap': {
        what: 'A study of when an occupancy grid sliced from a 3D Gaussian Splatting scene makes an A* planner drive through walls or refuse a doorway, on synthetic flats whose true geometry is known.',
        shows: 'The opacity threshold swept from 0.05 to 0.95 on one flat (seed 4) and one start-goal pair chosen by hand. For centre counting and for footprint accumulation: the Gaussians seen from above, the extracted grid with its phantom and missing cells, and the A* path, with red crosses where it enters real geometry. The Gaussians are synthetic surfels with modelled defects, not trained splats.',
        result: {
          from: '28.8',
          value: '1.6',
          unit: '%',
          meaning: 'Paths that enter real geometry at an opacity threshold of 0.5, with moderate defects: centre counting, then footprint accumulation (1,000 start-goal pairs on 10 synthetic flats). The map with the lower IoU plans better (0.652 against 0.663).',
        },
        extends: 'My internship report derived an occupancy grid from a slice of a supplied 3DGS scene and planned on it with A*, and noted that how Gaussian opacity relates to collision geometry was only partly validated. This project studies it on synthetic flats whose geometry is known. Nothing from the internship is reused.',
      },
      'cone-ekf-slam': {
        what: 'EKF localisation and EKF-SLAM on simulated Formula Student cone tracks seen through a limited field of view, with the consistency tests (NEES, NIS) that show when the filter’s own uncertainty can no longer be trusted.',
        shows: 'A closed cone track from above: the true path in grey, the EKF-SLAM estimate in red, the sensor sector and the 99% ellipses of the pose and of every mapped cone. The pose uncertainty grows to 0.65 m before the first cones are seen again at t = 37.5 s, then drops to 0.03 m, and the ellipses of the cones out of view shrink with it (track seed 7, 1.3 laps). Two strip charts below follow the pose NEES and the uncertainties.',
        result: {
          from: '17 / 50',
          value: '1 / 50',
          meaning: 'runs in which nearest-neighbour association matched a wrong cone, with a sensor range of 4 m (that of the original 2D simulator, 1.1 cones per scan) then 15 m (6.4 cones per scan). 5 tracks, 10 noise seeds each.',
        },
        extends: 'In the TLSe Racing driverless team my part is the simulator and the field-of-view sensor model that picks the cones the car can see; the planners are my teammates’ work. This project studies the stage between the two: estimating where the car and the cones are from noisy detections. Simulation only: it has never run on a car and shares no code or track with the team’s repositories.',
        short: 'Cone tracks seen through a limited field of view: nearest-neighbour association picks a wrong cone in 17 of 50 runs at 4 m of sensor range, in 1 of 50 at 15 m.',
      },
      'amr-traffic-lab': {
        what: 'A seeded simulation study of Industry 4.0 smart-factory (Usine 4.0) intralogistics: how many autonomous mobile robots a factory aisle can take before it jams, with the no-collision invariant checked on every tick.',
        shows: 'Two replays of the same factory floor, two halls joined by a single-lane corridor, with the same 12 robots. Left: with the naive manager the robots meet head-on in the corridor and stop for good. Right: with the reservation manager they take turns and the delivered-orders counter keeps rising.',
        result: {
          value: '0 / 600',
          meaning: 'one-hour runs gridlocked with the reservation manager, over three layouts. On the open floor it also delivers 24% more orders per hour than the naive manager with 16 robots (528.9 against 427.2).',
        },
        extends: 'The internship planner moved one robot on an empty map. This project adds time, a reservation table and Conflict-Based Search, and measures the fleet. It is independent of the final-year class project on Usine 4.0.',
      },
      'usine40-cell-pipeline': {
        what: 'A simulated Industry 4.0 (Usine 4.0) production cell sent through OPC UA, MQTT, PostgreSQL and Grafana, with the OEE (overall equipment effectiveness) on the dashboard checked against the simulator’s own event log, and every latency and loss measured.',
        shows: 'The live Grafana dashboard during a scripted scenario: nominal production, an injected breakdown that fires the fault alert, a gateway kill that turns the timeline to NO DATA and fires the stale-data alert, then the recovery. The frames are real screenshots of the provisioned dashboard; only the caption strip is added.',
        result: {
          value: '0.000',
          unit: 'pp',
          meaning: 'Largest gap between the OEE stored by the pipeline and the OEE recomputed from the simulator’s event log, over 3,600 station-windows of 30 s. The only way I found to break it is to lose samples: a 60 s broker outage at QoS 0 leaves 45 of 240 windows with a wrong OEE.',
        },
        extends: 'At AIST I prepared a ROS 2 interface with stale-frame rejection, velocity clamps and a dead-man timer. Here I wanted the same discipline on the machine side of a factory: stamp every value at the source, never trust a message because it arrived, count what is lost. It is independent of the final-year class project on Usine 4.0.',
        short: 'A simulated cell through OPC UA, MQTT, PostgreSQL and Grafana: the stored OEE matches the event log in every window compared, largest error 0.000 pp.',
      },
      'visual-quality-gate': {
        what: 'A training-free visual quality gate for an Industry 4.0 (Usine 4.0) line: PaDiM and PatchCore re-implemented in PyTorch, measured on five MVTec AD categories and judged on a line manager’s question: how many good parts do I refuse to stop how many defects?',
        shows: 'Five test parts scored by PatchCore WR50-10% (seed 0), each with its anomaly heat map, score, threshold and OK or NOK verdict: the median caught defect, the median accepted good part, the caught defect closest to the threshold, the worst escape (a defective part that passed) and the worst false reject (a good part refused).',
        credit: 'Images: MVTec AD (Bergmann et al., CVPR 2019), CC BY-NC-SA 4.0.',
        result: {
          value: '10.5',
          unit: '%',
          meaning: 'of good parts refused by PatchCore WR50-10% when its threshold, set from held-out good parts, aims at 5%: 43 of 408 over 3 seeds, 2.1 times the target, while 6.3% of defective parts (85 of 1,353) still get through.',
        },
        extends: 'In my first year of the engineering cycle I co-wrote with Alec Bossard a colour-ball detector in plain C, which works when the thing to find is a colour you can name in advance. This project is its learned-feature successor: the detector only sees good parts, and the threshold is set from good parts too. It is independent of the Usine 4.0 class project.',
      },
    },
    outro: 'A question about one of them? Write to me.',
  },
};

export default en;
