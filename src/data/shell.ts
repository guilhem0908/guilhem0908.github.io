// Copy for the parts of the shell that no page owns: structured data and the 404 page.
// English and French are written; a language is added by adding its key (copy `en`).
// Titles, descriptions and share alt texts of the pages stay in data/en.ts and data/cv/en.ts.

import { DEFAULT_LANG, type Lang } from './site';
import { frenchTypography } from '../i18n/typography';

export interface ShellCopy {
  /** JSON-LD Person */
  person: { jobTitle: string; school: string; knowsAbout: string[] };
  notFound: {
    title: string;
    description: string;
    kicker: string;
    heading: string;
    text: string;
    requested: string;
    mapAlt: string;
    actions: { home: string; index: string; cv: string };
  };
}

export const shell: Partial<Record<Lang, ShellCopy>> = {
  en: {
    person: {
      jobTitle: 'Robotics engineering student',
      school: 'UPSSITECH, University of Toulouse',
      knowsAbout: [
        '3D Gaussian Splatting',
        '360-degree vision',
        'Robot navigation',
        'ROS 2',
        'Industry 4.0 smart factory (Usine 4.0)',
      ],
    },
    notFound: {
      title: 'Page not found | Guilhem Carmouze',
      description: 'This page does not exist. Go back to the portfolio of Guilhem Carmouze.',
      kicker: 'Error 404',
      heading: 'No path.',
      text: 'The planner searched the whole map and found no route to this address. The link may be mistyped, or the page may have moved.',
      requested: 'Requested',
      mapAlt: 'An occupancy grid with a red planned path that stops in front of a wall',
      actions: { home: 'Back to the run', index: 'Project index', cv: 'CV' },
    },
  },
  fr: frenchTypography({
    person: {
      jobTitle: 'Étudiant ingénieur en robotique',
      school: 'UPSSITECH, Université de Toulouse',
      knowsAbout: [
        '3D Gaussian Splatting',
        'Vision 360°',
        'Navigation de robots',
        'ROS 2',
        'Usine 4.0 (Industrie 4.0, usine connectée)',
      ],
    },
    notFound: {
      title: 'Page introuvable | Guilhem Carmouze',
      description: 'Cette page n’existe pas. Retour au portfolio de Guilhem Carmouze.',
      kicker: 'Erreur 404',
      heading: 'Aucun chemin.',
      text: 'Le planificateur a parcouru toute la carte et n’a trouvé aucun itinéraire vers cette adresse. Le lien est peut-être mal saisi, ou la page a déménagé.',
      requested: 'Adresse demandée',
      mapAlt: 'Une grille d’occupation avec un chemin rouge planifié qui s’arrête devant un mur',
      actions: { home: 'Retour au parcours', index: 'Index des projets', cv: 'CV' },
    },
  }),
};

/** Shell copy for a language; falls back to English. */
export function getShell(lang: Lang): ShellCopy {
  return shell[lang] ?? shell[DEFAULT_LANG]!;
}
