# Roadmap: Correction Import BGG et Gestion Extensions

## Problèmes identifiés

- Lors de la sélection d'un jeu via BGG, les informations affichées (nombre de joueurs, image, etc.) ne sont pas correctement récupérées ou transmises à la BDD.
- Les extensions sont affichées dans la liste mais ne sont pas enregistrées dans la table `game_extensions` (même pas le nom avec la foreign key sur le jeu de base).
- La recherche BGG mélange jeux et extensions dans la même liste, ce qui complique la séparation et la persistance des données.
- En BDD, les champs critiques (min_players, max_players, image, etc.) ne sont pas toujours présents ou à jour pour les jeux et extensions.

## Actions à prévoir

1. **Séparer la logique d'import BGG**
   - Distinguer clairement jeux et extensions lors de l'import.
   - Afficher et enregistrer séparément les jeux et leurs extensions.

2. **Persistance des données**
   - Vérifier que tous les champs critiques sont bien transmis et enregistrés pour les jeux et extensions (min_players, max_players, image, description, etc.).
   - Pour les extensions, enregistrer au moins le nom et la foreign key sur le jeu de base.

3. **Correction UI/Backend**
   - Corriger la logique UI pour que la sélection BGG transmette toutes les infos à la BDD.
   - Corriger le backend pour garantir la persistance et la séparation des données.

4. **Audit BDD**
   - Vérifier la structure et le contenu des tables après import.
   - S'assurer que la table `game_extensions` contient bien les extensions liées à chaque jeu de base.

## À faire lors de la prochaine session

- Reprendre l'intégration BGG pour garantir la séparation et la persistance des données.
- Corriger la logique de création/édition pour les jeux et extensions.
- Auditer la BDD pour valider la correction.

---

*Ce fichier sert de point de départ pour la prochaine session de correction et d'amélioration de l'import BGG et de la gestion des extensions.*
