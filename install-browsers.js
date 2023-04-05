const { playwright } = require('playwright-core');
const { installBrowsersWithProgressBar } = require('playwright/lib/install/installerWithProgressBar');

(async () => {
  await installBrowsersWithProgressBar(playwright);
})();
