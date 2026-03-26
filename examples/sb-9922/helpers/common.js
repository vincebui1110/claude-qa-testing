export async function waitForToast(context, text) {
  const toast = context.locator('.Polaris-Frame-Toast', {hasText: text});
  await toast.waitFor({state: 'visible', timeout: 10_000});
  return toast;
}

export async function waitForPageLoad(context) {
  await context.locator('.Polaris-Spinner')
    .waitFor({state: 'hidden', timeout: 15_000}).catch(() => {});
}

export async function selectTab(context, tabName) {
  await context.getByRole('tab', {name: tabName}).first().click();
  await waitForPageLoad(context);
}

export async function confirmModal(context, buttonText = 'Confirm') {
  const modal = context.locator('.Polaris-Modal-Dialog');
  await modal.waitFor({state: 'visible'});
  await modal.getByRole('button', {name: buttonText}).click();
}

export async function searchInTable(context, searchText) {
  const searchInput = context.getByPlaceholder(/search/i).first();
  await searchInput.clear();
  await searchInput.fill(searchText);
  await waitForPageLoad(context);
}

export async function waitForApi(page, urlPattern, method = 'POST') {
  const response = await page.waitForResponse(
    res => res.url().includes(urlPattern) && res.request().method() === method,
    {timeout: 15_000}
  );
  return response;
}
