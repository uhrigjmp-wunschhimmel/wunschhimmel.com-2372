# Wunschhimmel Task Status

## DONE
- Token verified: af9920b2... works for api.awin.com (/accounts returns userId 3180131)
- Publisher ID corrected: 2864125 (was 2864185, wrong!)
- Dev server running on port 6976

## BLOCKING ISSUES

### Awin Product Search API
- `product-search.api.awin.com` → DNS not found from bun/sandbox
- From workerd (vite dev): returns "internal error" 
- Root cause: Publisher account only has 3 joined programmes (stempel-fabrik, Fackelmann, House-of-Sneakers)
- Likely needs: join more programmes AND/OR activate Product Search/Finder feature in Awin UI

### Awin Product Feed API
- `productdata.awin.com` → redirects to `legacydatafeeds.awin.com`
- `legacydatafeeds.awin.com` → returns "we broke something" (Awin's server issue)
- Feed API key may be separate from publisher API token

## NEXT ACTIONS FOR USER
1. Go to Awin dashboard → Toolbox → Create-a-Feed → find Feed API key (different from Publisher token)
2. Join more relevant German affiliate programmes (Amazon, Tchibo, Jako-O, etc.)
3. Check if "Product Search API" / "Product Finder" needs to be enabled in Awin account settings

## NEXT ACTIONS FOR CODE
1. Update awin.ts to use datafeed download URL (once feed API key is known)
2. OR implement alternative: Idealo/Google Shopping RSS feeds as fallback
3. Fix _meta being on every product (low priority)

## DEV SERVER
- Port: 6976, tmux: port_6976
- Restart: tmux kill-session -t port_6976; cd /home/user/wunschhimmel && tmux new -d -s port_6976 "bun dev --port 6976"
