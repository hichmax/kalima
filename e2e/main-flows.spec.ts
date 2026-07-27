import { expect, test } from "@playwright/test";

test("landing connects to onboarding and learning space", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", {
      name: /Kalima, apprends l’arabe du Coran mot après mot/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/Un rituel simple de 5 mots par jour/i)).toBeVisible();
  await page.getByRole("link", { name: /Apprendre mes 5 premiers mots/i }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: /Reconnais-tu déjà/i })).toBeVisible();
});

test("daily challenge persists a complete five-word session", async ({ page }, testInfo) => {
  await page.goto("/defi");
  await expect(page.getByRole("heading", { name: /Écoute, prononce/i })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("daily-challenge.png"),
    fullPage: true,
  });
  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: /Révéler la réponse/i }).click();
    await page.getByRole("button", { name: /Correct/i }).click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Tes cinq mots sont terminés pour aujourd’hui.",
    }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("5 mots sur 5 terminés")).toBeVisible();
  await page.getByRole("button", { name: /Refaire les 5 mots/i }).click();
  await expect(page.getByLabel("0 mots sur 5 terminés")).toBeVisible();
  await expect(page.getByRole("button", { name: /Révéler la réponse/i })).toBeVisible();
});

test("reader words are inert until study mode", async ({ page }, testInfo) => {
  await page.goto("/coran");
  await page.waitForLoadState("networkidle");
  const readerWords = page.getByTestId("reader-word");
  await expect(readerWords.first()).toBeVisible();
  await expect(readerWords.first()).not.toHaveAttribute("role", "button");
  await page.getByTestId("ayah-reading-action").first().click();
  await expect(page).toHaveURL(/\/coran\/1\/1\/etude$/);
  await expect(page.getByTestId("study-word").first()).toBeVisible();
  const studyArabicSize = await page
    .locator(".word-button-arabic")
    .first()
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(studyArabicSize).toBeLessThanOrEqual(48);
  await page.getByTestId("study-word").nth(1).click();
  await expect(page.getByRole("complementary", { name: /Fiche du mot/i })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("study-word-view.png"),
    fullPage: true,
  });
});

