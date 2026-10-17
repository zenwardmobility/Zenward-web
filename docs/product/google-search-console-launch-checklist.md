# Google Search Console — launch checklist

Internal. Created in ZW-SEO-01 (2026-10-17).

**No Search Console property is known to exist yet. No verification token is in the repository.** Add one only
if the owner supplies it. DNS verification needs no code change. Search Console is separate from advertising
measurement: setting it up does not touch the 04M architecture, which remains READY BUT DISABLED.

## Setup

- [ ] **1. Owner-controlled Google account.** Use a Zenward-owned account (not a personal or vendor one). Add other
      users later with the least access they need.
- [ ] **2. Add a Domain property** for `zenwardmobility.com`. It covers http/https and www/apex together.
- [ ] **3. Verify by DNS TXT record** at the domain registrar (preferred). No site change is needed.
- [ ] **4. Confirm the HTTPS canonical.** The live site redirects `http://` and the apex to
      `https://www.zenwardmobility.com` (checked 2026-10-17: 308 redirects), and every page's canonical uses that
      host. Optionally also add a URL-prefix property for `https://www.zenwardmobility.com/`.
- [ ] **5. Submit the sitemap:** `https://www.zenwardmobility.com/sitemap.xml`. After the ZW-SEO-01 deploy it holds
      21 organic URLs: no paid landing pages, request form, privacy or terms. Confirm "Success" and that the
      discovered count matches.

## URL Inspection (after the SEO-01 deploy)

For each URL: confirm "URL is on Google" or "can be indexed", that the user-declared canonical matches Google's
selected canonical, and that structured data is detected where expected.

- [ ] **6.** `/` (Organization)
- [ ] **7.** `/locations/metro-atlanta` (Service, BreadcrumbList)
- [ ] **8.** `/services/wheelchair-transportation`
- [ ] **9.** `/services/dialysis-transportation`
- [ ] **10.** `/services/medical-appointments`
- [ ] **11.** `/services/hospital-discharge-transportation`
- [ ] **12.** `/healthcare-providers`
- [ ] **13.** `/resources`, plus the six Resource URLs (Article + BreadcrumbList; the trip checklist has
      BreadcrumbList only)
- [ ] **14. Request indexing** only for these priority URLs, once each, after they pass inspection. Don't request
      it for paid landing pages: they are intentionally noindex.

## Monitoring

- [ ] **15. Pages / Indexing:** watch "Crawled – currently not indexed", "Duplicate, Google chose different
      canonical" (especially the homepage vs `/locations/metro-atlanta`) and "Excluded by 'noindex'". The four
      `/metro-atlanta/...` paid pages are expected there.
- [ ] **16. Search results:** queries, pages, CTR and position. Compare homepage vs hub vs service pages for
      overlapping queries.
- [ ] **17. Core Web Vitals:** mobile first. Field data appears only after enough traffic.
- [ ] **18. Manual actions and Security issues:** both should read "No issues detected".
- [ ] **19. Record the baseline** in the table below on the first day data appears. Don't back-fill or estimate.
- [ ] **20. Review at 7, 14 and 30 days,** then monthly. Use queries with impressions but low CTR to adjust titles
      and descriptions, and use them to choose the next Resources (seo-content-roadmap.md).

## Weekly baseline (record real data only)

| Date | Indexed pages | Impressions | Clicks | CTR | Average position | Top query | Top page | Qualified transportation requests | Notes/actions |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |

"Qualified transportation requests" comes from Zenward's own records (Nemryn Website Requests), not from Search
Console. The site has no analytics vendor, so request attribution to organic search is approximate. You can ask
callers and requesters how they found Zenward.
