/** 真实Header选项入口，旧独立按钮已被合并；不直接改Provider或存储模拟操作。 */
export async function setHeaderLocale(page, locale) {
  const trigger=page.locator('[data-display-settings]');
  if(await trigger.getAttribute('aria-expanded')!=='true')await trigger.click();
  await page.locator('#header-display-settings').getByRole('button',{name:locale==='en'?'English':'中文',exact:true}).click();
  await page.waitForFunction(value=>document.documentElement.lang===value,locale);
  await page.keyboard.press('Escape');
}
export async function setHeaderTheme(page, theme) {
  const trigger=page.locator('[data-display-settings]');
  if(await trigger.getAttribute('aria-expanded')!=='true')await trigger.click();
  await page.locator(`[data-theme-option="${theme}"]`).click();
  await page.waitForFunction(value=>document.documentElement.classList.contains('dark')===(value==='dark'),theme);
  await page.waitForFunction(()=>document.documentElement.dataset.magicuiThemeVt!=='active');
  await page.keyboard.press('Escape');
}
