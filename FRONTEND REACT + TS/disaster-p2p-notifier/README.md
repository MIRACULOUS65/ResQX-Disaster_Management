# DISASTER P2P NOTIFIER

## How to integrate:

1. `npm install`
2. `import { notifyAlert } from "./disaster-p2p-notifier/src";`
3. After your model returns (disasterType + severityLevel), call: 
   ```js
   await notifyAlert({
     disasterType, 
     severityLevel, 
     cid, 
     imageUrl, 
     location, 
     reporter, 
     timestamp
   });
   ```

## Notes:

- The module auto-starts the P2P node and subscriber when loaded on a page.
- For true offline multi-hop on phones, build the RN companion in `rn_companion/`.
- Make sure users grant Notification permission in-browser; ask them on first app-load.
