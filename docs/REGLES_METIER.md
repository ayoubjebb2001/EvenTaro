# Règles métier – EvenTaro

## Statuts des entités

### Événement (Event)

| Statut     | Description |
|-----------|-------------|
| DRAFT     | Brouillon, visible uniquement par les admins |
| PUBLISHED | Publié, visible dans le catalogue public et réservable |
| CANCELLED | Annulé, non réservable |

- Seuls les événements **PUBLISHED** sont visibles sur la liste publique et le détail public.
- La **capacité maximale** (maxCapacity) ne doit jamais être dépassée (on compte les réservations PENDING + CONFIRMED).

### Réservation (Reservation)

| Statut    | Description |
|----------|-------------|
| PENDING  | En attente de traitement par l’admin |
| CONFIRMED| Confirmée ; le participant peut télécharger le ticket PDF |
| REFUSED  | Refusée par l’admin |
| CANCELLED| Annulée (par l’admin ou par le participant selon les règles) |

---

## Conditions pour créer une réservation

Un utilisateur **ne peut pas** réserver si :

1. L’événement n’est **pas publié** (DRAFT ou CANCELLED).
2. L’événement est **complet** (nombre de réservations actives PENDING + CONFIRMED ≥ maxCapacity).
3. L’utilisateur a **déjà une réservation active** (PENDING ou CONFIRMED) pour cet événement.

---

## Annulation d’une réservation

### Par l’admin

- L’admin peut **annuler toute réservation** (PENDING ou CONFIRMED) à tout moment.

### Par le participant

- Le participant ne peut annuler **que** une réservation **CONFIRMED**.
- Il ne peut le faire **que** si l’événement a lieu **au moins 48 h plus tard**.  
  Sinon, un message d’erreur indique que l’annulation n’est plus possible.

---

## Ticket PDF

- Le téléchargement du **ticket / confirmation PDF** n’est autorisé **que** pour une réservation au statut **CONFIRMED**.
- Seul le participant concerné ou un admin peut télécharger le ticket.

---

## Indicateurs admin (optionnel)

- **Événements à venir** : liste des événements dont la date/heure est dans le futur.
- **Taux de remplissage** : par événement, (réservations actives / maxCapacity) en pourcentage.
- **Répartition des réservations par statut** : agrégation des réservations en PENDING, CONFIRMED, REFUSED, CANCELLED.

Ces indicateurs sont exposés via les endpoints admin (ex. `GET /events/upcoming`, `GET /events/:id/stats`, `GET /reservations/stats`).