test("review keeps difficult words until every word is easy", async ({ page }) => {
  await page.goto("/reviser");
  await expect(
    page.getByRole("heading", { name: /Combien de mots veux-tu réviser/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^5 mots$/i }).click();
  await page.getByRole("button", { name: /Commencer avec 5 mots/i }).click();

  const reviewedIds: string[] = [];
  reviewedIds.push(
    (await page.locator(".flashcard").getAttribute("data-review-unit-id")) || "",
  );
  await page.getByRole("button", { name: /Révéler la réponse/i }).click();
  await page.getByRole("button", { name: /Correct/i }).click();
  for (let index = 0; index < 5; index += 1) {
    reviewedIds.push(
      (await page.locator(".flashcard").getAttribute("data-review-unit-id")) || "",
    );
    await page.getByRole("button", { name: /Révéler la réponse/i }).click();
    await page.getByRole("button", { name: /Facile/i }).click();
  }
  await expect(
    page.getByRole("heading", { name: /5 mots faciles sur 5/i }),
  ).toBeVisible();

  const masteredIds = await page.evaluate(() => {
    const progress = JSON.parse(
      window.localStorage.getItem("kalima:progress:v2") || "{}",
    ) as { reviewMasteredWordIds?: string[] };
    return progress.reviewMasteredWordIds || [];
  });
  expect([...new Set(masteredIds)].sort()).toEqual(
    [...new Set(reviewedIds.filter(Boolean))].sort(),
  );

  await page.getByRole("button", { name: /Choisir une nouvelle séance/i }).click();
  await page.getByRole("button", { name: /Commencer avec 5 mots/i }).click();
  await expect(page.locator(".flashcard")).not.toHaveAttribute(
    "data-review-unit-id",
    new RegExp(`^(${masteredIds.join("|")})$`),
  );
});

test("review can stop at any time and show a summary", async ({ page }) => {
  await page.goto("/reviser");
  await page.getByRole("button", { name: /^5 mots$/i }).click();
  await page.getByRole("button", { name: /Commencer avec 5 mots/i }).click();
  await page.getByRole("button", { name: /Arrêter et voir le résumé/i }).click();
  await expect(
    page.getByRole("heading", { name: /0 mots faciles sur 5/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Reprendre les 5 mots/i }),
  ).toBeVisible();
});

test("onboarding calculates a useful tajwid starting point", async ({ page }) => {
  await page.goto("/onboarding");
  for (const answer of [
    "Toutes",
    "Oui, seul",
    "Entre 20 et 100",
    "Al-Fātiḥa seulement",
    "Améliorer mon tajwīd",
  ]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page.getByRole("button", { name: /Continuer/i }).click();
  }
  await page.getByRole("button", { name: /^10 min/i }).click();
  await page.getByRole("button", { name: /Continuer/i }).click();
  await expect(
    page.getByRole("heading", {
      name: /Commence par « Ce que le tajwīd cherche à préserver »/i,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Ouvrir mon parcours/i }).click();
  await expect(page).toHaveURL(/\/apprendre#tajweed-introduction$/);
  await expect(page.getByText(/Niveau détecté : Fondations du tajwīd/i)).toBeVisible();
});

test("learning path exposes the complete alphabet and sourced lessons", async ({ page }) => {
  await page.goto("/apprendre");
  await page.getByRole("button", { name: /Alphabet et sons/i }).click();
  const firstLesson = page.getByRole("button", {
    name: /Les 28 lettres et le sens de lecture/i,
  });
  await firstLesson.click();
  await expect(firstLesson).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#alphabet-overview")).toHaveClass(/open/);
  await expect(page.locator(".alphabet-grid article")).toHaveCount(28);
  await expect(page.getByRole("button", { name: "Écouter alif" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Écouter yāʾ" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Quelle forme correspond au nom « bāʾ » ?",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(async () => {
      const response = await fetch("/audio/alphabet/01-alif.wav");
      return response.status;
    }),
  ).toBe(200);
  await expect(page.getByText(/Unicode Standard — Arabic script/i)).toBeAttached();

  await page.getByRole("button", { name: "Fermer la leçon" }).click();
  await expect(firstLesson).toHaveAttribute("aria-expanded", "false");

  await page
    .getByRole("button", {
      name: /Une même silhouette, des points différents/i,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Quelle forme correspond au nom « tāʾ » ?",
    }),
  ).toBeVisible();
});

test("vocabulary defaults to occurrence sorting", async ({ page }) => {
  await page.goto("/vocabulaire");
  await expect(page.getByLabel("Trier par")).toHaveValue("occurrences-desc");
  const occurrenceCounts = await page
    .locator(".vocabulary-row")
    .evaluateAll((rows) =>
      rows.slice(0, 8).map((row) => {
        const match = row.textContent?.match(/(\d[\d\s]*) occurrences/u);
        return Number(match?.[1].replaceAll(" ", "") || 0);
      }),
    );
  expect(occurrenceCounts).toEqual(
    [...occurrenceCounts].sort((left, right) => right - left),
  );
});

test("progression records learned surahs locally", async ({ page }) => {
  await page.goto("/progression");
  const fatiha = page.getByRole("button", { name: /Al-Fātiḥa.*L’Ouverture/i });
  await fatiha.click();
  await expect(fatiha).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Al-Fātiḥa.*L’Ouverture/i }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("internal validation is protected by the local password", async ({ page }) => {
  await page.goto("/admin/validation");
  await expect(page.getByRole("heading", { name: /Validation des contenus/i })).toBeVisible();
  await expect(page.getByLabel(/Mot de passe administrateur/i)).toBeVisible();
});

test("admin opens the real local vocabulary review queue", async ({ page }) => {
  await page.goto("/admin/validation");
  const sessionStatus = await page.evaluate(async () => {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "hocinetnt" }),
    });
    return response.status;
  });
  expect(sessionStatus).toBe(200);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Vérifier les 1 000 mots/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/1 000 à vérifier|1000 à vérifier/i)).toBeVisible();
  await expect(page.getByLabel(/Traduction française proposée/i)).not.toHaveValue(
    /à vérifier|à valider/i,
  );
});

test("key pages fit every required breakpoint", async ({ page }, testInfo) => {
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
    { width: 360, height: 800 },
    { width: 844, height: 390 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/dashboard");
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow, `${viewport.width}px dashboard overflow`).toBe(false);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/apprendre", "/reviser", "/vocabulaire", "/progression"]) {
    await page.goto(route);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.screenshot({
    path: testInfo.outputPath("dashboard-mobile.png"),
    fullPage: true,
  });
});

test("dark theme persists and reduced motion is respected", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Activer le thème sombre/i }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const transitionDuration = await page
    .locator(".btn")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(parseFloat(transitionDuration)).toBeLessThanOrEqual(0.001);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .getByRole("heading", {
          name: /Bonsoir, prends le temps qu’il te faut/i,
        })
        .evaluate((element) => getComputedStyle(element).color),
    )
    .toBe("rgb(242, 237, 223)");
  await page.screenshot({
    path: testInfo.outputPath("dashboard-dark-mobile.png"),
    fullPage: true,
  });
});

test("reader visual captures", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/coran");
  await page.screenshot({
    path: testInfo.outputPath("reader-desktop.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/coran");
  await page.screenshot({
    path: testInfo.outputPath("reader-mobile.png"),
    fullPage: true,
  });
});
