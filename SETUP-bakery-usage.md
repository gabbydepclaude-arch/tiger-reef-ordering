# Bakery usage from the MBC Prep Tool - setup

1. Upload this whole folder to the same Netlify site as before (same GitHub repo / drag-and-drop deploy).
2. On Netlify: Site configuration > Environment variables > Add a variable
   - Key: `MBC_SYNC_KEY`
   - Value: a long random password you make up (e.g. 20+ letters and numbers). Keep it private.
   Then redeploy (Deploys > Trigger deploy) so the function picks it up.
3. In the Prep Tool on the admin PC: ⚙ Snapshot & Printer settings
   - Supplier app address: your Netlify address, e.g. https://xxxx.netlify.app
   - Supplier app sync key: the same value as MBC_SYNC_KEY
   - Save, then "Send ingredient usage now" - it should say "Sent ✓".
4. In the ordering app: open the **Bakery usage** tab to check the figures arrived. Then on the Order
   screen click **link to bakery ingredient** under each ingredient item (flour, sugar, margarine, eggs...)
   and enter how much is in ONE unit (e.g. 12.5 kg). The app guesses both from the item name.
   Links are shared with everyone using the app.
5. Each linked item then shows weekly use, how long one unit lasts and a suggested quantity for the
   number of days you choose ("Suggest enough for 7 days of baking"). Click **use** to put it in the
   quantity box. Suggestions don't know what's on the shelf - take that off before ordering.
