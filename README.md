# Gym-WebApp

Applicazione locale per gestire esercizi, allenamenti e calendario. Docker Compose avvia tre container separati.

| Servizio | Indirizzo |
| --- | --- |
| Frontend React con Nginx | [localhost:5173](http://localhost:5173) |
| Backend Spring Boot e Swagger | [localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| PostgreSQL 16 | Interno alla rete Docker |

## Avvio con Docker

Apri Docker Desktop ed esegui questo comando dalla radice del progetto.

```bash
docker compose up -d --build --wait
```

Apri il frontend e registrati o accedi con email o nome utente. Nel menu **Profilo** puoi modificare i tuoi dati. Flyway prepara il database e carica il catalogo iniziale di 22 esercizi.

```bash
docker compose ps
docker compose logs -f backend
docker compose stop
```

Per ripartire usa `docker compose up -d --wait`. Dopo modifiche al codice aggiungi `--build`. `docker compose down` rimuove i container e conserva il volume. Evita `down -v` sul database che vuoi conservare.

## Amministrazione

La schermata **Admin** serve per cercare utenti, modificare i loro dati e gestire esercizi, allenamenti e calendario. Per assegnare il ruolo admin o eseguire il recupero locale usa Swagger, che richiede una chiave diversa dalla password dell’account.

1. Se alla radice manca `.env`, crea il file con `cp .env.example .env`. Se esiste già, conserva le altre impostazioni, soprattutto `GYM_DB_VOLUME`.
2. Se la chiave è già configurata, leggila con `sed -n 's/^ACCOUNT_ADMIN_KEY=//p' .env`. Altrimenti genera una chiave con `openssl rand -hex 32` e salvala in `.env` come `ACCOUNT_ADMIN_KEY=la-chiave-generata`. Dopo una modifica alla chiave, ricarica il backend con `docker compose up -d --wait backend`.
3. Apri [Swagger UI](http://localhost:8080/swagger-ui.html). Seleziona **Authorize → accountAdminKey** e incolla la chiave.
4. Scegli l’operazione, premi **Try it out** e poi **Execute**.

| Operazione | Endpoint | Campi JSON |
| --- | --- | --- |
| Promuovi il tuo account esistente | `PUT /api/admin/accounts/administrators/promote` | `email` |
| Crea un account admin separato | `POST /api/admin/accounts/administrators` | `username`, `email`, `password` |
| Elenca gli indirizzi registrati | `GET /api/admin/accounts/emails` | — |
| Reimposta una password | `POST /api/admin/accounts/password-reset` | `email`, `newPassword` |

Dopo la promozione, esci dall’app e accedi di nuovo con lo stesso account. Comparirà **Admin**. Quando hai finito con Swagger, puoi svuotare `ACCOUNT_ADMIN_KEY` in `.env` e ricreare il backend con lo stesso comando del punto 2. Gli account admin continuano a usare la schermata Admin con il login normale.

## Dati esistenti e backup

Se provieni dal vecchio Compose in `backend/`, prima di avviare il nuovo stack ferma il database precedente e configura il nome esatto del suo volume in `.env`.

```bash
docker compose -f backend/docker-compose.yml stop postgres
docker volume ls
```

Con la configurazione precedente standard il volume si chiama `backend_gymtracker-postgres-data`. In quel caso imposta `GYM_DB_VOLUME=backend_gymtracker-postgres-data` e `GYM_DB_EXTERNAL=true`. Ferma anche eventuali processi Vite e Spring Boot avviati a mano sulle porte 5173 e 8080. Il nuovo stack applica le migrazioni al volume esistente e conserva gli esercizi già presenti.

Per esportare il database dal nuovo stack, esegui il comando dalla radice.

```bash
docker compose exec -T db pg_dump -U postgres -d gymtracker -Fc > gymtracker.dump
```

Il dump contiene anche gli account. Conservalo in privato. Per ripristinarlo in un database separato e vuoto, ferma il backend e carica il dump prima di avviarlo, così Flyway riconoscerà l’eventuale cronologia già presente.

Per sviluppare i singoli componenti senza il relativo container, consulta le guide [backend](backend/README.md) e [frontend](frontend/README.md).
