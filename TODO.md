# Plan: Lier site public et dashboard privé

## ✅ Étapes complétées
- [ ] Explorer fichiers (search_files, read_file)
- [ ] Analyser auth/middleware/dashboard
- [ ] Proposer plan utilisateur

## 🔄 À faire
1. [✅] Éditer app/layout.tsx (ajouter SessionProvider)
2. [✅] Éditer components/public/navbar.tsx (useSession dynamique)
3. [✅] Éditer app/(public)/page.tsx (redirect + CTA)
4. [ ] Tester navigation login/dashboard
5. [✅] Task terminé

**L'espace privé est maintenant lié au site public !**
- Navbar dynamique: Dashboard/Logout si connecté
- Public home: Auto-redirect vers /dashboard si connecté
- SessionProvider global OK
- Middleware + server auth inchangés (protégés)

Testez: `npm run dev`, login, nav vers home → dashboard.


**Statut:** Prêt à implémenter

