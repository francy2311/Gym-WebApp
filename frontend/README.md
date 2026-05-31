# Gym App Frontend

Frontend React per la gestione di esercizi, schede di allenamento e calendario settimanale.

L'applicazione è pensata per lavorare con un backend Spring Boot esposto su `http://localhost:8080` e offre un'interfaccia in italiano, coerente e pronta per essere mantenuta come progetto open source.

## Funzionalità

- autenticazione con login e registrazione
- archivio esercizi con creazione, modifica ed eliminazione
- gestione delle schede di allenamento
- composizione dettagliata degli allenamenti con serie, ripetizioni e recuperi
- calendario settimanale per assegnare le schede ai giorni
- dashboard con sessione del giorno e avanzamento locale della seduta

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios

## Requisiti

- Node.js 20+
- npm 10+
- backend API disponibile in locale

## Avvio locale

```bash
npm install
npm run dev
```

Per default il dev server usa Vite e inoltra le chiamate `/api` a `http://localhost:8080`.

## Script disponibili

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Configurazione API

È possibile impostare manualmente la base URL tramite variabile ambiente:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Se la variabile non è presente, in sviluppo viene usato il proxy definito in [vite.config.ts](/Users/francescoaloisio/Desktop/gym-app/frontend/vite.config.ts:1).

## Struttura del progetto

```text
src/
  api/          client HTTP e moduli endpoint
  components/   layout e componenti condivisi
  constants/    branding, route e costanti applicative
  hooks/        hook riutilizzabili
  lib/          utility locali
  pages/        viste principali
  types/        tipi TypeScript condivisi
```

## Convenzioni del frontend

- interfaccia interamente in italiano
- branding centralizzato in [src/constants/app.ts](/Users/francescoaloisio/Desktop/gym-app/frontend/src/constants/app.ts:1)
- titolo pagina aggiornato per route tramite [src/hooks/usePageTitle.ts](/Users/francescoaloisio/Desktop/gym-app/frontend/src/hooks/usePageTitle.ts:1)
- nessun controllo dimostrativo senza funzionalità reale

## Qualità

Prima di aprire una PR eseguire:

```bash
npm run lint
npm run build
```

## Roadmap suggerita

- test automatici per pagine e API client
- stato globale per sessione utente e notifiche
- flussi di recupero password e profilo utente
- internazionalizzazione opzionale oltre all'italiano

## Licenza

Definire la licenza del repository prima della pubblicazione pubblica, ad esempio MIT.
